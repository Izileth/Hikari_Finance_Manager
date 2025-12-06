import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Transaction, Account, Category } from '../../context/FinancialContext'; // Import Account and Category
import Svg, { Path } from 'react-native-svg';


interface TransactionListProps {
    transactions: Transaction[];
    onTransactionPress: (transaction: Transaction) => void;
    accounts: Account[]; // Added accounts prop
    categories: Category[]; // Added categories prop
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

interface TransactionItemProps {
    item: Transaction;
    onPress: (transaction: Transaction) => void;
    accountName: string | undefined;
    categoryName: string | undefined;
}

function TransactionItem({ item, onPress, accountName, categoryName }: TransactionItemProps) {
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
        <TouchableOpacity onPress={() => onPress(item)} className="border border-white/20 rounded-lg p-4 mb-3 flex-row items-center">
            {/* Icon */}
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isIncome ? 'bg-white/10' : 'bg-white/10'}`}>
                {isIncome ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />}
            </View>

            {/* Content */}
            <View className="flex-1">
                <Text className="text-white font-medium text-base" numberOfLines={1}>
                    {item.title || item.description}
                </Text>
                {item.notes && (
                    <Text className="text-white/40 text-xs mt-0.5" numberOfLines={1}>
                        {item.notes}
                    </Text>
                )}
                <Text className="text-white/40 text-xs mt-0.5">
                    {formattedDate} {accountName && `• ${accountName}`} {categoryName && `• ${categoryName}`}
                </Text>
            </View>

            {/* Amount */}
            <View className="items-end">
                <Text className={`font-bold text-base ${isIncome ? 'text-white' : 'text-white'}`}>
                    {isIncome ? '+' : '-'} {formattedAmount}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export function TransactionList({ transactions, onTransactionPress, accounts, categories }: TransactionListProps) {
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
            renderItem={({ item }) => {
                const accountName = accounts.find(acc => acc.id === item.account_id)?.name;
                const categoryName = categories.find(cat => cat.id === item.category_id)?.name;
                return (
                    <TransactionItem 
                        item={item} 
                        onPress={onTransactionPress} 
                        accountName={accountName}
                        categoryName={categoryName}
                    />
                );
            }}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
        />
    );
}