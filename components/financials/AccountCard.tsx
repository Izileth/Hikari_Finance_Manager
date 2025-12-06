
import React from 'react';
import { View, Text } from 'react-native';
import { Account } from '../../context/FinancialContext';

interface AccountCardProps {
    account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
    const cardColor = account.color || '#4B5563'; // gray-600

    return (
        <View 
            className="p-4 rounded-lg mb-3" 
            style={{ backgroundColor: cardColor }}
        >
            <Text className="text-white font-bold text-lg">{account.name}</Text>
            <Text className="text-white/80 capitalize">{account.type.replace('_', ' ')}</Text>
            <View className="mt-4">
                <Text className="text-white/60 text-sm">Saldo</Text>
                <Text className="text-white font-semibold text-2xl">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: account.currency || 'BRL' }).format(Number(account.initial_balance))}
                </Text>
            </View>
        </View>
    );
}
