import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Transaction } from '../../context/FinancialContext';
import Svg, { Path } from 'react-native-svg';

interface TransactionListProps {
    transactions: Transaction[];
}

// SVG Icons
const ArrowUpIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ArrowDownIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M19 12l-7 7-7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

function TransactionItem({ item }: { item: Transaction }) {
    const isIncome = Number(item.amount) > 0;

    // Format date
    const date = new Date(item.transaction_date);
    const formattedDate = date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short' 
    });

    // Format amount
    const formattedAmount = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(Math.abs(Number(item.amount)));

    return (
        <View className="border border-white/20 rounded-lg p-4 mb-3 flex-row items-center">
            {/* Icon */}
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isIncome ? 'bg-white/10' : 'bg-white/10'}`}>
                {isIncome ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />}
            </View>

            {/* Content */}
            <View className="flex-1">
                <Text className="text-white font-medium text-base" numberOfLines={1}>
                    {item.description}
                </Text>
                <Text className="text-white/40 text-xs mt-0.5">
                    {formattedDate}
                </Text>
            </View>

            {/* Amount */}
            <View className="items-end">
                <Text className={`font-bold text-base ${isIncome ? 'text-white' : 'text-white'}`}>
                    {isIncome ? '+' : '-'} {formattedAmount}
                </Text>
            </View>
        </View>
    );
}

export function TransactionList({ transactions }: TransactionListProps) {
    if (transactions.length === 0) {
        return (
            <View className="border border-white/20 rounded-lg p-8 items-center">
                <Text className="text-white/40 text-center">
                    Nenhuma transação encontrada
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={transactions}
            renderItem={({ item }) => <TransactionItem item={item} />}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
        />
    );
}