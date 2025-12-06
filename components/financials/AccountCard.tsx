import React from 'react';
import { View, Text } from 'react-native';
import { Account } from '../../context/FinancialContext';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface AccountCardProps {
    account: Account;
}

// SVG Icons for account types
const BankIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 22V12h6v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CreditCardIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="1" y="4" width="22" height="16" rx="2" stroke="white" strokeWidth="2"/>
    <Path d="M1 10h22" stroke="white" strokeWidth="2"/>
  </Svg>
);

const WalletIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="13" rx="2" stroke="white" strokeWidth="2"/>
    <Path d="M3 10h18M7 6V4a1 1 0 011-1h8a1 1 0 011 1v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <Circle cx="17" cy="13" r="1.5" fill="white"/>
  </Svg>
);

const PiggyBankIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2"/>
    <Path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const InvestmentIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3v18h18M7 16l4-4 4 4 6-6M17 10h4v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'checking':
        case 'checking_account':
            return <BankIcon size={20} />;
        case 'savings':
        case 'savings_account':
            return <PiggyBankIcon size={20} />;
        case 'credit_card':
            return <CreditCardIcon size={20} />;
        case 'investment':
            return <InvestmentIcon size={20} />;
        case 'cash':
        default:
            return <WalletIcon size={20} />;
    }
};

const getAccountTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
        'checking': 'Conta Corrente',
        'checking_account': 'Conta Corrente',
        'savings': 'Poupança',
        'savings_account': 'Poupança',
        'credit_card': 'Cartão de Crédito',
        'cash': 'Dinheiro',
        'investment': 'Investimento'
    };
    return typeMap[type.toLowerCase()] || type.replace('_', ' ');
};

export function AccountCard({ account }: AccountCardProps) {
    // Format balance
    const formattedBalance = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: account.currency || 'BRL' 
    }).format(Number(account.current_balance));

    // Check if balance is negative
    const isNegative = Number(account.current_balance) < 0;

    return (
        <View className="border border-white/20 rounded-lg p-4 mb-3 bg-black">
            {/* Header with Icon and Name */}
            <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3">
                    {getAccountIcon(account.type)}
                </View>
                <View className="flex-1">
                    <Text className="text-white font-bold text-base" numberOfLines={1}>
                        {account.name}
                    </Text>
                    <Text className="text-white/40 text-xs mt-0.5">
                        {getAccountTypeName(account.type)}
                    </Text>
                </View>
            </View>

            {/* Balance Section */}
            <View className="border-t border-white/10 pt-3">
                <Text className="text-white/40 text-xs mb-1">
                    Saldo {account.type.toLowerCase() === 'credit_card' ? 'Disponível' : 'Atual'}
                </Text>
                <Text className={`font-bold text-2xl ${isNegative ? 'text-white/60' : 'text-white'}`}>
                    {formattedBalance}
                </Text>
            </View>

            {/* Optional: Show currency if not BRL */}
            {account.currency && account.currency !== 'BRL' && (
                <View className="mt-2">
                    <Text className="text-white/20 text-xs">
                        {account.currency}
                    </Text>
                </View>
            )}
        </View>
    );
}