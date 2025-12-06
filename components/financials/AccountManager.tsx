import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, ScrollView, Switch, Platform } from 'react-native';
import { useFinancials, Account, AccountInsert, AccountUpdate } from '../../context/FinancialContext';
import { useAuth } from '../../context/AuthContext';
import { Picker } from '@react-native-picker/picker';

interface AccountManagerProps {
    onClose: () => void;
}

const AccountManager: React.FC<AccountManagerProps> = ({ onClose }) => {
    const { accounts, addAccount, updateAccount, deleteAccount } = useFinancials();
    const { profile } = useAuth();

    const [isEditing, setIsEditing] = useState<Account | null>(null);
    const [name, setName] = useState('');
    const [type, setType] = useState<string>('checking'); // Corresponds to account_type enum
    const [initialBalance, setInitialBalance] = useState('');
    const [currency, setCurrency] = useState('BRL');
    const [color, setColor] = useState('#4B5563'); // Default gray-600
    const [isPublic, setIsPublic] = useState(false);
    const [isCorporate, setIsCorporate] = useState(false);

    // Filter to show only accounts created by the current user
    const userAccounts = useMemo(() => {
        return accounts.filter(acc => acc.profile_id === profile?.id);
    }, [accounts, profile]);

    useEffect(() => {
        if (isEditing) {
            setName(isEditing.name);
            setType(isEditing.type);
            setInitialBalance(String(isEditing.initial_balance));
            setCurrency(isEditing.currency || 'BRL');
            setColor(isEditing.color || '#4B5563');
            setIsPublic(isEditing.is_public || false);
            setIsCorporate(isEditing.is_corporate || false);
        } else {
            setName('');
            setType('checking');
            setInitialBalance('');
            setCurrency('BRL');
            setColor('#4B5563');
            setIsPublic(false);
            setIsCorporate(false);
        }
    }, [isEditing]);

    const handleSelectAccount = (account: Account) => {
        setIsEditing(account);
    };

    const clearForm = () => {
        setIsEditing(null);
    };

    const handleSave = async () => {
        if (!name || !initialBalance) {
            Alert.alert('Erro', 'Nome e Saldo Inicial são obrigatórios.');
            return;
        }
        const numericBalance = parseFloat(initialBalance.replace(',', '.'));
        if (isNaN(numericBalance)) {
            Alert.alert('Erro', 'O saldo inicial deve ser um número válido.');
            return;
        }

        try {
            if (isEditing) {
                const accountData: AccountUpdate = { 
                    name, 
                    type: type as any, // Cast to any to match enum type in DB
                    initial_balance: numericBalance, 
                    currency, 
                    color, 
                    is_public: isPublic, 
                    is_corporate: isCorporate 
                };
                await updateAccount(isEditing.id, accountData);
            } else {
                if (!profile?.id) {
                    Alert.alert('Erro', 'Usuário não autenticado para criar conta.');
                    return;
                }
                const accountData: AccountInsert = { 
                    name, 
                    type: type as any, 
                    initial_balance: numericBalance, 
                    currency, 
                    color, 
                    profile_id: profile.id, 
                    is_public: isPublic, 
                    is_corporate: isCorporate 
                };
                await addAccount(accountData);
            }
            clearForm();
        } catch (error: any) {
            Alert.alert('Erro ao Salvar', error.message);
        }
    };

    const handleDelete = async () => {
        if (!isEditing) return;

        Alert.alert(
            'Confirmar Exclusão',
            `Você tem certeza que deseja excluir a conta "${isEditing.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAccount(isEditing.id);
                            clearForm();
                        } catch (error: any) {
                            Alert.alert('Erro ao Excluir', error.message);
                        }
                    },
                },
            ]
        );
    };

    const renderAccountItem = ({ item }: { item: Account }) => (
        <TouchableOpacity onPress={() => handleSelectAccount(item)} className="p-4 border-b border-gray-700">
            <Text className="text-white">{item.name} {item.is_public ? '(Pública)' : '(Privada)'} {item.is_corporate ? '(Corporativa)' : '(Pessoal)'}</Text>
            <Text className="text-white/60 capitalize">{item.type.replace('_', ' ')}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView className="flex-1 bg-gray-900 p-4">
            <Text className="text-white text-2xl font-bold mb-6">Gerenciar Contas</Text>

            {/* Form */}
            <View className="bg-gray-800 p-4 rounded-lg mb-6">
                <Text className="text-white font-bold text-lg mb-4">{isEditing ? 'Editar Conta' : 'Nova Conta'}</Text>
                <TextInput
                    className="bg-gray-700 text-white p-3 rounded-lg mb-4"
                    placeholder="Nome da Conta"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    className="bg-gray-700 text-white p-3 rounded-lg mb-4"
                    placeholder="Saldo Inicial"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={initialBalance}
                    onChangeText={setInitialBalance}
                />
                <TextInput
                    className="bg-gray-700 text-white p-3 rounded-lg mb-4"
                    placeholder="Moeda (ex: BRL)"
                    placeholderTextColor="#999"
                    value={currency}
                    onChangeText={setCurrency}
                />
                <TextInput
                    className="bg-gray-700 text-white p-3 rounded-lg mb-4"
                    placeholder="Cor (ex: #FF0000)"
                    placeholderTextColor="#999"
                    value={color}
                    onChangeText={setColor}
                />

                <View className="bg-gray-700 rounded-lg mb-4">
                    <Picker
                        selectedValue={type}
                        onValueChange={(itemValue) => setType(itemValue)}
                        style={{ color: '#FFFFFF' }}
                    >
                        <Picker.Item label="Conta Corrente" value="checking" />
                        <Picker.Item label="Poupança" value="savings" />
                        <Picker.Item label="Cartão de Crédito" value="credit_card" />
                        <Picker.Item label="Investimento" value="investment" />
                        <Picker.Item label="Dinheiro Físico" value="cash" />
                    </Picker>
                </View>

                {/* Public Switch */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white">Tornar Pública</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={isPublic ? "#f5dd4b" : "#f4f3f4"}
                        onValueChange={setIsPublic}
                        value={isPublic}
                    />
                </View>

                {/* Corporate Switch */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white">É uma conta corporativa?</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={isCorporate ? "#f5dd4b" : "#f4f3f4"}
                        onValueChange={setIsCorporate}
                        value={isCorporate}
                    />
                </View>

                <TouchableOpacity onPress={handleSave} className="bg-violet-500 p-3 rounded-lg">
                    <Text className="text-white text-center font-bold">Salvar</Text>
                </TouchableOpacity>
                {isEditing && (
                    <View className="flex-row mt-3 gap-x-2">
                         <TouchableOpacity onPress={handleDelete} className="bg-red-500 p-3 rounded-lg flex-1">
                            <Text className="text-white text-center font-bold">Excluir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={clearForm} className="bg-gray-600 p-3 rounded-lg flex-1">
                            <Text className="text-white text-center font-bold">Cancelar Edição</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* List */}
            <Text className="text-white font-bold text-lg mb-4">Minhas Contas</Text>
            <FlatList
                data={userAccounts}
                renderItem={renderAccountItem}
                keyExtractor={(item) => item.id.toString()}
                className="bg-gray-800 rounded-lg"
                ListEmptyComponent={<Text className="text-white/60 text-center p-4">Nenhuma conta pessoal encontrada.</Text>}
            />

            <TouchableOpacity onPress={onClose} className="mt-6 bg-gray-700 p-3 rounded-lg">
                <Text className="text-white text-center">Fechar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default AccountManager;
