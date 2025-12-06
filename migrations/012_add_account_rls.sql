-- Migração para adicionar políticas de Row-Level Security (RLS) à tabela 'accounts'

-- ========= INÍCIO DA MIGRATION =========

-- 1. Habilitar RLS na tabela
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent errors during re-migration
DROP POLICY IF EXISTS "Allow authenticated users to read their own or public accounts" ON public.accounts;
DROP POLICY IF EXISTS "Allow users to insert accounts for themselves" ON public.accounts;
DROP POLICY IF EXISTS "Allow users to update their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Allow users to delete their own accounts" ON public.accounts;

-- 2. Política de SELECT: Permitir que usuários autenticados leiam suas próprias contas ou contas públicas.
CREATE POLICY "Allow authenticated users to read their own or public accounts"
ON public.accounts FOR SELECT
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) OR is_public = TRUE );

-- 3. Política de INSERT: Permitir que usuários autenticados criem contas para si mesmos.
--    A verificação garante que o profile_id inserido corresponde ao ID do perfil do usuário que faz a inserção.
CREATE POLICY "Allow users to insert accounts for themselves"
ON public.accounts FOR INSERT
TO authenticated
WITH CHECK ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- 4. Política de UPDATE: Permitir que usuários atualizem apenas suas próprias contas.
CREATE POLICY "Allow users to update their own accounts"
ON public.accounts FOR UPDATE
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) )
WITH CHECK ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- 5. Política de DELETE: Permitir que usuários deletem apenas suas próprias contas.
CREATE POLICY "Allow users to delete their own accounts"
ON public.accounts FOR DELETE
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- ========= FIM DA MIGRATION =========
