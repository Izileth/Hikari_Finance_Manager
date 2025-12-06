-- Migração para adicionar novos campos e funcionalidades financeiras

-- ========= INÍCIO DA MIGRATION =========

-- -----------------------------------------------------
-- Tabela 'transactions': Adicionar novos campos
-- -----------------------------------------------------
ALTER TABLE public.transactions
ADD COLUMN title VARCHAR(255),
ADD COLUMN is_corporate BOOLEAN NOT NULL DEFAULT FALSE;

-- Adiciona um comentário para explicar o novo campo 'title'
COMMENT ON COLUMN public.transactions.title IS 'Um título curto e descritivo para a transação, complementando a descrição.';

-- Adiciona um comentário para explicar o novo campo 'is_corporate'
COMMENT ON COLUMN public.transactions.is_corporate IS 'Marca se a transação é uma despesa ou receita corporativa, para separação de contas pessoais.';



-- ========= FIM DA MIGRATION =========
