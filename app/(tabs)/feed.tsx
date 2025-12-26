import React, { useState } from 'react';
import { FlatList, ActivityIndicator, View, TouchableOpacity, Text } from 'react-native';
import { useSocial } from '@/context/SocialContext';
import PostCard from '@/components/social/PostCard';
import CustomHeader from '@/components/ui/CustomHeader';
import { MessageIconEmptyState } from '@/components/ui/Icons';

type FeedType = 'personal' | 'public';

export default function FeedScreen() {
  const { posts, loading, publicPosts, loadingPublicFeed } = useSocial();
  const [feedType, setFeedType] = useState<FeedType>('personal');

  const renderContent = () => {
    const isLoading = feedType === 'personal' ? loading : loadingPublicFeed;
    const data = feedType === 'personal' ? posts : publicPosts;

    if (isLoading && !data.length) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text className="text-white/40 text-sm mt-4">Carregando feed...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={data}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 140, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View className="flex-1 justify-center items-center py-20 px-8">
              <MessageIconEmptyState size={48} />
              <Text className="text-white text-base font-semibold mt-4 mb-2">
                Nenhuma postagem ainda
              </Text>
              <Text className="text-white/40 text-sm text-center leading-5">
                {feedType === 'personal'
                  ? 'Comece seguindo pessoas ou crie sua primeira postagem!'
                  : 'Seja o primeiro a compartilhar algo público!'}
              </Text>
            </View>
          ) : null
        }
      />
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CustomHeader />
      
      <View className="flex-1">
        {renderContent()}
      </View>

      {/* Floating Tab Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-transparent">
        <View className="px-6 py-6">
          <View className="flex-row bg-white/5 border border-white/20 rounded-full p-1.5">
            <TouchableOpacity
              className={`flex-1 py-3 px-6 rounded-full items-center ${
                feedType === 'personal' ? 'bg-white' : ''
              }`}
              onPress={() => setFeedType('personal')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-bold ${
                feedType === 'personal' ? 'text-black' : 'text-white/60'
              }`}>
                Pessoal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 px-6 rounded-full items-center ${
                feedType === 'public' ? 'bg-white' : ''
              }`}
              onPress={() => setFeedType('public')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-bold ${
                feedType === 'public' ? 'text-black' : 'text-white/60'
              }`}>
                Público
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}