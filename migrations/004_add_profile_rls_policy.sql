-- Migração SQL para adicionar a política de Row-Level Security (RLS)
-- à tabela 'profiles', permitindo que os usuários leiam seus próprios perfis.

-- A RLS está habilitada por padrão na tabela 'profiles'. Esta política
-- garante que um usuário autenticado pode selecionar (ler) registros
-- onde o email do perfil corresponde ao email do usuário autenticado.

-- ========= INÍCIO DA MIGRATION =========

CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING ( auth.email() = email );

-- ========= FIM DA MIGRATION =========
