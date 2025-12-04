-- Migração SQL para CORRIGIR e adicionar políticas de Row-Level Security (RLS)
-- à tabela 'profiles', permitindo que os usuários gerenciem seus próprios dados
-- usando o EMAIL como link, para ser compatível com o schema existente.

-- ========= INÍCIO DA MIGRATION =========

-- Remover as políticas com erro da migração anterior, se existirem.
-- O 'IF EXISTS' garante que o comando não falhe se as políticas não existirem.
DROP POLICY IF EXISTS "Users can select their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Remover a política original também, para manter a consistência.
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;

-- -----------------------------------------------------
-- Políticas RLS Corrigidas para a tabela 'profiles'
-- -----------------------------------------------------

-- 1. Política de SELECT: Permite que um usuário leia o seu próprio perfil.
--    Usa auth.email() = email, pois `profiles.id` é um INTEGER e não pode ser comparado com auth.uid() (UUID).
CREATE POLICY "Users can select their own profile"
ON public.profiles FOR SELECT
USING ( auth.email() = email );

-- 2. Política de UPDATE: Permite que um usuário atualize o seu próprio perfil.
--    Esta é a política crucial que estava faltando.
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING ( auth.email() = email )
WITH CHECK ( auth.email() = email );

-- 3. Política de DELETE: Permite que um usuário delete a sua própria conta/perfil.
CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
USING ( auth.email() = email );


-- ========= FIM DA MIGRATION =========