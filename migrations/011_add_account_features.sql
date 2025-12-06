-- Migração para adicionar funcionalidades de privacidade e tipo corporativo às contas

-- ========= INÍCIO DA MIGRATION =========

-- -----------------------------------------------------
-- Tabela 'accounts': Adicionar novos campos
-- -----------------------------------------------------
ALTER TABLE public.accounts
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN is_corporate BOOLEAN NOT NULL DEFAULT FALSE;

-- Adiciona um comentário para explicar o novo campo 'is_public'
COMMENT ON COLUMN public.accounts.is_public IS 'Indica se a conta é visível para outros usuários (true) ou privada (false).';

-- Adiciona um comentário para explicar o novo campo 'is_corporate'
COMMENT ON COLUMN public.accounts.is_corporate IS 'Indica se a conta é de uso corporativo (true) ou pessoal (false).';

-- ========= FIM DA MIGRATION =========
