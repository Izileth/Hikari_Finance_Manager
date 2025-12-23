import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { useFinancials, Transaction, TransactionInsert } from '../../context/FinancialContext';
import { CustomPicker } from '../ui/CustomPicker';
import Svg, { Path } from 'react-native-svg';

interface TransactionFormProps {
    transaction?: Transaction | null;
    onSave: () => void;
    onClose: () => void;
}

// SVG Icons
const ArrowUpIcon = ({ size = 20 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const ArrowDownIcon = ({ size = 20 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 5v14M19 12l-7 7-7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onSave, onClose }) => {
    const { accounts, categories, addTransaction, updateTransaction } = useFinancials();
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState<number | undefined | null>();
    const [categoryId, setCategoryId] = useState<number | undefined | null>();
    const [transactionDate, setTransactionDate] = useState(new Date());
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [isCorporate, setIsCorporate] = useState(false);

    useEffect(() => {
        if (transaction) {
            setIsEditing(true);
            setTitle(transaction.title || '');
            setDescription(transaction.description);
            setNotes(transaction.notes || '');
            setAmount(String(Math.abs(transaction.amount as number)));
            setAccountId(transaction.account_id);
            setCategoryId(transaction?.category_id || null);
            setTransactionDate(new Date(transaction.transaction_date));
            setType(Number(transaction.amount) >= 0 ? 'income' : 'expense');
            setIsCorporate(transaction.is_corporate || false);
        } else {
            setIsEditing(false);
            setTitle('');
            setDescription('');
            setNotes('');
            setAmount('');
            setAccountId(accounts.length > 0 ? accounts[0].id : null);
            const defaultCategory = categories.find(c => c.type === 'expense');
            setCategoryId(defaultCategory ? defaultCategory.id : null);
            setTransactionDate(new Date());
            setType('expense');
            setIsCorporate(false);
        }
    }, [transaction, accounts, categories]);

    const handleSave = async () => {
        if (!title || !amount || !accountId) {
            Alert.alert('Atenção', 'Título, Valor e Conta são campos obrigatórios');
            return;
        }

        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(numericAmount)) {
            Alert.alert('Erro', 'O valor deve ser um número válido');
            return;
        }

        const finalAmount = type === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

        const transactionData: Omit<TransactionInsert, 'profile_id'> = {
            title,
            description,
            notes,
            amount: finalAmount,
            account_id: accountId,
            category_id: categoryId,
            transaction_date: transactionDate.toISOString(),
            is_corporate: isCorporate,
        };

        try {
            if (isEditing && transaction) {
                await updateTransaction(transaction.id, transactionData);
            } else {
                await addTransaction(transactionData as TransactionInsert);
            }
            onSave();
        } catch (error: any) {
            Alert.alert('Erro ao Salvar', error.message);
        }
    };

    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <ScrollView className="flex-1 bg-black">
            <View className="p-6">
                {/* Header */}
                <Text className="text-white text-2xl font-bold mb-8">
                    {isEditing ? 'Editar Transação' : 'Nova Transação'}
                </Text>

                {/* Type Selector */}
                <View className="flex-row mb-8 border border-white/20 rounded-lg overflow-hidden">
                    <TouchableOpacity
                        onPress={() => setType('expense')}
                        className={`flex-1 py-4 flex-row items-center justify-center gap-2 ${type === 'expense' ? 'bg-white' : 'bg-transparent'}`}
                    >
                        <ArrowDownIcon size={18} />
                        <Text className={`font-bold ${type === 'expense' ? 'text-black' : 'text-white'}`}>
                            Despesa
                        </Text>
                    </TouchableOpacity>
                    <View className="w-px bg-white/20" />
                    <TouchableOpacity
                        onPress={() => setType('income')}
                        className={`flex-1 py-4 flex-row items-center justify-center gap-2 ${type === 'income' ? 'bg-white' : 'bg-transparent'}`}
                    >
                        <ArrowUpIcon size={18} />
                        <Text className={`font-bold ${type === 'income' ? 'text-black' : 'text-white'}`}>
                            Receita
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <View className="mb-6">
                    <Text className="text-white/60 text-sm mb-2">Título</Text>
                    <View className="border border-white/20 rounded-lg">
                        <TextInput
                            className="text-white px-4 py-4 text-base"
                            placeholder="Ex: Conta de Luz"
                            placeholderTextColor="#666666"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>
                </View>

                {/* Amount */}
                <View className="mb-6">
                    <Text className="text-white/60 text-sm mb-2">Valor</Text>
                    <View className="border border-white/20 rounded-lg">
                        <TextInput
                            className="text-white px-4 py-4 text-base"
                            placeholder="0,00"
                            placeholderTextColor="#666666"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Account */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-white/60 text-sm">Conta</Text>
                    </View>
                    <CustomPicker
                        selectedValue={accountId}
                        onValueChange={(itemValue) => setAccountId(itemValue)}
                        items={accounts.map(acc => ({
                            label: `${acc.name}${acc.type ? ' • ' + acc.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}`,
                            value: acc.id
                        }))}
                        placeholder="Selecione uma conta"
                        enabled={accounts.length > 0}
                    />
                </View>

                {/* Category */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-white/60 text-sm">Categoria</Text>
                    </View>
                    <CustomPicker
                        selectedValue={categoryId}
                        onValueChange={(itemValue) => setCategoryId(itemValue)}
                        items={filteredCategories.map(cat => ({
                            label: cat.name,
                            value: cat.id
                        }))}
                        placeholder="Selecione uma categoria"
                        enabled={filteredCategories.length > 0}
                    />
                </View>

                {/* Notes */}
                <View className="mb-6">
                    <Text className="text-white/60 text-sm mb-2">Notas</Text>
                    <View className="border border-white/20 rounded-lg">
                        <TextInput
                            className="text-white px-4 py-4 text-base min-h-[80px]"
                            placeholder="Adicione uma anotação..."
                            placeholderTextColor="#666666"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Corporate Switch */}
                <View className="flex-row items-center justify-between mb-8 p-4 border border-white/20 rounded-lg">
                    <View className="flex-1 mr-4">
                        <Text className="text-white font-medium mb-1">Transação Corporativa</Text>
                        <Text className="text-white/40 text-xs">
                            Marque se for relacionada ao trabalho
                        </Text>
                    </View>
                    <Switch
                        trackColor={{ false: '#333333', true: '#ffffff' }}
                        thumbColor={isCorporate ? '#000000' : '#666666'}
                        ios_backgroundColor="#333333"
                        onValueChange={setIsCorporate}
                        value={isCorporate}
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity onPress={handleSave} className="bg-white rounded-lg py-4 mb-4">
                    <Text className="text-black text-center font-bold text-base">Salvar</Text>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity onPress={onClose} className="border border-white/20 rounded-lg py-3">
                    <Text className="text-white/60 text-center text-base">Cancelar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default TransactionForm;