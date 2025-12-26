import React, { useEffect, useCallback } from 'react';
import { View, ActivityIndicator, ScrollView, Text, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSocial } from '@/context/SocialContext';
import PostCard from '@/components/social/PostCard';
import CustomHeader from '@/components/ui/CustomHeader';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activePost, fetchPostById, loadingActivePost } = useSocial();

  const postId = Number(id);

  const handleFetchPost = useCallback(() => {
    if (!isNaN(postId)) {
      fetchPostById(postId);
    } else {
      Alert.alert("Erro", "ID de post inválido.");
    }
  }, [postId, fetchPostById]);

  useEffect(() => {
    handleFetchPost();
  }, [handleFetchPost]);
  
  return (
    <View className="flex-1 bg-black">
      <CustomHeader />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={loadingActivePost} 
            onRefresh={handleFetchPost} 
            tintColor="#fff"
            colors={['#000']}
          />
        }
      >
        {/* Loading State */}
        {loadingActivePost && !activePost && (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#fff" />
            <Text className="text-white/40 text-sm mt-4">
              Carregando postagem...
            </Text>
          </View>
        )}

        {/* Post Content */}
        {activePost && activePost.id === postId ? (
          <View className="px-0 py-4">
            <PostCard post={activePost} isDetailView={true} />
          </View>
        ) : (
          !loadingActivePost && (
            <View className="flex-1 justify-center items-center py-20 px-8">
              <View className="items-center">
                <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center mb-4">
                  <Text className="text-white/40 text-2xl">?</Text>
                </View>
                <Text className="text-white text-base font-semibold mb-2">
                  Post não encontrado
                </Text>
                <Text className="text-white/40 text-sm text-center">
                  Esta postagem pode ter sido removida ou não existe.
                </Text>
              </View>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}