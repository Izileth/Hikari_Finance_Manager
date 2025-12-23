import React, { useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, TouchableOpacity, Text } from 'react-native';
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
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Carregando feed...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={data}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <MessageIconEmptyState size={48}/>
              <Text style={styles.emptyTitle}>Nenhuma postagem ainda</Text>
              <Text style={styles.emptyDescription}>
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
    <View style={styles.container}>
      <CustomHeader />
      
      <View style={styles.segmentControl}>
        <View style={styles.segmentWrapper}>
          <TouchableOpacity 
            style={[styles.segmentButton, feedType === 'personal' && styles.segmentButtonActive]} 
            onPress={() => setFeedType('personal')}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentButtonText, feedType === 'personal' && styles.segmentButtonTextActive]}>
              Pessoal
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.segmentButton, feedType === 'public' && styles.segmentButtonActive]} 
            onPress={() => setFeedType('public')}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentButtonText, feedType === 'public' && styles.segmentButtonTextActive]}>
              Público
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    marginTop: 16,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  segmentControl: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  segmentWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  segmentButtonTextActive: {
    color: '#000000',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});