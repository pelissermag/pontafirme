-- 1. Criar a tabela settings
CREATE TABLE IF NOT EXISTS settings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Habilitar RLS (Segurança)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 3. Permitir leitura pública (para a Home)
DROP POLICY IF EXISTS "leitura_publica_settings" ON settings;
CREATE POLICY "leitura_publica_settings" ON settings 
FOR SELECT TO anon, authenticated USING (true);

-- 4. Permitir edição para administradores
DROP POLICY IF EXISTS "escrita_admin_settings" ON settings;
CREATE POLICY "escrita_admin_settings" ON settings 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Inserir dados iniciais
INSERT INTO settings (key, value) VALUES 
('hero_title', 'PONTA FIRME FC'),
('hero_tagline', 'FORÇA, TRADIÇÃO E RAÇA NO FUTEBOL AMADOR'),
('sobre_texto', 'Conte a história do clube aqui...')
ON CONFLICT (key) DO NOTHING;
