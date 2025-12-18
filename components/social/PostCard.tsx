import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Post } from '@/lib/social';
import { Svg, Path } from 'react-native-svg';
import { useProfile } from '@/context/ProfileContext';
import { useSocial } from '@/context/SocialContext';
import { useRouter } from 'expo-router';
import { HeartIcon, MessageCircleIcon, EditIcon, TrashIcon } from '../ui/Icons';
import CommentSection from './CommentSection';

const getInitials = (name: string) => {
  if (!name) return '?';
  const names = name.trim().split(' ');
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export default function PostCard({ post }: { post: Post }) {
  const { profile } = useProfile();
  const { deletePost, toggleLike, fetchComments, likingPostId } = useSocial();
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);

  const isOwner = profile?.id === post.profile_id;

  const handleDelete = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta postagem?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const { error } = await deletePost(post.id);
            if (error) {
              Alert.alert("Erro", "Falha ao excluir postagem: " + error.message);
            }
          },
        },
      ]
    );
  };

  const handleToggleComments = () => {
    const newShowState = !showComments;
    setShowComments(newShowState);
    if (newShowState) {
        fetchComments(post.id);
    }
  }

  const handleEdit = () => {
    router.push({
      pathname: "/edit-post",
      params: { postId: post.id.toString() },
    });
  };

  const renderContent = () => {
    if (post.post_type === 'transaction_share') {
        const details = post.description?.split(', ').map(part => {
            const [key, ...valueParts] = part.split(': ');
            return { key: key.trim(), value: valueParts.join(': ').trim() };
        });

        const translations: Record<string, string> = {
            'Type': 'Tipo',
            'Amount': 'Valor',
            'Category': 'Categoria',
            'Date': 'Data',
            'Description': 'Descrição',
            'Expense': 'Despesa',
            'Income': 'Receita',
        };

        const translatedTitle = 'Compartilhou uma transação';

        return (
            <View className="bg-black border border-white/10 rounded-lg p-4 my-3">
                <Text className="text-white font-bold text-base mb-3">{translatedTitle}</Text>
                {details?.map(({ key, value }, index) => {
                    const translatedKey = translations[key] || key;
                    let displayValue = (translations[value] || value);

                    if (key === 'Amount') {
                        // Handle numbers that might have thousand separators (.) and/or decimal commas (,)
                        // e.g., "5.000,50" -> 5000.50
                        const cleanedValue = value.replace(/\./g, '').replace(',', '.');
                        const numericValue = parseFloat(cleanedValue);

                        if (!isNaN(numericValue)) {
                            displayValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue);
                        }
                    }

                    return (
                        <View key={index} className="flex-row justify-between items-center mb-1">
                            <Text className="text-white/70 text-sm">{translatedKey}</Text>
                            <Text className="text-white font-medium text-sm text-right">{displayValue}</Text>
                        </View>
                    );
                })}
            </View>
        );
    }
    
    if (post.post_type === 'achievement') {
        return (
            <View className="bg-white/5 border border-white/10 rounded-lg p-4 my-3">
                <Text className="text-white font-bold text-base mb-2">{post.title}</Text>
                <Text className="text-white/80 text-sm leading-5">{post.description}</Text>
            </View>
        );
    }

    return (
        <>
            {post.title && <Text className="text-white font-bold text-lg mb-2">{post.title}</Text>}
            {post.description && <Text className="text-white text-base leading-6">{post.description}</Text>}
        </>
    );
  };

  return (
    <View className="border border-white/20 rounded-lg p-4 mb-4">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        {/* Avatar */}
        <View className="w-11 h-11 rounded-full bg-white/10 mr-3 items-center justify-center overflow-hidden">
          {post.profiles?.avatar_url ? (
            <Image source={{ uri: post.profiles.avatar_url }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Text className="text-white text-base font-bold">{getInitials(post.profiles?.name || '')}</Text>
          )}
        </View>

        {/* User Info */}
        <View className="flex-1">
          <Text className="text-white font-semibold text-base">{post.profiles?.name}</Text>
          {post.profiles?.nickname && (
            <Text className="text-white/40 text-sm">@{post.profiles.nickname}</Text>
          )}
        </View>

        {/* Owner Actions */}
        {isOwner && (
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={handleEdit} className="p-2" activeOpacity={0.7}>
              <EditIcon size={18} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} className="p-2" activeOpacity={0.7}>
              <TrashIcon size={18} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {renderContent()}

      {/* Footer */}
      <View className="flex-row items-center mt-4 pt-4 border-t border-white/10">
        <TouchableOpacity 
            onPress={() => toggleLike(post.id)} 
            className="flex-row items-center mr-6" 
            activeOpacity={0.7}
            disabled={likingPostId === post.id}
        >
          <HeartIcon size={20} filled={post.user_has_liked} />
          <Text className="text-white/60 text-sm ml-2">{post.like_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleComments} className="flex-row items-center" activeOpacity={0.7}>
          <MessageCircleIcon size={20} />
          <Text className="text-white/60 text-sm ml-2">{post.comment_count || 0}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Comments Section */}
      {showComments && <CommentSection postId={post.id} />}
    </View>
  );
}