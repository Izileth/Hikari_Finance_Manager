-- Migração SQL para criar as tabelas financeiras básicas

-- ========= INÍCIO DA MIGRATION =========

-- -----------------------------------------------------
-- Tipos Enumerados (ENUMs) para padronização
-- -----------------------------------------------------
CREATE TYPE account_type AS ENUM ('checking', 'savings', 'credit_card', 'investment', 'cash');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- -----------------------------------------------------
-- Tabela 1: 'accounts' - Contas financeiras do usuário
-- -----------------------------------------------------
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    profile_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type account_type NOT NULL,
    initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    color VARCHAR(7), -- Cor em formato Hex (ex: '#FF5733') para UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_profile
        FOREIGN KEY(profile_id) 
        REFERENCES profiles(id)
        ON DELETE CASCADE -- Se o perfil for deletado, suas contas também serão.
);

-- Gatilho para atualizar 'updated_at' na tabela 'accounts'
CREATE TRIGGER update_account_updated_at_trigger
BEFORE UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------
-- Tabela 2: 'transaction_categories' - Categorias para transações
-- -----------------------------------------------------
CREATE TABLE transaction_categories (
    id SERIAL PRIMARY KEY,
    profile_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type transaction_type NOT NULL, -- 'income' para receitas, 'expense' para despesas
    parent_category_id INT, -- Para suportar sub-categorias (ex: Alimentação -> Restaurante)
    icon_name VARCHAR(50), -- Nome de um ícone para a UI
    color VARCHAR(7), -- Cor em formato Hex para a UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_profile
        FOREIGN KEY(profile_id) 
        REFERENCES profiles(id)
        ON DELETE CASCADE, -- Se o perfil for deletado, suas categorias também serão.
    
    CONSTRAINT fk_parent_category
        FOREIGN KEY(parent_category_id)
        REFERENCES transaction_categories(id)
        ON DELETE SET NULL -- Se a categoria pai for deletada, a sub-categoria se torna uma categoria principal.
);

-- Gatilho para atualizar 'updated_at' na tabela 'transaction_categories'
CREATE TRIGGER update_transaction_category_updated_at_trigger
BEFORE UPDATE ON transaction_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------
-- Tabela 3: 'transactions' - Registros de movimentações financeiras
-- -----------------------------------------------------
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    profile_id INT NOT NULL,
    account_id INT NOT NULL,
    category_id INT, -- Pode ser nulo, especialmente para transferências
    description VARCHAR(255) NOT NULL,
    -- Valor da transação. Positivo para receitas, negativo para despesas.
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    -- ID para agrupar as duas partes de uma transferência. Nulo se não for transferência.
    transfer_group_id UUID, 
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_profile
        FOREIGN KEY(profile_id) 
        REFERENCES profiles(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_account
        FOREIGN KEY(account_id)
        REFERENCES accounts(id)
        ON DELETE CASCADE, -- Se a conta for deletada, suas transações também são.

    CONSTRAINT fk_category
        FOREIGN KEY(category_id)
        REFERENCES transaction_categories(id)
        ON DELETE SET NULL -- Se a categoria for deletada, a transação fica sem categoria.
);

-- Adiciona índices para otimizar buscas em 'transactions'
CREATE INDEX idx_transactions_profile_id ON transactions (profile_id);
CREATE INDEX idx_transactions_account_id ON transactions (account_id);
CREATE INDEX idx_transactions_transaction_date ON transactions (transaction_date);

-- Gatilho para atualizar 'updated_at' na tabela 'transactions'
CREATE TRIGGER update_transaction_updated_at_trigger
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------
-- Tabela 4: 'budgets' - Orçamentos mensais para categorias
-- -----------------------------------------------------
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    profile_id INT NOT NULL,
    category_id INT NOT NULL,
    -- Valor total orçado para o período
    amount DECIMAL(15, 2) NOT NULL,
    -- Mês e ano a que o orçamento se aplica
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Garante que só pode haver um orçamento por categoria por mês/ano para um usuário
    UNIQUE(profile_id, category_id, month, year),

    CONSTRAINT fk_profile
        FOREIGN KEY(profile_id) 
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_category
        FOREIGN KEY(category_id)
        REFERENCES transaction_categories(id)
        ON DELETE CASCADE -- Se a categoria for deletada, o orçamento para ela também é.
);

-- Gatilho para atualizar 'updated_at' na tabela 'budgets'
CREATE TRIGGER update_budget_updated_at_trigger
BEFORE UPDATE ON budgets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========= FIM DA MIGRATION =========
