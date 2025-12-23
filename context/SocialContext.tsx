
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  Post, 
  Comment,
  getFeedPosts as apiGetFeedPosts, 
  getPublicFeedPosts as apiGetPublicFeedPosts,
  getPostById as apiGetPostById,
  createPost as apiCreatePost, 
  updatePost as apiUpdatePost, 
  deletePost as apiDeletePost,
  toggleLike as apiToggleLike,
  addComment as apiAddComment,
  getComments as apiGetComments,
  updateComment as apiUpdateComment,
  deleteComment as apiDeleteComment,
} from '@/lib/social';
import { useProfile } from './ProfileContext';
import { Alert } from 'react-native';
import { Database } from '@/lib/database.types';

interface SocialContextType {
  posts: Post[];
  publicPosts: Post[];
  activePost: Post | null;
  comments: Comment[];
  loading: boolean;
  loadingPublicFeed: boolean;
  loadingActivePost: boolean;
  loadingComments: boolean;
  likingPostId: number | null;
  refreshFeed: (userId?: string) => Promise<void>;
  refreshPublicFeed: () => Promise<void>;
  fetchPostById: (postId: number) => Promise<void>;
  createPost: (post: { title: string; description: string; privacy_level?: Database['public']['Enums']['post_privacy_level']; post_type?: Database['public']['Enums']['feed_post_type'], shared_data?: any }) => Promise<{ error: Error | null; }>;
  updatePost: (postId: number, updates: { title?: string; description?: string; privacy_level?: Database['public']['Enums']['post_privacy_level']; shared_data?: any }) => Promise<{ error: Error | null; }>;
  deletePost: (postId: number) => Promise<{ error: Error | null; }>;
  toggleLike: (postId: number) => Promise<void>;
  addComment: (postId: number, content: string) => Promise<void>;
  fetchComments: (postId: number) => Promise<void>;
  updateComment: (commentId: number, content: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [publicPosts, setPublicPosts] = useState<Post[]>([]);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPublicFeed, setLoadingPublicFeed] = useState(true);
  const [loadingActivePost, setLoadingActivePost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [likingPostId, setLikingPostId] = useState<number | null>(null);
  const { profile } = useProfile();

  const processPosts = useCallback((posts: Post[]) => {
    if (!profile) return posts;
    return posts.map(post => ({
      ...post,
      user_has_liked: post.post_likes.some(like => like.profile_id === profile.id)
    }));
  }, [profile]);

  const refreshFeed = useCallback(async (userId?: string) => {
    setLoading(true);
    const { data, error } = await apiGetFeedPosts(userId);
    if (data) {
      setPosts(processPosts(data));
    }
    if (error) {
      console.error(error);
    }
    setLoading(false);
  }, [processPosts]);

  const refreshPublicFeed = useCallback(async () => {
    setLoadingPublicFeed(true);
    const { data, error } = await apiGetPublicFeedPosts();
    if (data) {
      setPublicPosts(processPosts(data));
    }
    if (error) {
      console.error(error);
    }
    setLoadingPublicFeed(false);
  }, [processPosts]);

  const fetchPostById = useCallback(async (postId: number) => {
    setLoadingActivePost(true);
    const { data, error } = await apiGetPostById(postId);
    if (data) {
      setActivePost(processPosts([data])[0]);
    }
    if (error) {
        console.error(`Error fetching post ${postId}:`, error);
        setActivePost(null);
    }
    setLoadingActivePost(false);
  }, [processPosts]);

  useEffect(() => {
    if (profile) {
      refreshFeed();
      refreshPublicFeed();
    }
  }, [profile, refreshFeed, refreshPublicFeed]);

  const createPost = async (post: { title: string; description: string; privacy_level?: Database['public']['Enums']['post_privacy_level']; post_type?: Database['public']['Enums']['feed_post_type'], shared_data?: any }) => {
    if (!profile) {
        const err = new Error('Você precisa estar logado para criar uma postagem.');
        Alert.alert('Erro', err.message);
        return { error: err };
    }

    const { error } = await apiCreatePost({ ...post, profile_id: profile.id });
    if (!error) {
        await refreshFeed();
        await refreshPublicFeed();
    }
    
    return { error: error ? new Error(error.message) : null };
  };

  const updatePost = async (postId: number, updates: { title?: string; description?: string; privacy_level?: Database['public']['Enums']['post_privacy_level']; shared_data?: any }) => {
    const { error } = await apiUpdatePost(postId, updates);
    if (!error) {
      await refreshFeed();
      await refreshPublicFeed();
    }
    return { error: error ? new Error(error.message) : null };
  };

  const deletePost = async (postId: number) => {
    const { error } = await apiDeletePost(postId);
    if (!error) {
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      setPublicPosts(prevPublicPosts => prevPublicPosts.filter(p => p.id !== postId));
    }
    return { error: error ? new Error(error.message) : null };
  };

  const toggleLike = async (postId: number) => {
    if (!profile || likingPostId === postId) return;
  
    setLikingPostId(postId);
  
    const updateLikeState = (post: Post | null) => {
      if (!post) return null;
      const userHasLiked = post.user_has_liked;
      return {
        ...post,
        like_count: userHasLiked ? post.like_count - 1 : post.like_count + 1,
        user_has_liked: !userHasLiked,
      };
    };
  
    // Optimistically update the feed
    setPosts(currentPosts =>
      currentPosts.map(p => (p.id === postId ? updateLikeState(p)! : p))
    );
    setPublicPosts(currentPublicPosts =>
      currentPublicPosts.map(p => (p.id === postId ? updateLikeState(p)! : p))
    );
  
    // Optimistically update the active post if it's the one being liked
    if (activePost && activePost.id === postId) {
      setActivePost(updateLikeState(activePost));
    }
  
    try {
      await apiToggleLike(postId, profile.id);
    } catch (error) {
      console.error("Failed to toggle like, reverting UI.", error);
      // Revert UI on error
      if (activePost && activePost.id === postId) await fetchPostById(postId);
      await refreshFeed();
      await refreshPublicFeed();
    } finally {
      setLikingPostId(null);
    }
  };
  
  const fetchComments = async (postId: number) => {
    setLoadingComments(true);
    const { data, error } = await apiGetComments(postId);
    if (data) {
      setComments(data);
    }
    if (error) {
      console.error("Failed to fetch comments", error);
      setComments([]);
    }
    setLoadingComments(false);
  };

  const addComment = async (postId: number, content: string) => {
    if (!profile) return;
    
    const { data: newComment, error } = await apiAddComment(postId, profile.id, content);

    if (newComment) {
      setComments(prevComments => [...prevComments, newComment as Comment]);
      
      const incrementCommentCount = (p: Post) => ({ ...p, comment_count: p.comment_count + 1 });

      setPosts(prevPosts => prevPosts.map(p => p.id === postId ? incrementCommentCount(p) : p));
      setPublicPosts(prevPublicPosts => prevPublicPosts.map(p => p.id === postId ? incrementCommentCount(p) : p));
      if (activePost && activePost.id === postId) {
        setActivePost(incrementCommentCount(activePost));
      }
    }
    if (error) {
        Alert.alert("Erro", "Não foi possível adicionar o seu comentário.");
    }
  };

  const updateComment = async (commentId: number, content: string) => {
    setComments(prev => prev.map(c => c.id === commentId ? {...c, content} : c));
    await apiUpdateComment(commentId, content);
  }

  const deleteComment = async (commentId: number) => {
    const originalComments = comments;
    const deletedComment = comments.find(c => c.id === commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
    
    const { error } = await apiDeleteComment(commentId);
    if (error) {
        Alert.alert("Erro", "Não foi possível excluir o comentário.");
        setComments(originalComments); // Revert on failure
    } else if (deletedComment) {
      const decrementCommentCount = (p: Post) => ({ ...p, comment_count: Math.max(0, p.comment_count - 1) });
      setPosts(prevPosts => prevPosts.map(p => p.id === deletedComment.post_id ? decrementCommentCount(p) : p));
      setPublicPosts(prevPublicPosts => prevPublicPosts.map(p => p.id === deletedComment.post_id ? decrementCommentCount(p) : p));
      if (activePost && activePost.id === deletedComment.post_id) {
        setActivePost(decrementCommentCount(activePost));
      }
    }
  }

  return (
    <SocialContext.Provider value={{ 
        posts,
        publicPosts,
        activePost,
        comments,
        loading, 
        loadingPublicFeed,
        loadingActivePost,
        loadingComments,
        likingPostId,
        refreshFeed,
        refreshPublicFeed,
        fetchPostById,
        createPost, 
        updatePost, 
        deletePost,
        toggleLike,
        addComment,
        fetchComments,
        updateComment,
        deleteComment
    }}>
      {children}
    </SocialContext.Provider>
  );
}

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
