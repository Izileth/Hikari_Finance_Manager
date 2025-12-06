-- Migração para adicionar políticas de Row-Level Security (RLS) à tabela 'transaction_categories'

-- ========= INÍCIO DA MIGRATION =========

-- 1. Habilitar RLS na tabela
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;

-- Adicionar coluna is_public à tabela transaction_categories
ALTER TABLE public.transaction_categories
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE;

-- Adiciona um comentário para explicar o novo campo 'is_public'
COMMENT ON COLUMN public.transaction_categories.is_public IS 'Indica se a categoria é visível para outros usuários (true) ou privada (false).';


-- Drop existing policies if they exist to prevent errors during re-migration
DROP POLICY IF EXISTS "Allow authenticated users to read their own or public categories" ON public.transaction_categories;
DROP POLICY IF EXISTS "Allow users to insert categories for themselves" ON public.transaction_categories;
DROP POLICY IF EXISTS "Allow users to update their own categories" ON public.transaction_categories;
DROP POLICY IF EXISTS "Allow users to delete their own categories" ON public.transaction_categories;

-- 2. Política de SELECT: Permitir que usuários autenticados leiam suas próprias categorias ou categorias públicas.
CREATE POLICY "Allow authenticated users to read their own or public categories"
ON public.transaction_categories FOR SELECT
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) OR is_public = TRUE );

-- 3. Política de INSERT: Permitir que usuários autenticados criem categorias para si mesmos.
--    A verificação garante que o profile_id inserido corresponde ao ID do perfil do usuário que faz a inserção.
CREATE POLICY "Allow users to insert categories for themselves"
ON public.transaction_categories FOR INSERT
TO authenticated
WITH CHECK ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- 4. Política de UPDATE: Permitir que usuários atualizem apenas suas próprias categorias.
CREATE POLICY "Allow users to update their own categories"
ON public.transaction_categories FOR UPDATE
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) )
WITH CHECK ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- 5. Política de DELETE: Permitir que usuários deletem apenas suas próprias categorias.
CREATE POLICY "Allow users to delete their own categories"
ON public.transaction_categories FOR DELETE
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- ========= FIM DA MIGRATION =========
