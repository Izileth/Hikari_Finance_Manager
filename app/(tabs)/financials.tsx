import { View, Text, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Modal } from "react-native";
import React, { useState } from 'react';
import { useFinancials, Transaction } from "../../context/FinancialContext";
import { AccountCard } from "../../components/financials/AccountCard";
import { TransactionList } from "../../components/financials/TransactionList";
import TransactionForm from "../../components/financials/TransactionForm";
import CategoryManager from "../../components/financials/CategoryManager";
import AccountManager from "../../components/financials/AccountManager";
import CustomHeader from "@/components/ui/CustomHeader";
import { PlusIcon, CogIcon } from "../../components/ui/Icons";

export default function FinancialsScreen() {
    const { accounts, transactions, categories, loading, error, refetch } = useFinancials();
    const [transactionModalVisible, setTransactionModalVisible] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [accountModalVisible, setAccountModalVisible] = useState(false);

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    // Handlers for Transaction Modal
    const handlePresentTransactionModal = (transactionToEdit?: Transaction) => {
        setSelectedTransaction(transactionToEdit || null);
        setTransactionModalVisible(true);
    };
    const handleSaveTransaction = () => {
        setTransactionModalVisible(false);
        setSelectedTransaction(null);
        refetch();
    };
    const handleCloseTransaction = () => {
        setTransactionModalVisible(false);
        setSelectedTransaction(null);
    };

    const handleTransactionPress = (transaction: Transaction) => {
        handlePresentTransactionModal(transaction);
    };

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
                className="flex-1 px-2"
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
                    <TransactionList transactions={transactions} onTransactionPress={handleTransactionPress} accounts={accounts} categories={categories} />
                </View>
            </ScrollView>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <CustomHeader />

            {renderContent()}

            {/* FAB to add transaction */}
            <TouchableOpacity
                onPress={() => handlePresentTransactionModal()}
                className="absolute bottom-6 right-6 bg-zinc-50 w-16 h-16 rounded-full justify-center items-center shadow-lg"
            >
                <PlusIcon color="black" />
            </TouchableOpacity>

            {/* Transaction Form Modal */}
            <Modal
                animationType="slide"
                visible={transactionModalVisible}
                onRequestClose={handleCloseTransaction}
            >
                <TransactionForm
                    transaction={selectedTransaction}
                    onSave={handleSaveTransaction}
                    onClose={handleCloseTransaction}
                />
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
    );
}

