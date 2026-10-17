CREATE TABLE IF NOT EXISTS books (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  author     VARCHAR(120) NOT NULL,
  pages      INTEGER CHECK (pages IS NULL OR pages > 0),
  status     VARCHAR(10) NOT NULL DEFAULT 'quero_ler'
             CHECK (status IN ('quero_ler', 'lendo', 'lido')),
  rating     SMALLINT CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  cover_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migração para bancos criados antes da coluna de capa (seguro rodar de novo)
ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url TEXT;

CREATE INDEX IF NOT EXISTS idx_books_status ON books (status);
