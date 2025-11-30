-- Migração SQL para criar as tabelas do feed social interativo

-- ========= INÍCIO DA MIGRATION =========

-- -----------------------------------------------------
-- Tipos Enumerados (ENUMs) para o sistema de feed
-- -----------------------------------------------------
-- Define os tipos de conteúdo que podem ser postados
CREATE TYPE feed_post_type AS ENUM ('manual', 'achievement', 'metric_snapshot', 'transaction_share');
-- Define os níveis de privacidade de um post
CREATE TYPE post_privacy_level AS ENUM ('public', 'followers_only', 'private');

-- -----------------------------------------------------
-- Tabela 1: 'followers' - Relação de quem segue quem
-- -----------------------------------------------------
CREATE TABLE followers (
    follower_id INT NOT NULL, -- O ID do perfil que está seguindo
    following_id INT NOT NULL, -- O ID do perfil que está sendo seguido
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Chave primária composta para garantir que um usuário não siga o mesmo perfil múltiplas vezes
    PRIMARY KEY (follower_id, following_id),

    CONSTRAINT fk_follower
        FOREIGN KEY(follower_id) 
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_following
        FOREIGN KEY(following_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE,
    
    -- Um usuário não pode seguir a si mesmo
    CHECK (follower_id <> following_id)
);

-- -----------------------------------------------------
-- Tabela 2: 'feed_posts' - Os posts do feed
-- -----------------------------------------------------
CREATE TABLE feed_posts (
    id SERIAL PRIMARY KEY,
    profile_id INT NOT NULL,
    post_type feed_post_type NOT NULL DEFAULT 'manual',
    privacy_level post_privacy_level NOT NULL DEFAULT 'followers_only',
    title VARCHAR(255),
    description TEXT,
    
    -- JSONB para dados financeiros compartilhados de forma flexível e anônima/agregada.
    -- Ex: {"metric": "taxa_de_poupanca", "value": "15%", "period": "Outubro 2025"}
    -- Ex: {"achievement": "meta_orcamento_comida", "value": "-R$50", "category": "Alimentação"}
    shared_data JSONB,

    -- Chaves estrangeiras opcionais para vincular o post a dados financeiros específicos
    source_transaction_id INT,
    source_budget_id INT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_profile
        FOREIGN KEY(profile_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_source_transaction
        FOREIGN KEY(source_transaction_id)
        REFERENCES transactions(id)
        ON DELETE SET NULL, -- Se a transação original for deletada, o link no post é removido

    CONSTRAINT fk_source_budget
        FOREIGN KEY(source_budget_id)
        REFERENCES budgets(id)
        ON DELETE SET NULL -- Se o orçamento original for deletado, o link no post é removido
);

-- Gatilho para 'updated_at' na tabela 'feed_posts'
CREATE TRIGGER update_feed_post_updated_at_trigger
BEFORE UPDATE ON feed_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------
-- Tabela 3: 'post_likes' - Curtidas nos posts
-- -----------------------------------------------------
CREATE TABLE post_likes (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    profile_id INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Garante que um usuário só pode curtir um post uma vez
    UNIQUE (post_id, profile_id),

    CONSTRAINT fk_post
        FOREIGN KEY(post_id)
        REFERENCES feed_posts(id)
        ON DELETE CASCADE, -- Se o post for deletado, as curtidas também são

    CONSTRAINT fk_profile
        FOREIGN KEY(profile_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE -- Se o perfil for deletado, suas curtidas também são
);

-- -----------------------------------------------------
-- Tabela 4: 'post_comments' - Comentários nos posts
-- -----------------------------------------------------
CREATE TABLE post_comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    profile_id INT NOT NULL,
    parent_comment_id INT, -- Para suportar respostas a comentários (threaded comments)
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_post
        FOREIGN KEY(post_id)
        REFERENCES feed_posts(id)
        ON DELETE CASCADE, -- Se o post for deletado, os comentários também são

    CONSTRAINT fk_profile
        FOREIGN KEY(profile_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE, -- Se o perfil for deletado, seus comentários também são
    
    CONSTRAINT fk_parent_comment
        FOREIGN KEY(parent_comment_id)
        REFERENCES post_comments(id)
        ON DELETE CASCADE -- Se um comentário pai for deletado, suas respostas também são
);

-- Gatilho para 'updated_at' na tabela 'post_comments'
CREATE TRIGGER update_post_comment_updated_at_trigger
BEFORE UPDATE ON post_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ========= FIM DA MIGRATION =========
