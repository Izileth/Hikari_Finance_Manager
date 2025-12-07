import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AccountManager from '../../components/financials/AccountManager';
import CategoryManager from '../../components/financials/CategoryManager';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

const BackIcon = ({ size = 24, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
);

export default function FinancialSettingsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'accounts' | 'categories'>('accounts');

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-1">
                {/* Header */}
                <View className="flex-row items-center px-6 py-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <BackIcon />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold">Ajustes Financeiros</Text>
                </View>

                {/* Tab Switcher */}
                <View className="px-6 mb-6">
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
                <ScrollView className="flex-1">
                    {activeTab === 'accounts' ? (
                        <AccountManager onClose={() => {}} />
                    ) : (
                        <CategoryManager onClose={() => {}} />
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}