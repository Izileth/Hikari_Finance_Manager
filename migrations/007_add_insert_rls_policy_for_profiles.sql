-- Migração SQL para adicionar a política de INSERT RLS (Row-Level Security)
-- à tabela 'profiles'. Isso permite que um novo usuário registrado crie seu
-- próprio perfil correspondente.

-- ========= INÍCIO DA MIGRATION =========

-- Política de INSERT: Permite que um usuário autenticado insira (crie) seu próprio perfil.
-- A verificação `auth.email() = email` garante que um usuário só pode criar um perfil
-- que corresponda ao seu próprio email de autenticação, impedindo que criem perfis
-- para outros usuários.
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK ( auth.email() = email );

-- ========= FIM DA MIGRATION =========
