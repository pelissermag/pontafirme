# Prompt — Banco de Dados Supabase (Ponta Firme)
> Migração de MariaDB (phpMyAdmin) → PostgreSQL (Supabase)
> Banco original: `u838558485_pontafirme_db`

---

## CONTEXTO DO BANCO ORIGINAL

O banco veio de um site PHP hospedado em servidor compartilhado com MariaDB 11.8.
As tabelas existentes são:

| Tabela | Descrição |
|---|---|
| `admins` | Usuários administradores do painel |
| `admin_logs` | Log de ações dos admins |
| `jogadores` | Cadastro de jogadores do grupo |
| `eventos_fotos` | Álbuns/eventos de fotos |
| `fotos` | Fotos vinculadas a cada evento |
| `eventos_videos` | Álbuns/eventos de vídeos |
| `videos` | Vídeos vinculados a cada evento (arquivo ou link) |
| `login_attempts` | Controle de tentativas de login (brute force) |

---

## PROMPT PARA O AGENTE

```
Você é um engenheiro de banco de dados especializado em migração MySQL/MariaDB → PostgreSQL com Supabase.

Vou te fornecer o schema de um banco MariaDB de um site de grupo de futebol chamado "Ponta Firme".
Preciso que você:

1. Converta o schema para PostgreSQL nativo (sem sintaxe MySQL)
2. Adicione Row Level Security (RLS) do Supabase nas tabelas corretas
3. Configure Storage Buckets para os arquivos de mídia
4. Gere o SQL final pronto para rodar no Supabase SQL Editor
5. Gere o arquivo de variáveis de ambiente para o projeto React

---

### SCHEMA ORIGINAL (MariaDB)

**Tabela: admins**
```sql
CREATE TABLE admins (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  role ENUM('master','admin','pendente','rejeitado') NOT NULL DEFAULT 'pendente',
  status TINYINT(1) NOT NULL DEFAULT 0,
  token_aprovacao VARCHAR(255) DEFAULT NULL,
  token_expira DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Tabela: admin_logs**
```sql
CREATE TABLE admin_logs (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admin_id INT DEFAULT NULL,
  action VARCHAR(120) NOT NULL,
  details TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);
```

**Tabela: jogadores**
```sql
CREATE TABLE jogadores (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  idade INT NOT NULL,
  foto VARCHAR(255) DEFAULT NULL,
  historia TEXT DEFAULT NULL,
  ano_entrada YEAR NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tabela: eventos_fotos**
```sql
CREATE TABLE eventos_fotos (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nome_evento VARCHAR(255) NOT NULL,
  data_evento DATE NOT NULL,
  capa VARCHAR(255) DEFAULT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tabela: fotos**
```sql
CREATE TABLE fotos (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_evento INT NOT NULL,
  caminho_arquivo VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_evento) REFERENCES eventos_fotos(id) ON DELETE CASCADE
);
```

**Tabela: eventos_videos**
```sql
CREATE TABLE eventos_videos (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nome_evento VARCHAR(255) NOT NULL,
  data_evento DATE NOT NULL,
  capa_video VARCHAR(255) DEFAULT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tabela: videos**
```sql
CREATE TABLE videos (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_evento INT NOT NULL,
  caminho_video VARCHAR(255) NOT NULL,
  thumbnail VARCHAR(255) DEFAULT NULL,
  tipo ENUM('arquivo','link') NOT NULL DEFAULT 'arquivo',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_evento) REFERENCES eventos_videos(id) ON DELETE CASCADE
);
```

**Tabela: login_attempts**
```sql
CREATE TABLE login_attempts (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  attempts INT DEFAULT 0,
  last_attempt DATETIME DEFAULT NULL,
  locked_until DATETIME DEFAULT NULL
);
```

---

### CONVERSÕES NECESSÁRIAS

Execute estas conversões ao gerar o SQL para PostgreSQL:

1. `AUTO_INCREMENT` → `GENERATED ALWAYS AS IDENTITY`
2. `TINYINT(1)` → `BOOLEAN`
3. `DATETIME` → `TIMESTAMPTZ`
4. `YEAR(4)` → `SMALLINT` (não existe tipo YEAR no PostgreSQL)
5. `ENUM('arquivo','link')` → `TEXT` com `CHECK (tipo IN ('arquivo','link'))`
6. `ENUM('master','admin','pendente','rejeitado')` → `TEXT` com CHECK constraint
7. `ON UPDATE CURRENT_TIMESTAMP` → trigger separado no PostgreSQL (não é suportado inline)
8. `ENGINE=InnoDB`, `CHARSET=utf8mb4`, `COLLATE` → remover (não existe no PostgreSQL)

---

### ROW LEVEL SECURITY (RLS)

Configure RLS com as seguintes regras:

**Tabelas PÚBLICAS (leitura anônima permitida):**
- `jogadores` — qualquer pessoa pode ver (site público)
- `eventos_fotos` — qualquer pessoa pode ver
- `fotos` — qualquer pessoa pode ver
- `eventos_videos` — qualquer pessoa pode ver
- `videos` — qualquer pessoa pode ver

**Tabelas PRIVADAS (apenas admins autenticados):**
- `admins` — apenas o próprio usuário autenticado + role master
- `admin_logs` — apenas usuários autenticados com role admin ou master
- `login_attempts` — apenas usuários autenticados

Para cada tabela pública, gere:
```sql
ALTER TABLE <tabela> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leitura_publica" ON <tabela>
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "escrita_admin" ON <tabela>
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

---

### STORAGE BUCKETS

Crie 3 buckets no Supabase Storage:

1. **`fotos`** — para imagens dos eventos de fotos
   - Público: SIM (leitura pública)
   - Tipos permitidos: image/jpeg, image/png, image/webp
   - Tamanho máximo: 10MB

2. **`videos`** — para arquivos de vídeo e thumbnails
   - Público: SIM
   - Tipos permitidos: video/mp4, video/webm, image/jpeg, image/png
   - Tamanho máximo: 500MB

3. **`jogadores`** — para fotos dos jogadores
   - Público: SIM
   - Tipos permitidos: image/jpeg, image/png, image/webp
   - Tamanho máximo: 5MB

Gere o SQL das políticas de storage:
```sql
-- Leitura pública em todos os buckets de mídia
CREATE POLICY "public_read_fotos" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'fotos');

-- Upload apenas para autenticados
CREATE POLICY "auth_upload_fotos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'fotos');
```
(repita para 'videos' e 'jogadores')

---

### TRIGGER DE updated_at

Crie uma função reutilizável para updated_at (equivalente ao ON UPDATE do MySQL):

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

### AUTENTICAÇÃO

O sistema original usava autenticação própria com senha_hash (bcrypt via PHP).
Para o novo sistema em React + Supabase:

- Use o **Supabase Auth** nativo (tabela `auth.users`) para login dos admins
- A tabela `admins` customizada deve ter um campo `user_id UUID` linkado a `auth.users.id`
- O campo `senha_hash` pode ser removido (o Supabase Auth gerencia senhas)
- Mantenha `role`, `status`, `nome` na tabela `admins` para controle de permissões

Gere também:
- Função de trigger que cria um registro em `admins` automaticamente quando um usuário é criado no Supabase Auth
- Policy de RLS que usa `auth.uid()` para verificar o usuário logado

---

### ARQUIVO .env PARA REACT

Gere um arquivo `.env.example` com todas as variáveis necessárias:

```env
# Supabase
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Storage base URL (para montar URLs das fotos)
VITE_SUPABASE_STORAGE_URL=https://SEU_PROJECT_ID.supabase.co/storage/v1/object/public

# App
VITE_APP_NAME=Ponta Firme
VITE_APP_URL=https://seu-site.vercel.app
```

---

### CLIENTE SUPABASE EM REACT

Gere o arquivo `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper para montar URL pública de arquivo no Storage
export function storageUrl(bucket, filename) {
  if (!filename) return null
  return `${import.meta.env.VITE_SUPABASE_STORAGE_URL}/${bucket}/${filename}`
}
```

---

### FUNÇÕES DE QUERY PARA O FRONTEND

Gere um arquivo `src/lib/queries.js` com as queries prontas para cada página:

**Jogadores:**
```javascript
// Buscar todos os jogadores ordenados por ano_entrada
export async function getJogadores() {
  const { data, error } = await supabase
    .from('jogadores')
    .select('*')
    .order('ano_entrada', { ascending: true })
  return { data, error }
}
```

**Fotos (com eventos):**
```javascript
// Buscar eventos com contagem de fotos
export async function getEventosFotos() {
  const { data, error } = await supabase
    .from('eventos_fotos')
    .select('*, fotos(count)')
    .order('data_evento', { ascending: false })
  return { data, error }
}

// Buscar fotos de um evento específico
export async function getFotosByEvento(eventoId) {
  const { data, error } = await supabase
    .from('fotos')
    .select('*')
    .eq('id_evento', eventoId)
    .order('criado_em', { ascending: true })
  return { data, error }
}
```

**Vídeos (com eventos):**
```javascript
// Buscar eventos de vídeo
export async function getEventosVideos() {
  const { data, error } = await supabase
    .from('eventos_videos')
    .select('*, videos(count)')
    .order('data_evento', { ascending: false })
  return { data, error }
}

// Buscar vídeos de um evento
export async function getVideosByEvento(eventoId) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id_evento', eventoId)
    .order('criado_em', { ascending: true })
  return { data, error }
}
```

---

### ORDEM DE EXECUÇÃO NO SUPABASE

Ao gerar o SQL final, organize na seguinte ordem para evitar erros de dependência:

1. Extensões necessárias (`uuid-ossp`)
2. Função `update_updated_at()`
3. Tabela `admins` (sem FK ainda)
4. Tabela `admin_logs` (FK para admins)
5. Tabela `eventos_fotos`
6. Tabela `fotos` (FK para eventos_fotos)
7. Tabela `eventos_videos`
8. Tabela `videos` (FK para eventos_videos)
9. Tabela `login_attempts`
10. Triggers
11. RLS policies (tabelas)
12. Storage buckets e policies

---

### RESULTADO ESPERADO

Entregue 4 arquivos:

1. **`supabase_schema.sql`** — SQL completo para rodar no Supabase SQL Editor (tudo em um arquivo)
2. **`supabase_storage.sql`** — SQL de buckets e políticas de storage (separado pois às vezes precisa rodar depois)
3. **`.env.example`** — Variáveis de ambiente para o React
4. **`src/lib/supabase.js`** + **`src/lib/queries.js`** — Cliente e queries prontas

O SQL deve ser 100% PostgreSQL sem nenhuma sintaxe MySQL. Deve rodar sem erros no Supabase SQL Editor. Comente cada seção para facilitar manutenção futura.
```

---

## NOTAS IMPORTANTES PARA A MIGRAÇÃO

### Sobre os arquivos de mídia (fotos e vídeos)
O banco original armazena apenas os **nomes dos arquivos** (ex: `691dd96dbf45a_1763563885.jpg`).
Os arquivos físicos estão no servidor PHP antigo. Você precisará:
1. Fazer download de todos os arquivos do servidor antigo via FTP/SSH
2. Fazer upload para os buckets correspondentes no Supabase Storage mantendo os mesmos nomes
3. A URL pública ficará: `https://SEU_PROJECT.supabase.co/storage/v1/object/public/fotos/NOME_ARQUIVO.jpg`

### Sobre os admins
O único admin cadastrado é `dev.pelisser@gmail.com` com role `master`.
No Supabase, você deve criar este usuário via **Authentication → Users → Add User** no dashboard,
e depois inserir manualmente na tabela `admins` com o `user_id` gerado.

### Dados existentes
O banco tem dados reais que você vai querer manter:
- **26 eventos de fotos** (de Nov/2025 a Abr/2026)
- **24 eventos de vídeos**
- **16+ jogadores cadastrados**
- Centenas de fotos e vídeos vinculados

Após rodar o schema, insira os dados com INSERTs adaptados do backup original.