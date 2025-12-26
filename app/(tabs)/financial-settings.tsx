import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AccountManager from '../../components/financials/AccountManager';
import CategoryManager from '../../components/financials/CategoryManager';
import { useRouter } from 'expo-router';
import { BackIcon } from '../../components/ui/Icons';
export default function FinancialSettingsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'accounts' | 'categories'>('accounts');

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-black"
        >
            <SafeAreaView className="flex-1 bg-black">
                {/* Header */}
                <View className="flex-row items-center p-4">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <BackIcon />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold ml-4">Ajustes Financeiros</Text>
                </View>

                {/* Tab Switcher */}
                <View className="px-2 mb-6">
                    <View className="flex-row border border-white/20 rounded-lg overflow-hidden">
                        <TouchableOpacity
                            onPress={() => setActiveTab('accounts')}
                            className="flex-1 py-3 relative"
                        >
                            <Text className={`text-center font-bold ${activeTab === 'accounts' ? 'text-white' : 'text-white/40'}`}>
                                Contas
                            </Text>
                            {activeTab === 'accounts' && (
                                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                            )}
                        </TouchableOpacity>

                        <View className="w-px bg-white/20" />

                        <TouchableOpacity
                            onPress={() => setActiveTab('categories')}
                            className="flex-1 py-3 relative"
                        >
                            <Text className={`text-center font-bold ${activeTab === 'categories' ? 'text-white' : 'text-white/40'}`}>
                                Categorias
                            </Text>
                            {activeTab === 'categories' && (
                                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* Content */}
                <View className="flex-1 px-2">
                    {activeTab === 'accounts' ? (
                        <AccountManager onClose={() => {}} showCloseButton={false} />
                    ) : (
                        <CategoryManager onClose={() => {}} showCloseButton={false} />
                    )}
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}