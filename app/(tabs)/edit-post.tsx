import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useSocial } from '@/context/SocialContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Database } from '@/lib/database.types';
import CustomHeader from '@/components/ui/CustomHeader';
import { useFinancials } from '@/context/FinancialContext';
import { PaperclipIcon, ArrowUpIcon, ArrowDownIcon, CheckIcon } from '@/components/ui/Icons';

export default function EditPostScreen() {
    const params = useLocalSearchParams();
    const postId = params.postId ? parseInt(params.postId as string) : null;
    const { posts, updatePost, loading: socialLoading } = useSocial();
    const { transactions, loading: financialsLoading } = useFinancials();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [privacyLevel, setPrivacyLevel] = useState<Database['public']['Enums']['post_privacy_level']>('public');
    const [loading, setLoading] = useState(false);
    const [originalPost, setOriginalPost] = useState<Database['public']['Tables']['feed_posts']['Row'] | null>(null);
    const [showFinancialAttachment, setShowFinancialAttachment] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

    useEffect(() => {
        if (postId && posts.length > 0) {
            const postToEdit = posts.find(p => p.id === postId);
            if (postToEdit) {
                setOriginalPost(postToEdit);
                setTitle(postToEdit.title || '');
                setDescription(postToEdit.description || '');
                setPrivacyLevel(postToEdit.privacy_level || 'public');

                if (postToEdit.shared_data && typeof postToEdit.shared_data === 'object' && 'transaction_id' in postToEdit.shared_data) {
                    setSelectedTransactionId(parseInt((postToEdit.shared_data as { transaction_id: string }).transaction_id));
                    setShowFinancialAttachment(true);
                }
            } else {
                Alert.alert('Erro', 'Postagem não encontrada');
                router.back();
            }
        } else if (!postId) {
            Alert.alert('Erro', 'ID da postagem não fornecido');
            router.back();
        }
    }, [postId, posts]);

    const handleUpdatePost = async () => {
        if (!originalPost) {
            Alert.alert('Erro', 'Postagem original não carregada');
            return;
        }
        if (!title.trim()) {
            Alert.alert('Atenção', 'O título é obrigatório');
            return;
        }

        setLoading(true);
        
        let shared_data: any = undefined;
        if (selectedTransactionId) {
            const selectedTransaction = transactions.find(t => t.id === selectedTransactionId);
            if (selectedTransaction) {
                shared_data = {
                    transaction_id: selectedTransaction.id.toString(),
                    amount: selectedTransaction.amount,
                    description: selectedTransaction.description,
                    transaction_date: selectedTransaction.transaction_date,
                };
            }
        }

        const updates = {
            title,
            description,
            shared_data: shared_data,
            privacy_level: privacyLevel,
        };

        const { error } = await updatePost(originalPost.id, updates);
        setLoading(false);

        if (error) {
            Alert.alert('Erro', 'Falha ao atualizar post: ' + error.message);
        } else {
            router.back();
        }
    };

    if (socialLoading || financialsLoading || (!originalPost && postId)) {
        return (
            <View className="flex-1 bg-black">
                <CustomHeader />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="#ffffff" size="large" />
                    <Text className="text-white/60 mt-4">Carregando postagem...</Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <CustomHeader />
            <ScrollView className="flex-1">
                <View className="p-6">
                    {/* Title Input */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">Título</Text>
                        <View className="border border-white/20 rounded-lg">
                            <TextInput
                                className="px-4 py-4 text-white text-base"
                                placeholder="Título do post"
                                placeholderTextColor="#666666"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                    </View>

                    {/* Description Input */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">Descrição</Text>
                        <View className="border border-white/20 rounded-lg">
                            <TextInput
                                className="px-4 py-4 text-white text-base min-h-[120px]"
                                placeholder="No que você está pensando?"
                                placeholderTextColor="#666666"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Attach Financial Data Button */}
                    <TouchableOpacity 
                        className="flex-row items-center justify-center border border-white/20 rounded-lg py-3 mb-6"
                        onPress={() => setShowFinancialAttachment(!showFinancialAttachment)}
                        activeOpacity={0.7}
                    >
                        <PaperclipIcon size={18} />
                        <Text className="text-white font-medium ml-2">
                            {showFinancialAttachment ? 'Ocultar Transações' : 'Anexar Transação'}
                        </Text>
                    </TouchableOpacity>

                    {/* Financial Attachment List */}
                    {showFinancialAttachment && (
                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-3">Selecione uma transação</Text>
                            {financialsLoading ? (
                                <View className="py-8 items-center">
                                    <ActivityIndicator color="#ffffff" size="small" />
                                </View>
                            ) : transactions.length > 0 ? (
                                <View className="border border-white/20 rounded-lg overflow-hidden">
                                    {transactions.slice(0, 5).map((item, index) => {
                                        const isSelected = selectedTransactionId === item.id;
                                        const isIncome = Number(item.amount) > 0;
                                        
                                        return (
                                            <TouchableOpacity
                                                key={item.id}
                                                className={`flex-row items-center justify-between p-4 ${
                                                    index !== transactions.length - 1 ? 'border-b border-white/10' : ''
                                                } ${isSelected ? 'bg-white/10' : ''}`}
                                                onPress={() => setSelectedTransactionId(isSelected ? null : item.id)}
                                                activeOpacity={0.7}
                                            >
                                                <View className="flex-row items-center flex-1 mr-4">
                                                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                                                        isIncome ? 'bg-white/10' : 'bg-white/10'
                                                    }`}>
                                                        {isIncome ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />}
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-white font-medium text-base" numberOfLines={1}>
                                                            {item.description}
                                                        </Text>
                                                        <Text className="text-white/40 text-xs mt-0.5">
                                                            {new Date(item.transaction_date).toLocaleDateString('pt-BR')}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View className="flex-row items-center gap-3">
                                                    <Text className="text-white font-bold text-base">
                                                        {new Intl.NumberFormat('pt-BR', { 
                                                            style: 'currency', 
                                                            currency: 'BRL' 
                                                        }).format(Math.abs(Number(item.amount)))}
                                                    </Text>
                                                    {isSelected && (
                                                        <View className="w-6 h-6 rounded-full bg-white items-center justify-center">
                                                            <CheckIcon size={14} />
                                                        </View>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ) : (
                                <View className="border border-white/20 rounded-lg p-8 items-center">
                                    <Text className="text-white/40 text-center">
                                        Nenhuma transação disponível
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Selected Transaction Info */}
                    {selectedTransactionId && (
                        <View className="bg-white/5 border border-white/20 rounded-lg p-4 mb-6">
                            <Text className="text-white/60 text-xs mb-1">Transação anexada</Text>
                            <Text className="text-white font-medium">
                                {transactions.find(t => t.id === selectedTransactionId)?.description}
                            </Text>
                        </View>
                    )}

                    {/* Privacy Level Selector */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">Visibilidade</Text>
                        <View className="flex-row justify-between border border-white/20 rounded-lg p-1">
                            {['public', 'followers_only', 'private'].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    className={`flex-1 items-center py-2 rounded-md ${
                                        privacyLevel === level ? 'bg-white/20' : ''
                                    }`}
                                    onPress={() => setPrivacyLevel(level as any)}
                                >
                                    <Text className="text-white font-medium capitalize">
                                        {level === 'followers_only' ? 'Seguidores' : level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Update Post Button */}
                    <TouchableOpacity 
                        className={`rounded-lg py-4 ${loading ? 'bg-white/20' : 'bg-white'}`}
                        onPress={handleUpdatePost} 
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text className="text-black text-center font-bold text-base">
                                Atualizar Post
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}