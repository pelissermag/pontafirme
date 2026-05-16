-- ############################################################
-- SUPABASE SCHEMA - PONTA FIRME FC
-- Migração de MariaDB -> PostgreSQL
-- ############################################################

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Função para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Tabela: admins (Linkada ao Auth do Supabase)
CREATE TABLE admins (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('master', 'admin', 'pendente', 'rejeitado')) DEFAULT 'pendente',
  status BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela: admin_logs
CREATE TABLE admin_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela: jogadores
CREATE TABLE jogadores (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome TEXT NOT NULL,
  idade INT NOT NULL,
  foto TEXT,
  historia TEXT,
  ano_entrada SMALLINT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela: eventos_fotos
CREATE TABLE eventos_fotos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome_evento TEXT NOT NULL,
  data_evento DATE NOT NULL,
  capa TEXT,
  criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela: fotos
CREATE TABLE fotos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_evento BIGINT REFERENCES eventos_fotos(id) ON DELETE CASCADE,
  caminho_arquivo TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela: eventos_videos
CREATE TABLE eventos_videos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome_evento TEXT NOT NULL,
  data_evento DATE NOT NULL,
  capa_video TEXT,
  criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabela: videos
CREATE TABLE videos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_evento BIGINT REFERENCES eventos_videos(id) ON DELETE CASCADE,
  caminho_video TEXT NOT NULL,
  thumbnail TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('arquivo', 'link')) DEFAULT 'arquivo',
  criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabela: login_attempts
CREATE TABLE login_attempts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL,
  attempts INT DEFAULT 0,
  last_attempt TIMESTAMPTZ,
  locked_until TIMESTAMPTZ
);

-- 11. Tabela: settings (Para o "Sobre" e outras configs)
CREATE TABLE settings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tabela: patrocinadores
CREATE TABLE patrocinadores (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome TEXT NOT NULL,
  logo_url TEXT,
  link_url TEXT,
  status BOOLEAN DEFAULT true,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ############################################################
-- TRIGGERS
-- ############################################################

-- Trigger de updated_at para admins
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Função para criar registro em admins ao criar usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admins (user_id, nome, email, role, status)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Novo Admin'), NEW.email, 'pendente', false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para o handle_new_user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ############################################################
-- ROW LEVEL SECURITY (RLS)
-- ############################################################

-- Habilitar RLS em todas as tabelas
ALTER TABLE jogadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrocinadores ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas (Seleção anônima permitida)
CREATE POLICY "leitura_publica_jogadores" ON jogadores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "leitura_publica_eventos_fotos" ON eventos_fotos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "leitura_publica_fotos" ON fotos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "leitura_publica_eventos_videos" ON eventos_videos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "leitura_publica_videos" ON videos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "leitura_publica_settings" ON settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "leitura_publica_patrocinadores" ON patrocinadores FOR SELECT TO anon, authenticated USING (true);

-- Políticas Administrativas (Apenas autenticados)
CREATE POLICY "escrita_admin_jogadores" ON jogadores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "escrita_admin_eventos_fotos" ON eventos_fotos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "escrita_admin_fotos" ON fotos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "escrita_admin_eventos_videos" ON eventos_videos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "escrita_admin_videos" ON videos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "escrita_admin_settings" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "escrita_admin_patrocinadores" ON patrocinadores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Política para a tabela admins
CREATE POLICY "admins_view_own" ON admins FOR SELECT TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND role = 'master'));
CREATE POLICY "admins_master_all" ON admins FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND role = 'master'));

-- Política para logs
CREATE POLICY "logs_view_admin" ON admin_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "logs_insert_system" ON admin_logs FOR INSERT TO authenticated WITH CHECK (true);
