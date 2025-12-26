import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useSocial } from '@/context/SocialContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Database } from '@/lib/database.types';
import CustomHeader from '@/components/ui/CustomHeader';
import { useFinancials } from '@/context/FinancialContext';
import { PaperclipIcon, ArrowUpIcon, ArrowDownIcon, CheckIcon } from '@/components/ui/Icons';


type PrivacyLevel = 'public' | 'followers_only' | 'private';

const PRIVACY_LEVELS: PrivacyLevel[] = [
    'public',
    'followers_only',
    'private',
];

const privacyLabels: Record<PrivacyLevel, string> = {
    public: 'Pública',
    followers_only: 'Seguidores',
    private: 'Privada',
};


export default function EditPostScreen() {
    const params = useLocalSearchParams();
    const postId = params.postId ? parseInt(params.postId as string) : null;
    const { posts, updatePost, loading: socialLoading } = useSocial();
    const { transactions, accounts, categories, loading: financialsLoading } = useFinancials();
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
                    const txId = (postToEdit.shared_data as { transaction_id: string | number }).transaction_id;
                    setSelectedTransactionId(typeof txId === 'string' ? parseInt(txId) : txId);
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

    const monthlyTotals = useMemo(() => {
        const totals = new Map<string, { totalIncome: number, totalExpenses: number }>();
        transactions.forEach(t => {
            if (!t.transaction_date) return;
            const monthKey = t.transaction_date.substring(0, 7); // YYYY-MM
            const monthTotal = totals.get(monthKey) || { totalIncome: 0, totalExpenses: 0 };

            const amount = Number(t.amount);
            if (amount > 0) {
                monthTotal.totalIncome += amount;
            } else {
                monthTotal.totalExpenses += Math.abs(amount);
            }
            totals.set(monthKey, monthTotal);
        });
        return totals;
    }, [transactions]);

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

        let shared_data: any = null;
        if (selectedTransactionId) {
            const selectedTx = transactions.find(t => t.id === selectedTransactionId);
            if (selectedTx) {
                const category = categories.find(c => c.id === selectedTx.category_id);
                const account = accounts.find(a => a.id === selectedTx.account_id);
                const isIncome = Number(selectedTx.amount) > 0;
                const monthKey = selectedTx.transaction_date!.substring(0, 7);
                const totals = monthlyTotals.get(monthKey);
                let percentage = 0;
                if (totals) {
                    const totalForType = isIncome ? totals.totalIncome : totals.totalExpenses;
                    if (totalForType > 0) {
                        percentage = (Math.abs(Number(selectedTx.amount)) / totalForType) * 100;
                    }
                }

                shared_data = {
                    transaction_id: selectedTx.id.toString(),
                    amount: selectedTx.amount,
                    description: selectedTx.description,
                    transaction_date: selectedTx.transaction_date,
                    category_name: category?.name,
                    account_name: account?.name,
                    percentage_of_monthly_total: percentage.toFixed(0),
                };
            }
        } else {
            shared_data = null
        }

        const updates = {
            title,
            description,
            shared_data,
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
                <View className="px-2">
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
                            {showFinancialAttachment ? 'Ocultar Transações' : 'Anexar/Alterar Transação'}
                        </Text>
                    </TouchableOpacity>

                    {/* Financial Attachment List */}
                    {showFinancialAttachment && (
                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-3 px-2">Selecione uma transação</Text>
                            {financialsLoading ? (
                                <View className="py-8 items-center">
                                    <ActivityIndicator color="#ffffff" size="small" />
                                </View>
                            ) : transactions.length > 0 ? (
                                <View className="border border-white/20 rounded-lg overflow-hidden">
                                    {transactions.slice(0, 15).map((item, index) => {
                                        const isSelected = selectedTransactionId === item.id;
                                        const isIncome = Number(item.amount) > 0;
                                        const category = categories.find(c => c.id === item.category_id);
                                        const account = accounts.find(a => a.id === item.account_id);

                                        const monthKey = item.transaction_date!.substring(0, 7);
                                        const totals = monthlyTotals.get(monthKey);
                                        let percentage = 0;
                                        if (totals) {
                                            const totalForType = isIncome ? totals.totalIncome : totals.totalExpenses;
                                            if (totalForType > 0) {
                                                percentage = (Math.abs(Number(item.amount)) / totalForType) * 100;
                                            }
                                        }

                                        return (
                                            <TouchableOpacity
                                                key={item.id}
                                                className={`p-4 ${index !== transactions.length - 1 ? 'border-b border-white/10' : ''
                                                    } ${isSelected ? 'bg-white/10' : ''}`}
                                                onPress={() => setSelectedTransactionId(isSelected ? null : item.id)}
                                                activeOpacity={0.7}
                                            >
                                                <View className="flex-row items-start justify-between">
                                                    <View className="flex-row items-start flex-1 mr-4">
                                                        <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 mt-1 ${isIncome ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                                            {isIncome ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                                        </View>
                                                        <View className="flex-1">
                                                            <Text className="text-white font-medium text-base" numberOfLines={1}>
                                                                {item.title}
                                                            </Text>
                                                            <Text className="text-white/40 text-xs mt-1">
                                                                {new Date(item.transaction_date!).toLocaleDateString('pt-BR')}
                                                                {category ? ` • ${category.name}` : ''}
                                                            </Text>
                                                            <Text className="text-white/40 text-xs mt-1">
                                                                Conta: {account?.name || 'N/A'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View className="items-end">
                                                        <Text className={`font-bold text-base ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                                                            {new Intl.NumberFormat('pt-BR', {
                                                                style: 'currency',
                                                                currency: 'BRL'
                                                            }).format(Number(item.amount))}
                                                        </Text>
                                                        {percentage > 0 && (
                                                            <Text className="text-white/60 text-xs mt-1">
                                                                {percentage.toFixed(0)}% do mês
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>
                                                {isSelected && (
                                                    <View className="flex-row items-center justify-end mt-3 pt-3 border-t border-white/10">
                                                        <View className="flex-row items-center gap-2 bg-white rounded-full py-1 px-3">
                                                            <CheckIcon size={12} />
                                                            <Text className="text-black text-xs font-bold">Anexado</Text>
                                                        </View>
                                                    </View>
                                                )}
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

                    {/* Privacy Level Selector */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">Visibilidade</Text>

                        <View className="flex-row justify-between border border-white/20 rounded-lg p-1">
                            {PRIVACY_LEVELS.map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    className={`flex-1 items-center py-2 rounded-md ${privacyLevel === level ? 'bg-white/20' : ''
                                        }`}
                                    onPress={() => setPrivacyLevel(level)}
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-white font-medium">
                                        {privacyLabels[level]}
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