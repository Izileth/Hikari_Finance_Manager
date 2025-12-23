
import { supabase } from './supabase';
import { Database } from './database.types';

export type Post = Database['public']['Tables']['feed_posts']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'name' | 'nickname' | 'avatar_url'> | null;
  post_likes: { profile_id: number }[];
  like_count: number;
  comment_count: number;
  user_has_liked?: boolean; // Will be set in the context
};

export const getFeedPosts = async (userId?: string): Promise<{ data: Post[] | null, error: Error | null }> => {
  let targetUserUuid = userId;

  if (!targetUserUuid) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      targetUserUuid = user.id;
    } else {
      return { data: [], error: null };
    }
  }

  // Get the integer ID of the target user from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', targetUserUuid)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return { data: null, error: new Error(profileError.message) };
  }

  const targetProfileId = profile.id;

  // Fetch the integer IDs of users that the target user is following
  const { data: following, error: followingError } = await supabase
    .from('followers')
    .select('following_id')
    .eq('follower_id', targetProfileId);

  if (followingError) {
    console.error('Error fetching following users:', followingError);
    return { data: null, error: new Error(followingError.message) };
  }

  const followingIds = following.map(f => f.following_id);
  const userIds = [...followingIds, targetProfileId];

  const { data, error } = await supabase
    .from('feed_posts')
    .select(`
      *,
      profiles (id, name, nickname, avatar_url),
      post_likes ( profile_id ),
      post_comments ( count )
    `)
    .in('profile_id', userIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching feed posts:', error);
    return { data: null, error: new Error(error.message) };
  }

  const posts = data.map(post => {
    const like_count = post.post_likes.length;
    const comment_count = post.post_comments[0]?.count ?? 0;

    return {
      ...post,
      profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
      post_likes: post.post_likes,
      like_count: like_count,
      comment_count: comment_count,
    };
  });

  // @ts-ignore
  return { data: posts, error: null };
};

export const getPublicFeedPosts = async (): Promise<{ data: Post[] | null, error: Error | null }> => {
  const { data, error } = await supabase
    .from('feed_posts')
    .select(`
      *,
      profiles (id, name, nickname, avatar_url),
      post_likes ( profile_id ),
      post_comments ( count )
    `)
    .eq('privacy_level', 'public')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public feed posts:', error);
    return { data: null, error: new Error(error.message) };
  }

  const posts = data.map(post => {
    const like_count = post.post_likes.length;
    const comment_count = post.post_comments[0]?.count ?? 0;

    return {
      ...post,
      profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
      post_likes: post.post_likes,
      like_count: like_count,
      comment_count: comment_count,
    };
  });

  // @ts-ignore
  return { data: posts, error: null };
};

export const createPost = async (post: {
    profile_id: number;
    title: string;
    description: string;
    privacy_level?: Database['public']['Enums']['post_privacy_level'];
    post_type?: Database['public']['Enums']['feed_post_type'];
    shared_data?: any;
}) => {
    const { data, error } = await supabase
        .from('feed_posts')
        .insert([post])
        .select();

    if (error) {
        console.error('Error creating post:', error);
        return { data: null, error };
    }

    return getFeedPosts();
}

export const updatePost = async (post_id: number, updates: {
    title?: string;
    description?: string;
    privacy_level?: Database['public']['Enums']['post_privacy_level'];
    shared_data?: any;
}) => {
    const { data, error } = await supabase
        .from('feed_posts')
        .update(updates)
        .eq('id', post_id)
        .select();

    if (error) {
        console.error('Error updating post:', error);
        return { data: null, error };
    }
    return { data, error: null };
};

export const deletePost = async (post_id: number) => {
    const { error } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', post_id);

    if (error) {
        console.error('Error deleting post:', error);
        return { error };
    }
    return { error: null };
};

export const toggleLike = async (postId: number, profileId: number) => {
    // Check if the like exists
    const { data: existingLike, error: selectError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('profile_id', profileId)
        .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = 'single' row not found
        console.error('Error checking for like:', selectError);
        return { error: selectError };
    }

    if (existingLike) {
        // Like exists, so delete it (unlike)
        const { error: deleteError } = await supabase
            .from('post_likes')
            .delete()
            .eq('id', existingLike.id);
        
        if (deleteError) {
            console.error('Error unliking post:', deleteError);
            return { error: deleteError };
        }
        return { error: null, liked: false };
    } else {
        // Like does not exist, so create it (like)
        const { error: insertError } = await supabase
            .from('post_likes')
            .insert({ post_id: postId, profile_id: profileId });

        if (insertError) {
            console.error('Error liking post:', insertError);
            return { error: insertError };
        }
        return { error: null, liked: true };
    }
};

export type Comment = Database['public']['Tables']['post_comments']['Row'] & {
    profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'name' | 'nickname' | 'avatar_url'> | null;
};

export const getComments = async (postId: number): Promise<{ data: Comment[] | null, error: Error | null }> => {
    const { data, error } = await supabase
        .from('post_comments')
        .select(`
            *,
            profiles (id, name, nickname, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        return { data: null, error: new Error(error.message) };
    }
    
    // @ts-ignore
    return { data, error: null };
};

export const addComment = async (postId: number, profileId: number, content: string) => {
    const { data, error } = await supabase
        .from('post_comments')
        .insert({
            post_id: postId,
            profile_id: profileId,
            content: content
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding comment:', error);
        return { data: null, error };
    }

    // After adding, fetch the new comment with profile info to return it
    const { data: newComment, error: fetchError } = await supabase
        .from('post_comments')
        .select(`*, profiles (id, name, nickname, avatar_url)`)
        .eq('id', data.id)
        .single();
    
    return { data: newComment, error: fetchError };
};

export const updateComment = async (commentId: number, content: string) => {
    const { data, error } = await supabase
        .from('post_comments')
        .update({ content })
        .eq('id', commentId)
        .select()
        .single();

    return { data, error };
};

export const deleteComment = async (commentId: number) => {
    const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

    return { error };
};

export const getPostById = async (postId: number): Promise<{ data: Post | null, error: Error | null }> => {
  const { data, error } = await supabase
    .from('feed_posts')
    .select(`
      *,
      profiles (id, name, nickname, avatar_url),
      post_likes ( profile_id ),
      post_comments ( count )
    `)
    .eq('id', postId)
    .single();

  if (error) {
    console.error('Error fetching post by ID:', error);
    return { data: null, error: new Error(error.message) };
  }
  if (!data) {
    return { data: null, error: new Error('Post not found') };
  }

  const like_count = data.post_likes.length;
  const comment_count = data.post_comments[0]?.count ?? 0;

  const post: Post = {
    ...data,
    profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
    post_likes: data.post_likes,
    like_count: like_count,
    comment_count: comment_count,
  };

  // @ts-ignore
  return { data: post, error: null };
};
