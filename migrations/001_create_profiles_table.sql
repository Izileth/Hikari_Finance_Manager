-- Migração SQL para criar a tabela 'profiles' e funcionalidades associadas

-- Observações Importantes:
-- 1. Gestão de Imagens: O banco de dados armazena apenas as URLs das imagens ('avatar_url', 'banner_url').
--    A lógica de upload do arquivo de imagem deve ser tratada pela sua aplicação, que enviará
--    a imagem para um serviço de armazenamento (ex: AWS S3, Google Cloud Storage) e obterá a URL.
-- 2. Segurança de Senhas: O campo 'password' deve armazenar senhas criptograficamente hashadas (ex: com bcrypt),
--    NUNCA em texto puro. A aplicação deve ser responsável por gerar e verificar esses hashes.
-- 3. Geração de Slugs: O 'slug' é gerado automaticamente por um gatilho no banco de dados ao criar um perfil.
--    Ele é baseado no 'nickname' ou 'name' e sua unicidade é garantida.

-- ========= INÍCIO DA MIGRATION =========

-- -----------------------------------------------------
-- Função 1: Slugify - Converte um texto para um formato de slug amigável.
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION slugify(text_to_slug TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Remove espaços no início/fim e converte para minúsculas
    text_to_slug := lower(trim(text_to_slug));
    -- Substitui caracteres não alfanuméricos por hífen
    text_to_slug := regexp_replace(text_to_slug, '[^a-z0-9]+', '-', 'g');
    -- Remove múltiplos hífens consecutivos
    text_to_slug := regexp_replace(text_to_slug, '-{2,}', '-', 'g');
    -- Remove hífens no início ou no fim
    text_to_slug := regexp_replace(text_to_slug, '^-|-$', '', 'g');
    RETURN text_to_slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- -----------------------------------------------------
-- Função 2: Define e Garante a Unicidade do Slug para um Novo Perfil
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION set_profile_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INT := 0;
BEGIN
    -- Gera o slug inicial apenas se ele não for fornecido
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        -- Usa o apelido, ou o nome, ou 'user' como base para o slug
        base_slug := slugify(COALESCE(NEW.nickname, NEW.name, 'user'));
        final_slug := base_slug;

        -- Verifica se o slug já existe e adiciona um sufixo numérico se necessário
        LOOP
            IF NOT EXISTS (SELECT 1 FROM profiles WHERE slug = final_slug) THEN
                EXIT; -- Encontrou um slug único, sai do loop
            END IF;
            -- Se não for único, incrementa o contador e tenta novamente
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;

        NEW.slug := final_slug;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------
-- Função 3: Atualiza o carimbo de data/hora 'updated_at'
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------
-- Tabela Principal: 'profiles'
-- -----------------------------------------------------
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    avatar_url TEXT,
    banner_url TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL, -- Será preenchido automaticamente pelo gatilho 'set_profile_slug_trigger'
    bio TEXT,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adiciona índices para otimizar buscas
CREATE INDEX idx_profiles_email ON profiles (email);
CREATE INDEX idx_profiles_slug ON profiles (slug);

-- -----------------------------------------------------
-- Gatilhos (Triggers)
-- -----------------------------------------------------
-- Gatilho 1: Gera o slug antes de inserir um novo perfil
CREATE TRIGGER set_profile_slug_trigger
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_profile_slug();

-- Gatilho 2: Atualiza o campo 'updated_at' antes de uma modificação no perfil
CREATE TRIGGER update_profile_updated_at_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ========= FIM DA MIGRATION =========
