-- Migração SQL para CONSOLIDAR e garantir todas as políticas de Row-Level Security (RLS)
-- para a tabela 'profiles', permitindo operações seguras de SELECT, INSERT, UPDATE e DELETE
-- baseadas no email do usuário autenticado.

-- ========= INÍCIO DA MIGRATION =========

-- -----------------------------------------------------
-- 1. Remover todas as políticas existentes para evitar conflitos
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can select their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable SELECT for authenticated users on their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable INSERT for authenticated users for their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable UPDATE for authenticated users on their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable DELETE for authenticated users on their own profile" ON public.profiles;

-- -----------------------------------------------------
-- 2. Habilitar RLS na tabela profiles (se ainda não estiver habilitado)
-- -----------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- 3. Criar políticas RLS CONSOLIDADAS
-- -----------------------------------------------------

-- Política de SELECT: Permite que um usuário leia seu próprio perfil
CREATE POLICY "Enable SELECT for authenticated users on their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING ( auth.email() = email );

-- Política de INSERT: Permite que um usuário autenticado crie seu próprio perfil
CREATE POLICY "Enable INSERT for authenticated users for their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK ( auth.email() = email );

-- Política de UPDATE: Permite que um usuário autenticado atualize seu próprio perfil
CREATE POLICY "Enable UPDATE for authenticated users on their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING ( auth.email() = email )
WITH CHECK ( auth.email() = email );

-- Política de DELETE: Permite que um usuário autenticado delete seu próprio perfil
CREATE POLICY "Enable DELETE for authenticated users on their own profile"
ON public.profiles FOR DELETE
TO authenticated
USING ( auth.email() = email );

-- ========= FIM DA MIGRATION =========