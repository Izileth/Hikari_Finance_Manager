-- migrations/023_update_feed_posts_rls_policy.sql

-- ========= INÍCIO DA MIGRATION =========

-- 1. Dropar a política de SELECT existente
DROP POLICY "Allow users to read their own feed posts" ON public.feed_posts;

-- 2. Criar a nova política de SELECT
CREATE POLICY "Allow users to read feed posts based on privacy"
ON public.feed_posts FOR SELECT
TO authenticated
USING (
  -- Post é público
  privacy_level = 'public'::post_privacy_level
  OR
  -- O usuário é o autor do post
  profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR
  -- O post é para seguidores e o autor é seguido pelo usuário
  (
    privacy_level = 'followers_only'::post_privacy_level AND
    profile_id IN (SELECT following_id FROM public.followers WHERE follower_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  )
);

-- ========= FIM DA MIGRATION =========
