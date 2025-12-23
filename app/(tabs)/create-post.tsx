import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useSocial } from '@/context/SocialContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Database } from '@/lib/database.types';
import CustomHeader from '@/components/ui/CustomHeader';
import { useFinancials } from '@/context/FinancialContext';
import { PaperclipIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon, CheckIcon } from '@/components/ui/Icons';

export default function CreatePostScreen() {
    const params = useLocalSearchParams<{ title?: string; description?: string, type?: string }>();
    const router = useRouter();
    
    const { createPost } = useSocial();
    const { transactions, accounts, categories, loading: financialsLoading } = useFinancials();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [privacyLevel, setPrivacyLevel] = useState<Database['public']['Enums']['post_privacy_level']>('public');
    const [loading, setLoading] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
    const [showFinancialAttachment, setShowFinancialAttachment] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (params.title) setTitle(params.title);
        if (params.description) setDescription(params.description);
    }, [params]);

    const handleCreatePost = async () => {
        if (!title.trim()) {
            Alert.alert('Atenção', 'O título é obrigatório');
            return;
        }

        setLoading(true);
        const post_type = (selectedTransactionId ? 'transaction_share' : 'manual') as Database['public']['Enums']['feed_post_type'];
        
        let shared_data: any = undefined;
        if (selectedTransactionId) {
            const selectedTx = transactions.find(t => t.id === selectedTransactionId);
            if (selectedTx) {
                const category = categories.find(c => c.id === selectedTx.category_id);
                shared_data = {
                    transaction_id: selectedTx.id.toString(),
                    amount: selectedTx.amount,
                    description: selectedTx.description,
                    transaction_date: selectedTx.transaction_date,
                    category_name: category?.name,
                };
            }
        }

        const { error } = await createPost({ title, description, post_type, shared_data, privacy_level: privacyLevel });
        setLoading(false);

        if (error) {
            Alert.alert('Erro', 'Falha ao criar post: ' + error.message);
        } else {
            router.back();
        }
    };

    const filteredTransactions = useMemo(() => {
        if (!searchTerm) return transactions;
        
        const lowercasedTerm = searchTerm.toLowerCase();
        
        return transactions.filter(tx => {
            const categoryName = categories.find(c => c.id === tx.category_id)?.name || '';
            const accountName = accounts.find(a => a.id === tx.account_id)?.name || '';
            
            return (
                tx.description.toLowerCase().includes(lowercasedTerm) ||
                categoryName.toLowerCase().includes(lowercasedTerm) ||
                accountName.toLowerCase().includes(lowercasedTerm)
            );
        });
    }, [searchTerm, transactions, categories, accounts]);
    
    return (
        <View className="flex-1 bg-black">
            <CustomHeader />
            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                <View className="p-6">
                    {/* Title Input */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">Título</Text>
                        <View className="border border-white/20 rounded-lg">
                            <TextInput
                                className="px-4 py-4 text-white text-base"
                                placeholder="Dê um título ao seu post"
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

                    {/* Attach Transaction Button */}
                    <TouchableOpacity 
                        className="flex-row items-center justify-center border border-white/20 rounded-lg py-3 mb-6"
                        onPress={() => setShowFinancialAttachment(!showFinancialAttachment)}
                        activeOpacity={0.7}
                    >
                        <PaperclipIcon />
                        <Text className="text-white font-medium ml-2">
                            {showFinancialAttachment ? 'Ocultar Transações' : 'Anexar Transação'}
                        </Text>
                    </TouchableOpacity>

                    {/* Transaction List */}
                    {showFinancialAttachment && (
                        <View className="mb-6">
                            {/* Search Input */}
                            <View className="flex-row items-center border border-white/20 rounded-lg px-4 mb-3">
                                <SearchIcon />
                                <TextInput
                                    className="flex-1 py-3 px-3 text-white text-base"
                                    placeholder="Buscar transação..."
                                    placeholderTextColor="#666666"
                                    value={searchTerm}
                                    onChangeText={setSearchTerm}
                                />
                            </View>

                            {financialsLoading ? (
                                <View className="py-8 items-center">
                                    <ActivityIndicator color="#ffffff" size="small" />
                                </View>
                            ) : filteredTransactions.length > 0 ? (
                                <View className="border border-white/20 rounded-lg overflow-hidden">
                                    {filteredTransactions.map((item, index) => {
                                        const isSelected = selectedTransactionId === item.id;
                                        const isIncome = Number(item.amount) > 0;
                                        const category = categories.find(c => c.id === item.category_id);
                                        const account = accounts.find(a => a.id === item.account_id);

                                        return (
                                            <TouchableOpacity
                                                key={item.id}
                                                className={`p-4 ${
                                                    index !== filteredTransactions.length - 1 ? 'border-b border-white/10' : ''
                                                } ${isSelected ? 'bg-white/10' : ''}`}
                                                onPress={() => setSelectedTransactionId(isSelected ? null : item.id)}
                                                activeOpacity={0.7}
                                            >
                                                <View className="flex-row items-center justify-between">
                                                    <View className="flex-row items-center flex-1 mr-4">
                                                        <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                                                            isIncome ? 'bg-white/10' : 'bg-white/10'
                                                        }`}>
                                                            {isIncome ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                                        </View>
                                                        <View className="flex-1">
                                                            <Text className="text-white font-medium text-base" numberOfLines={1}>
                                                                {item.description}
                                                            </Text>
                                                            <Text className="text-white/40 text-xs mt-1">
                                                                {new Date(item.transaction_date).toLocaleDateString('pt-BR')}
                                                                {category ? ` • ${category.name}` : ''}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Text className="text-white font-bold text-base">
                                                        {new Intl.NumberFormat('pt-BR', { 
                                                            style: 'currency', 
                                                            currency: 'BRL' 
                                                        }).format(Math.abs(Number(item.amount)))}
                                                    </Text>
                                                </View>

                                                {/* Selected State */}
                                                {isSelected && (
                                                    <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-white/10">
                                                        <Text className="text-white/40 text-xs">
                                                            Conta: {account?.name || 'N/A'}
                                                        </Text>
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
                                        Nenhuma transação encontrada
                                    </Text>
                                </View>
                            )}
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

                    {/* Create Post Button */}
                    <TouchableOpacity 
                        className={`rounded-lg py-4 ${
                            loading || !title.trim() ? 'bg-white/20' : 'bg-white'
                        }`}
                        onPress={handleCreatePost} 
                        disabled={loading || !title.trim()}
                        activeOpacity={0.7}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text className={`text-center font-bold text-base ${
                                !title.trim() ? 'text-white/40' : 'text-black'
                            }`}>
                                Publicar
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}