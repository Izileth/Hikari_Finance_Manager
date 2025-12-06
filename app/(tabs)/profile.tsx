import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Image, Dimensions } from "react-native";
import React, { useState, useMemo } from 'react';
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { useFinancials } from "../../context/FinancialContext";
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle } from 'react-native-svg';
import { useRouter } from "expo-router";
import { LineChart, BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

// SVG Icons
const CameraIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="13" r="4" stroke="black" strokeWidth="2"/>
  </Svg>
);

const EditIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const LogoutIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const FinancialsIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ChartIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3v18h18M7 16l4-4 4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const { profile, uploadAvatar, uploadBanner, loading: profileLoading } = useProfile();
    const { transactions, categories, loading: financialsLoading } = useFinancials();
    const router = useRouter();
    
    const [isSaving, setIsSaving] = useState(false);

    const handlePickAvatar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setIsSaving(true);
            const { error } = await uploadAvatar(result.assets[0]);
            if (error) {
                Alert.alert('Erro no Upload', error.message);
            } else {
                Alert.alert('Sucesso', 'Avatar atualizado!');
            }
            setIsSaving(false);
        }
    };

    const handlePickBanner = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            setIsSaving(true);
            const { error } = await uploadBanner(result.assets[0]);
            if (error) {
                Alert.alert('Erro no Upload', error.message);
            } else {
                Alert.alert('Sucesso', 'Banner atualizado!');
            }
            setIsSaving(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair da sua conta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: signOut }
            ]
        );
    };

    const getInitials = () => {
        if (!profile?.name) return '?';
        const names = profile.name.trim().split(' ');
        if (names.length === 1) return names[0][0].toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    // Chart Data Processing
    const { netIncomeData, expensesByCategoryData, incomeVsExpensesData, monthlyIncomeData, monthlyExpensesData, savingsRateData, topExpensesData } = useMemo(() => {
        const sortedTransactions = [...transactions].sort((a, b) => 
            new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
        );

        // Net Income over Time (Last 6 months)
        const monthlyDataMap = new Map<string, { income: number; expense: number }>();
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            monthlyDataMap.set(monthYear, { income: 0, expense: 0 });
        }

        sortedTransactions.forEach(t => {
            const transactionDate = new Date(t.transaction_date);
            const monthYear = `${transactionDate.getFullYear()}-${(transactionDate.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (monthlyDataMap.has(monthYear)) {
                if (Number(t.amount) > 0) {
                    monthlyDataMap.get(monthYear)!.income += Number(t.amount);
                } else {
                    monthlyDataMap.get(monthYear)!.expense += Math.abs(Number(t.amount));
                }
            }
        });

        const netIncomeLabels: string[] = [];
        const netIncomeDataset: number[] = [];
        const monthlyIncomeDataset: number[] = [];
        const monthlyExpensesDataset: number[] = [];
        const savingsRateDataset: number[] = [];
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        Array.from(monthlyDataMap.keys()).sort().forEach(monthYearKey => {
            const [, month] = monthYearKey.split('-');
            const monthIndex = parseInt(month, 10) - 1;
            const data = monthlyDataMap.get(monthYearKey)!;
            netIncomeLabels.push(monthNames[monthIndex]);
            netIncomeDataset.push(data.income - data.expense);
            monthlyIncomeDataset.push(data.income);
            monthlyExpensesDataset.push(data.expense);
            
            // Calculate savings rate (%)
            const savingsRate = data.income > 0 ? ((data.income - data.expense) / data.income) * 100 : 0;
            savingsRateDataset.push(Math.round(savingsRate));
        });

        const netIncomeData = {
            labels: netIncomeLabels,
            datasets: [{ data: netIncomeDataset.length > 0 ? netIncomeDataset : [0] }]
        };

        const monthlyIncomeData = {
            labels: netIncomeLabels,
            datasets: [{ data: monthlyIncomeDataset.length > 0 ? monthlyIncomeDataset : [0] }]
        };

        const monthlyExpensesData = {
            labels: netIncomeLabels,
            datasets: [{ data: monthlyExpensesDataset.length > 0 ? monthlyExpensesDataset : [0] }]
        };

        const savingsRateData = {
            labels: netIncomeLabels,
            datasets: [{ data: savingsRateDataset.length > 0 ? savingsRateDataset : [0] }]
        };

        // Expenses by Category
        const expensesByCategoryMap = new Map<string, number>();
        sortedTransactions.filter(t => Number(t.amount) < 0).forEach(t => {
            const category = categories.find(c => c.id === t.category_id);
            const categoryName = category ? category.name : 'Outros';
            expensesByCategoryMap.set(categoryName, (expensesByCategoryMap.get(categoryName) || 0) + Math.abs(Number(t.amount)));
        });

        const expensesByCategoryData = {
            labels: Array.from(expensesByCategoryMap.keys()).slice(0, 5),
            datasets: [{ data: Array.from(expensesByCategoryMap.values()).slice(0, 5) }]
        };

        // Top 5 Largest Expenses
        const topExpenses = sortedTransactions
            .filter(t => Number(t.amount) < 0)
            .map(t => ({
                description: t.description.slice(0, 15),
                amount: Math.abs(Number(t.amount))
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        const topExpensesData = {
            labels: topExpenses.map(e => e.description),
            datasets: [{ data: topExpenses.map(e => e.amount) }]
        };

        // Income vs Expenses
        let totalIncome = 0;
        let totalExpenses = 0;
        sortedTransactions.forEach(t => {
            if (Number(t.amount) > 0) {
                totalIncome += Number(t.amount);
            } else {
                totalExpenses += Math.abs(Number(t.amount));
            }
        });

        const incomeVsExpensesData = {
            labels: ["Receita", "Despesa"],
            datasets: [{ data: [totalIncome, totalExpenses] }]
        };

        return { netIncomeData, expensesByCategoryData, incomeVsExpensesData, monthlyIncomeData, monthlyExpensesData, savingsRateData, topExpensesData };
    }, [transactions, categories]);

    if (profileLoading || financialsLoading || !profile) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white/60 mt-4">Carregando perfil...</Text>
            </View>
        );
    }

    const chartConfig = {
        backgroundColor: "#000000",
        backgroundGradientFrom: "#000000",
        backgroundGradientTo: "#000000",
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.6,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
        propsForBackgroundLines: {
            strokeDasharray: "",
            stroke: "rgba(255, 255, 255, 0.1)",
            strokeWidth: 1
        },
        propsForLabels: {
            fill: "rgba(255, 255, 255, 0.6)"
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-black"
        >
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1">
                    {/* Banner Section */}
                    <TouchableOpacity 
                        onPress={handlePickBanner} 
                        disabled={isSaving} 
                        className="relative h-48 bg-white/5 border-b border-white/10"
                    >
                        {profile?.banner_url ? (
                            <Image source={{ uri: profile.banner_url }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <View className="w-full h-full justify-center items-center">
                                <ChartIcon size={40} />
                                <Text className="text-white/40 mt-2 text-sm">Adicionar banner</Text>
                            </View>
                        )}
                        <View className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white items-center justify-center">
                            {isSaving ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : (
                                <CameraIcon size={18} />
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Avatar Section */}
                    <View className="items-center -mt-14 mb-8">
                        <TouchableOpacity 
                            onPress={handlePickAvatar} 
                            disabled={isSaving}
                            className="relative mb-4"
                        >
                            <View className="w-28 h-28 rounded-full border-4 border-black bg-white/10 items-center justify-center overflow-hidden">
                                {profile?.avatar_url ? (
                                    <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
                                ) : (
                                    <Text className="text-white text-4xl font-bold">
                                        {getInitials()}
                                    </Text>
                                )}
                            </View>
                            
                            <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white items-center justify-center border-2 border-black">
                                {(isSaving && profileLoading) ? (
                                    <ActivityIndicator size="small" color="#000" />
                                ) : (
                                    <CameraIcon size={18} />
                                )}
                            </View>
                        </TouchableOpacity>

                        <Text className="text-white text-2xl font-bold mb-1">
                            {profile?.name || 'Seu Nome'}
                        </Text>
                        
                        {profile?.nickname && (
                            <Text className="text-white/60 text-base mb-2">
                                @{profile.nickname}
                            </Text>
                        )}
                        
                        <Text className="text-white/40 text-sm">
                            {user?.email}
                        </Text>
                    </View>

                    <View className="px-8 pb-8">
                        {/* Action Buttons */}
                        <View className="flex-row gap-3 mb-8">
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/edit-profile')}
                                className="flex-1 flex-row items-center justify-center py-3 border border-white/20 rounded-lg"
                            >
                                <EditIcon size={16} />
                                <Text className="text-white font-medium ml-2">
                                    Editar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/financials')}
                                className="flex-1 flex-row items-center justify-center py-3 border border-white/20 rounded-lg"
                            >
                                <FinancialsIcon size={16} />
                                <Text className="text-white font-medium ml-2">
                                    Finanças
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Bio */}
                        {profile?.bio && (
                            <View className="mb-8">
                                <Text className="text-white/40 text-xs mb-2">
                                    BIO
                                </Text>
                                <Text className="text-white text-base leading-6">
                                    {profile.bio}
                                </Text>
                            </View>
                        )}

                        {/* Financial Dashboard */}
                        {transactions.length > 0 && (
                            <View className="mb-8">
                                <Text className="text-white text-xl font-bold mb-6">Dashboard Financeiro</Text>

                                {/* Net Income Chart */}
                                <View className="mb-8">
                                    <Text className="text-white/60 text-sm mb-3">Saldo Líquido (6 meses)</Text>
                                    <View className="border border-white/10 rounded-lg overflow-hidden">
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <LineChart
                                                data={netIncomeData}
                                                width={Math.max(screenWidth - 64, netIncomeData.labels.length * 60)}
                                                height={200}
                                                chartConfig={chartConfig}
                                                bezier
                                                withInnerLines={false}
                                                withOuterLines={false}
                                                style={{ paddingRight: 0 }}
                                            />
                                        </ScrollView>
                                    </View>
                                </View>

                                {/* Monthly Income Trend */}
                                <View className="mb-8">
                                    <Text className="text-white/60 text-sm mb-3">Evolução de Receitas</Text>
                                    <View className="border border-white/10 rounded-lg overflow-hidden">
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <LineChart
                                                data={monthlyIncomeData}
                                                width={Math.max(screenWidth - 64, monthlyIncomeData.labels.length * 60)}
                                                height={200}
                                                chartConfig={chartConfig}
                                                bezier
                                                withInnerLines={false}
                                                withOuterLines={false}
                                                style={{ paddingRight: 0 }}
                                            />
                                        </ScrollView>
                                    </View>
                                </View>

                                {/* Monthly Expenses Trend */}
                                <View className="mb-8">
                                    <Text className="text-white/60 text-sm mb-3">Evolução de Despesas</Text>
                                    <View className="border border-white/10 rounded-lg overflow-hidden">
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <LineChart
                                                data={monthlyExpensesData}
                                                width={Math.max(screenWidth - 64, monthlyExpensesData.labels.length * 60)}
                                                height={200}
                                                chartConfig={chartConfig}
                                                bezier
                                                withInnerLines={false}
                                                withOuterLines={false}
                                                style={{ paddingRight: 0 }}
                                            />
                                        </ScrollView>
                                    </View>
                                </View>

                                {/* Savings Rate */}
                                <View className="mb-8">
                                    <Text className="text-white/60 text-sm mb-3">Taxa de Poupança (%)</Text>
                                    <View className="border border-white/10 rounded-lg overflow-hidden">
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <BarChart
                                                data={savingsRateData}
                                                width={Math.max(screenWidth - 64, savingsRateData.labels.length * 60)}
                                                height={200}
                                                chartConfig={chartConfig}
                                                withInnerLines={false}
                                                fromZero
                                                yAxisLabel=""
                                                yAxisSuffix="%"
                                                style={{ paddingRight: 0 }}
                                            />
                                        </ScrollView>
                                    </View>
                                </View>

                                {/* Income vs Expenses */}
                                <View className="mb-8">
                                    <Text className="text-white/60 text-sm mb-3">Receita vs Despesa (Total)</Text>
                                    <View className="border border-white/10 rounded-lg overflow-hidden">
                                        <BarChart
                                            data={incomeVsExpensesData}
                                            width={screenWidth - 64}
                                            height={200}
                                            chartConfig={chartConfig}
                                            withInnerLines={false}
                                            fromZero
                                            yAxisLabel=""
                                            yAxisSuffix=""
                                        />
                                    </View>
                                </View>

                                {/* Expenses by Category */}
                                {expensesByCategoryData.labels.length > 0 && (
                                    <View className="mb-8">
                                        <Text className="text-white/60 text-sm mb-3">Top 5 Categorias de Despesas</Text>
                                        <View className="border border-white/10 rounded-lg overflow-hidden">
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                <BarChart
                                                    data={expensesByCategoryData}
                                                    width={Math.max(screenWidth - 64, expensesByCategoryData.labels.length * 80)}
                                                    height={200}
                                                    chartConfig={chartConfig}
                                                    withInnerLines={false}
                                                    fromZero
                                                    yAxisLabel=""
                                                    yAxisSuffix=""
                                                    style={{ paddingRight: 0 }}
                                                />
                                            </ScrollView>
                                        </View>
                                    </View>
                                )}

                                {/* Top 5 Largest Expenses */}
                                {topExpensesData.labels.length > 0 && (
                                    <View className="mb-8">
                                        <Text className="text-white/60 text-sm mb-3">Top 5 Maiores Despesas</Text>
                                        <View className="border border-white/10 rounded-lg overflow-hidden">
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                <BarChart
                                                    data={topExpensesData}
                                                    width={Math.max(screenWidth - 64, topExpensesData.labels.length * 80)}
                                                    height={200}
                                                    chartConfig={chartConfig}
                                                    withInnerLines={false}
                                                    fromZero
                                                    yAxisLabel=""
                                                    yAxisSuffix=""
                                                    style={{ paddingRight: 0 }}
                                                />
                                            </ScrollView>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        {transactions.length === 0 && (
                            <View className="border border-white/20 rounded-lg p-8 mb-8 items-center">
                                <ChartIcon size={40} />
                                <Text className="text-white/40 text-center mt-4">
                                    Nenhuma transação para exibir
                                </Text>
                            </View>
                        )}

                        {/* Divider */}
                        <View className="h-px bg-white/20 my-8" />

                        {/* Logout Button */}
                        <TouchableOpacity
                            onPress={handleSignOut}
                            className="flex-row items-center justify-center py-4 border border-white/20 rounded-lg"
                        >
                            <LogoutIcon size={20} />
                            <Text className="text-white font-bold ml-2">
                                Sair da Conta
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}