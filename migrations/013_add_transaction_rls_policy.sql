-- Migração para adicionar políticas de Row-Level Security (RLS) à tabela 'transactions'

-- ========= INÍCIO DA MIGRATION =========

-- 1. Habilitar RLS na tabela
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent errors during re-migration
DROP POLICY IF EXISTS "Allow users to manage their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow users to insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow users to update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow users to delete their own transactions" ON public.transactions;

-- 2. Política de SELECT: Permitir que usuários autenticados leiam suas próprias transações.
CREATE POLICY "Allow users to manage their own transactions"
ON public.transactions FOR SELECT
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- 3. Política de INSERT: Permitir que usuários autenticados criem transações para si mesmos.
--    A verificação garante que o profile_id inserido corresponde ao ID do perfil do usuário que faz a inserção.
CREATE POLICY "Allow users to insert their own transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- 4. Política de UPDATE: Permitir que usuários atualizem apenas suas próprias transações.
CREATE POLICY "Allow users to update their own transactions"
ON public.transactions FOR UPDATE
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) )
WITH CHECK ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- 5. Política de DELETE: Permitir que usuários deletem apenas suas próprias transações.
CREATE POLICY "Allow users to delete their own transactions"
ON public.transactions FOR DELETE
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- ========= FIM DA MIGRATION =========
