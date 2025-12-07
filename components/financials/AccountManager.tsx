import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, ScrollView, Switch, Platform } from 'react-native';
import { useFinancials, Account, AccountInsert, AccountUpdate } from '../../context/FinancialContext';
import { useAuth } from '../../context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import Svg, { Path, Circle } from 'react-native-svg';

interface AccountManagerProps {
    onClose: () => void;
}

// SVG Icons
const BankIcon = ({ size = 20 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9 22V12h6v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const PlusIcon = ({ size = 20 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const TrashIcon = ({ size = 20 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const GlobeIcon = ({ size = 16 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
        <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </Svg>
);

const BriefcaseIcon = ({ size = 16 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const AccountManager: React.FC<AccountManagerProps> = ({ onClose }) => {
    const { accounts, addAccount, updateAccount, deleteAccount } = useFinancials();
    const { profile } = useAuth();

    const [isEditing, setIsEditing] = useState<Account | null>(null);
    const [name, setName] = useState('');
    const [type, setType] = useState<string>('checking');
    const [initialBalance, setInitialBalance] = useState('');
    const [currency, setCurrency] = useState('BRL');
    const [isPublic, setIsPublic] = useState(false);
    const [isCorporate, setIsCorporate] = useState(false);

    const userAccounts = useMemo(() => {
        return accounts.filter(acc => acc.profile_id === profile?.id);
    }, [accounts, profile]);

    useEffect(() => {
        if (isEditing) {
            setName(isEditing.name);
            setType(isEditing.type);
            setInitialBalance(String(isEditing.initial_balance));
            setCurrency(isEditing.currency || 'BRL');
            setIsPublic(isEditing.is_public || false);
            setIsCorporate(isEditing.is_corporate || false);
        } else {
            setName('');
            setType('checking');
            setInitialBalance('');
            setCurrency('BRL');
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
            Alert.alert('Atenção', 'Nome e Saldo Inicial são obrigatórios');
            return;
        }
        const numericBalance = parseFloat(initialBalance.replace(',', '.'));
        if (isNaN(numericBalance)) {
            Alert.alert('Erro', 'O saldo inicial deve ser um número válido');
            return;
        }

        try {
            if (isEditing) {
                const accountData: AccountUpdate = {
                    name,
                    type: type as any,
                    initial_balance: numericBalance,
                    currency,
                    is_public: isPublic,
                    is_corporate: isCorporate
                };
                await updateAccount(isEditing.id, accountData);
            } else {
                if (!profile?.id) {
                    Alert.alert('Erro', 'Usuário não autenticado para criar conta');
                    return;
                }
                const accountData: AccountInsert = {
                    name,
                    type: type as any,
                    initial_balance: numericBalance,
                    currency,
                    is_public: isPublic,
                    is_corporate: isCorporate
                };
                const newAccount = await addAccount(accountData);
                if (newAccount && newAccount.length > 0) {
                    setIsEditing(newAccount[0]);
                }
            }
            if (isEditing) {
                clearForm();
            }
        } catch (error: any) {
            Alert.alert('Erro ao Salvar', error.message);
        }
    };

    const handleDelete = async () => {
        if (!isEditing) return;

        Alert.alert(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir a conta "${isEditing.name}"?`,
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

    const getAccountTypeName = (type: string) => {
        const typeMap: { [key: string]: string } = {
            'checking': 'Conta Corrente',
            'savings': 'Poupança',
            'credit_card': 'Cartão de Crédito',
            'cash': 'Dinheiro',
            'investment': 'Investimento'
        };
        return typeMap[type] || type;
    };

    const renderAccountItem = ({ item }: { item: Account }) => (
        <TouchableOpacity
            onPress={() => handleSelectAccount(item)}
            className="border border-white/20 rounded-lg p-4 mb-3"
            activeOpacity={0.7}
        >
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white font-bold text-base flex-1">{item.name}</Text>
                <View className="flex-row gap-2">
                    {item.is_public && <GlobeIcon size={14} />}
                    {item.is_corporate && <BriefcaseIcon size={14} />}
                </View>
            </View>
            <Text className="text-white/40 text-sm">
                {getAccountTypeName(item.type)} • {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: item.currency || 'BRL'
                }).format(Number(item.initial_balance))}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView className="flex-1 bg-black">
            <View className="py-6">
                {/* Header */}
                <Text className="text-white text-2xl font-bold mb-8">
                    Gerenciar Contas
                </Text>

                {/* Form */}
                <View className="mb-8">
                    <Text className="text-white text-lg font-bold mb-6">
                        {isEditing ? 'Editar Conta' : 'Nova Conta'}
                    </Text>

                    {/* Name */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">Nome da Conta</Text>
                        <View className="border border-white/20 rounded-lg">
                            <TextInput
                                className="text-white px-4 py-4 text-base"
                                placeholder="Ex: Banco Inter"
                                placeholderTextColor="#666666"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    {/* Initial Balance */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">Saldo Inicial</Text>
                        <View className="border border-white/20 rounded-lg">
                            <TextInput
                                className="text-white px-4 py-4 text-base"
                                placeholder="0,00"
                                placeholderTextColor="#666666"
                                keyboardType="numeric"
                                value={initialBalance}
                                onChangeText={setInitialBalance}
                            />
                        </View>
                    </View>

                    {/* Currency */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">Moeda</Text>
                        <View className="border border-white/20 rounded-lg">
                            <TextInput
                                className="text-white px-4 py-4 text-base"
                                placeholder="BRL"
                                placeholderTextColor="#666666"
                                value={currency}
                                onChangeText={setCurrency}
                            />
                        </View>
                    </View>

                    {/* Type Picker */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">Tipo de Conta</Text>
                        <View className="border border-white/20 rounded-lg overflow-hidden">
                            <Picker
                                selectedValue={type}
                                onValueChange={(itemValue) => setType(itemValue)}
                                style={{ color: '#FFFFFF', backgroundColor: 'transparent' }}
                                dropdownIconColor="#FFFFFF"
                            >
                                <Picker.Item label="Conta Corrente" value="checking" color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                                <Picker.Item label="Poupança" value="savings" color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                                <Picker.Item label="Cartão de Crédito" value="credit_card" color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                                <Picker.Item label="Investimento" value="investment" color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                                <Picker.Item label="Dinheiro" value="cash" color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                            </Picker>
                        </View>
                    </View>

                    {/* Public Switch */}
                    <View className="flex-row items-center justify-between mb-4 p-4 border border-white/20 rounded-lg">
                        <View className="flex-1 mr-4">
                            <Text className="text-white font-medium mb-1">Conta Pública</Text>
                            <Text className="text-white/40 text-xs">
                                Outros usuários poderão ver esta conta
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#333333', true: '#ffffff' }}
                            thumbColor={isPublic ? '#000000' : '#666666'}
                            ios_backgroundColor="#333333"
                            onValueChange={setIsPublic}
                            value={isPublic}
                        />
                    </View>

                    {/* Corporate Switch */}
                    <View className="flex-row items-center justify-between mb-6 p-4 border border-white/20 rounded-lg">
                        <View className="flex-1 mr-4">
                            <Text className="text-white font-medium mb-1">Conta Corporativa</Text>
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

                    {/* Action Buttons */}
                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-white rounded-lg py-4 mb-3 flex-row items-center justify-center"
                    >
                        <PlusIcon size={20} />
                        <Text className="text-black text-center font-bold text-base ml-2">
                            {isEditing ? 'Atualizar' : 'Criar Conta'}
                        </Text>
                    </TouchableOpacity>

                    {isEditing && (
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="flex-1 border border-white/20 rounded-lg py-4 flex-row items-center justify-center"
                            >
                                <TrashIcon size={18} />
                                <Text className="text-white text-center font-bold ml-2">
                                    Excluir
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={clearForm}
                                className="flex-1 border border-white/20 rounded-lg py-4"
                            >
                                <Text className="text-white text-center font-bold">
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Divider */}
                <View className="h-px bg-white/20 my-8" />

                {/* Account List */}
                <View className="mb-8">
                    <Text className="text-white text-lg font-bold mb-4">Minhas Contas</Text>
                    {userAccounts.length > 0 ? (
                        <FlatList
                            data={userAccounts}
                            renderItem={renderAccountItem}
                            keyExtractor={(item) => item.id.toString()}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View className="border border-white/20 rounded-lg p-8 items-center">
                            <BankIcon size={40} />
                            <Text className="text-white/40 text-center mt-4">
                                Nenhuma conta encontrada
                            </Text>
                        </View>
                    )}
                </View>

                {/* Close Button */}
                <TouchableOpacity
                    onPress={onClose}
                    className="border border-white/20 rounded-lg py-4"
                >
                    <Text className="text-white text-center font-medium">
                        Fechar
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default AccountManager;