-- ============================================================================
-- SITE ROMÂNTICO - SCHEMA SQL PARA SUPABASE
-- ============================================================================
-- Este arquivo contém todas as tabelas, políticas de RLS e configurações
-- necessárias para o funcionamento do site romântico.
-- 
-- INSTRUÇÕES DE USO:
-- 1. Acesse o Supabase Console (https://app.supabase.com)
-- 2. Vá para o seu projeto
-- 3. Clique em "SQL Editor" no menu lateral
-- 4. Clique em "New Query"
-- 5. Cole todo o conteúdo deste arquivo
-- 6. Clique em "Run" para executar
-- ============================================================================

-- ============================================================================
-- 1. TABELA: config
-- Armazena as configurações globais do site
-- ============================================================================
CREATE TABLE IF NOT EXISTS config (
  id BIGINT PRIMARY KEY DEFAULT 1,
  nome_casal VARCHAR(255) NOT NULL DEFAULT 'Nosso Casal',
  inicio_relacionamento DATE NOT NULL DEFAULT CURRENT_DATE,
  ultima_vez_vistos DATE NOT NULL DEFAULT CURRENT_DATE,
  proximo_encontro DATE NOT NULL DEFAULT CURRENT_DATE,
  modo_noturno BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. TABELA: recadinhos
-- Armazena as mensagens do casal
-- ============================================================================
CREATE TABLE IF NOT EXISTS recadinhos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  autor VARCHAR(120) NOT NULL,
  mensagem VARCHAR(200) NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  aprovado BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================================
-- 3. TABELA: fotos
-- Armazena as URLs das fotos hospedadas no Cloudinary
-- ============================================================================
CREATE TABLE IF NOT EXISTS fotos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  url VARCHAR(500) NOT NULL,
  public_id VARCHAR(255),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. TABELA: agenda
-- Armazena as datas especiais e eventos
-- ============================================================================
CREATE TABLE IF NOT EXISTS agenda (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  titulo VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  mensagem TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- ============================================================================
-- 5. TABELA: surpresas
-- Surpresas agendadas por usuário
-- ============================================================================
CREATE TABLE IF NOT EXISTS surpresas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  titulo VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  mensagem TEXT NOT NULL,
  foto_id BIGINT REFERENCES fotos(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_by_email VARCHAR(255),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ATIVAR ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE recadinhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE surpresas ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS DE RLS - LEITURA PÚBLICA
-- ============================================================================

-- Política de leitura pública para config
CREATE POLICY "config_read_public" ON config
  FOR SELECT
  USING (true);

-- Política de leitura pública para recadinhos (apenas aprovados)
CREATE POLICY "recadinhos_read_public" ON recadinhos
  FOR SELECT
  USING (aprovado = true);

-- Política de leitura pública para fotos
CREATE POLICY "fotos_read_public" ON fotos
  FOR SELECT
  USING (true);

-- Política de leitura pública para agenda
CREATE POLICY "agenda_read_public" ON agenda
  FOR SELECT
  USING (true);

-- Política de leitura pública para surpresas
CREATE POLICY "surpresas_read_public" ON surpresas
  FOR SELECT
  USING (true);

-- ============================================================================
-- POLÍTICAS DE RLS - ESCRITA PÚBLICA (para simplicidade)
-- ============================================================================

-- Política de inserção pública para recadinhos
CREATE POLICY "recadinhos_insert_public" ON recadinhos
  FOR INSERT
  WITH CHECK (true);

-- Política de inserção pública para fotos
CREATE POLICY "fotos_insert_public" ON fotos
  FOR INSERT
  WITH CHECK (true);

-- Política de inserção para usuários autenticados na agenda
CREATE POLICY "agenda_insert_auth" ON agenda
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política de inserção para usuários autenticados em surpresas
CREATE POLICY "surpresas_insert_auth" ON surpresas
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Política de atualização para usuários autenticados na config
CREATE POLICY "config_update_auth" ON config
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política de atualização para usuários autenticados nos recadinhos
CREATE POLICY "recadinhos_update_auth" ON recadinhos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política de atualização para dono/admin da surpresa
CREATE POLICY "surpresas_update_owner" ON surpresas
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Política de deleção para usuários autenticados em fotos
CREATE POLICY "fotos_delete_auth" ON fotos
  FOR DELETE
  TO authenticated
  USING (true);

-- Política de deleção para usuários autenticados em recadinhos
CREATE POLICY "recadinhos_delete_auth" ON recadinhos
  FOR DELETE
  TO authenticated
  USING (true);

-- Política de deleção para usuários autenticados em agenda
CREATE POLICY "agenda_delete_auth" ON agenda
  FOR DELETE
  TO authenticated
  USING (true);

-- Política de deleção para o autor da surpresa
CREATE POLICY "surpresas_delete_owner" ON surpresas
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- ============================================================================
-- INSERIR DADOS INICIAIS
-- ============================================================================

-- Inserir configuração inicial
INSERT INTO config (id, nome_casal, inicio_relacionamento, ultima_vez_vistos, proximo_encontro)
VALUES (1, 'Nosso Casal', CURRENT_DATE, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CRIAR ÍNDICES PARA MELHOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_recadinhos_aprovado ON recadinhos(aprovado);
CREATE INDEX IF NOT EXISTS idx_recadinhos_criado_em ON recadinhos(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_fotos_criado_em ON fotos(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_agenda_data ON agenda(data);
CREATE INDEX IF NOT EXISTS idx_surpresas_data ON surpresas(data);

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
