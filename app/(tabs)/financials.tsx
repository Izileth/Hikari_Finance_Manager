import { View, Text, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Modal } from "react-native";
import React, { useState } from 'react';
import { useFinancials } from "../../context/FinancialContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccountCard } from "../../components/financials/AccountCard";
import { TransactionList } from "../../components/financials/TransactionList";
import TransactionForm from "../../components/financials/TransactionForm";
import CategoryManager from "../../components/financials/CategoryManager";
import AccountManager from "../../components/financials/AccountManager"; // Import AccountManager
import { useRouter } from "expo-router";
import Svg, { Path } from 'react-native-svg';

const PlusIcon = ({ size = 24, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 5v14M5 12h14" />
    </Svg>
);

const BackIcon = ({ size = 24, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
);

const CogIcon = ({ size = 20, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 20V10M12 20a8 8 0 100-16 8 8 0 000 16zM12 9a1 1 0 100-2 1 1 0 000 2z"/>
    </Svg>
  );

export default function FinancialsScreen() {
    const { accounts, transactions, loading, error, refetch } = useFinancials();
    const router = useRouter();
    const [transactionModalVisible, setTransactionModalVisible] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [accountModalVisible, setAccountModalVisible] = useState(false); // State for account modal

    // Handlers for Transaction Modal
    const handlePresentTransactionModal = () => setTransactionModalVisible(true);
    const handleSaveTransaction = () => {
        setTransactionModalVisible(false);
        refetch();
    };
    const handleCloseTransaction = () => setTransactionModalVisible(false);

    // Handlers for Category Modal
    const handlePresentCategoryModal = () => setCategoryModalVisible(true);
    const handleCloseCategory = () => setCategoryModalVisible(false);

    // Handlers for Account Modal
    const handlePresentAccountModal = () => setAccountModalVisible(true);
    const handleCloseAccount = () => setAccountModalVisible(false);


    const renderContent = () => {
        if (loading && !accounts.length) {
            return (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text className="text-white/60 mt-4">Carregando dados financeiros...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-red-500 text-lg">Erro ao carregar os dados</Text>
                    <Text className="text-white/60 mt-2">{error.message}</Text>
                </View>
            );
        }

        return (
            <ScrollView
                className="flex-1 px-6"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#ffffff" />}
            >
                {/* Accounts Section */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-xl font-semibold">Contas</Text>
                        <TouchableOpacity onPress={handlePresentAccountModal} className="p-2">
                           <CogIcon />
                        </TouchableOpacity>
                    </View>
                    {accounts.length > 0 ? (
                        accounts.map(account => <AccountCard key={account.id} account={account} />)
                    ) : (
                        <Text className="text-white/60">Nenhuma conta encontrada.</Text>
                    )}
                </View>

                {/* Transactions Section */}
                <View>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-xl font-semibold">Transações Recentes</Text>
                        <TouchableOpacity onPress={handlePresentCategoryModal} className="p-2">
                           <CogIcon />
                        </TouchableOpacity>
                    </View>
                    <TransactionList transactions={transactions} />
                </View>
            </ScrollView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-1">
                {/* Header */}
                <View className="flex-row items-center p-4">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <BackIcon />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold ml-4">Minhas Finanças</Text>
                </View>

                {renderContent()}

                {/* FAB to add transaction */}
                <TouchableOpacity
                    onPress={handlePresentTransactionModal}
                    className="absolute bottom-6 right-6 bg-violet-500 w-16 h-16 rounded-full justify-center items-center shadow-lg"
                >
                    <PlusIcon />
                </TouchableOpacity>

                {/* Transaction Form Modal */}
                <Modal
                    animationType="slide"
                    visible={transactionModalVisible}
                    onRequestClose={handleCloseTransaction}
                >
                    <TransactionForm onSave={handleSaveTransaction} onClose={handleCloseTransaction} />
                </Modal>

                {/* Category Manager Modal */}
                <Modal
                    animationType="slide"
                    visible={categoryModalVisible}
                    onRequestClose={handleCloseCategory}
                >
                    <CategoryManager onClose={handleCloseCategory} />
                </Modal>

                {/* Account Manager Modal */}
                <Modal
                    animationType="slide"
                    visible={accountModalVisible}
                    onRequestClose={handleCloseAccount}
                >
                    <AccountManager onClose={handleCloseAccount} />
                </Modal>
            </View>
        </SafeAreaView>
    );
}
