import { Category, Transaction } from '@/context/FinancialContext';
import { useFinancialChartData } from '@/hooks/useFinancialChartData';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { ChartCard } from './ChartCard';
import { EmptyFinancials } from './EmptyFinancials';
import { AbstractChartConfig } from 'react-native-chart-kit/dist/AbstractChart';

type FinancialDashboardProps = {
    transactions: Transaction[];
    categories: Category[];
};

const screenWidth = Dimensions.get("window").width;

// Configuração base minimalista em branco e preto
const baseChartConfig: AbstractChartConfig = {
    backgroundColor: "#000000",
    backgroundGradientFrom: "#000000",
    backgroundGradientTo: "#000000",
    backgroundGradientFromOpacity: 1,
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2.5,
    barPercentage: 0.65,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForBackgroundLines: {
        strokeDasharray: "",
        stroke: "rgba(255, 255, 255, 0.08)",
        strokeWidth: 1
    },
    propsForLabels: {
        fontSize: 11,
        fontWeight: '500'
    },
    propsForVerticalLabels: {
        fontSize: 10,
        fill: "rgba(255, 255, 255, 0.5)"
    },
    propsForHorizontalLabels: {
        fontSize: 10,
        fill: "rgba(255, 255, 255, 0.5)"
    }
};

// LineChart - Gradiente branco suave
const lineChartConfig: AbstractChartConfig = {
    ...baseChartConfig,
    fillShadowGradientFrom: 'rgba(255, 255, 255, 0.5)',
    fillShadowGradientFromOpacity: 0.5,
    fillShadowGradientTo: 'rgba(255, 255, 255, 0.01)',
    fillShadowGradientToOpacity: 0.01,
    propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: '#000000',
        fill: '#ffffff'
    }
};

// BarChart - Gradiente nas barras
const barChartConfig: AbstractChartConfig = {
    ...baseChartConfig,
    fillShadowGradientFrom: 'rgba(255, 255, 255, 0.8)',
    fillShadowGradientFromOpacity: 0.8,
    fillShadowGradientTo: 'rgba(255, 255, 255, 0.3)',
    fillShadowGradientToOpacity: 0.3,
    propsForBackgroundLines: {
        strokeDasharray: "",
        stroke: "rgba(255, 255, 255, 0.1)",
        strokeWidth: 1
    }
};

// Paleta monocromática para o PieChart
const pieChartColors = [
    '#FFFFFF', // Branco
    '#CCCCCC', // Cinza claro
    '#999999', // Cinza médio
    '#666666', // Cinza escuro
    '#444444', // Cinza muito escuro
    '#E5E5E5', // Off-white
    '#B3B3B3', // Cinza claro 2
    '#808080', // Cinza médio 2
];

export function FinancialDashboard({ transactions, categories }: FinancialDashboardProps) {
    const {
        cumulativeIncomeExpensesData,
        expensesByCategoryPieData,
        incomeVsExpensesData,
        monthlyIncomeData,
        monthlyExpensesData,
        savingsRateData,
        formatCurrencyForAxis
    } = useFinancialChartData(transactions, categories as Category[]);

    if (transactions.length === 0) {
        return <EmptyFinancials />;
    }

    // Aplica cores monocromáticas ao PieChart
    const styledPieData = expensesByCategoryPieData.map((item, index) => ({
        ...item,
        color: pieChartColors[index % pieChartColors.length],
        legendFontColor: 'rgba(255, 255, 255, 0.7)',
        legendFontSize: 12
    }));

    return (
        <View className="px-6 pb-8">
            <Text className="text-white text-2xl font-bold mb-8">Dashboard Financeiro</Text>

            <ChartCard
                title="Acumulado (6 meses)"
                chartWidth={cumulativeIncomeExpensesData.labels.length * 80}
            >
                <LineChart
                    data={cumulativeIncomeExpensesData}
                    width={Math.max(screenWidth - 48, cumulativeIncomeExpensesData.labels.length * 80)}
                    height={220}
                    chartConfig={lineChartConfig}
                    bezier
                    withDots={true}
                    withInnerLines={true}
                    withOuterLines={false}
                    withShadow={false}
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    style={{ marginLeft: -20 }}
                    formatYLabel={(y) => formatCurrencyForAxis(Number(y))}
                    segments={5}
                />
            </ChartCard>

            <ChartCard
                title="Receitas Mensais"
                chartWidth={monthlyIncomeData.labels.length * 80}
            >
                <LineChart
                    data={monthlyIncomeData}
                    width={Math.max(screenWidth - 48, monthlyIncomeData.labels.length * 80)}
                    height={220}
                    chartConfig={lineChartConfig}
                    bezier
                    withDots={true}
                    withInnerLines={true}
                    withOuterLines={false}
                    withShadow={false}
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    style={{ marginLeft: -20 }}
                    formatYLabel={(y) => formatCurrencyForAxis(Number(y))}
                    segments={5}
                />
            </ChartCard>

            <ChartCard
                title="Despesas Mensais"
                chartWidth={monthlyExpensesData.labels.length * 80}
            >
                <LineChart
                    data={monthlyExpensesData}
                    width={Math.max(screenWidth - 48, monthlyExpensesData.labels.length * 80)}
                    height={220}
                    chartConfig={lineChartConfig}
                    bezier
                    withDots={true}
                    withInnerLines={true}
                    withOuterLines={false}
                    withShadow={false}
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    style={{ marginLeft: -20 }}
                    formatYLabel={(y) => formatCurrencyForAxis(Number(y))}
                    segments={5}
                />
            </ChartCard>

            <ChartCard
                title="Taxa de Poupança"
                chartWidth={savingsRateData.labels.length * 80}
            >
                <BarChart
                    data={savingsRateData}
                    width={Math.max(screenWidth - 48, savingsRateData.labels.length * 80)}
                    height={220}
                    chartConfig={barChartConfig}
                    withInnerLines={true}
                    fromZero
                    yAxisLabel=""
                    yAxisSuffix="%"
                    style={{ marginLeft: -20 }}
                    showValuesOnTopOfBars={false}
                    segments={5}
                />
            </ChartCard>

            <ChartCard title="Receita vs Despesa">
                <BarChart
                    data={incomeVsExpensesData}
                    width={screenWidth - 48}
                    height={220}
                    chartConfig={barChartConfig}
                    withInnerLines={true}
                    fromZero
                    yAxisLabel="R$ "
                    yAxisSuffix=""
                    style={{ marginLeft: -20 }}
                    showValuesOnTopOfBars={false}
                    segments={5}
                />
            </ChartCard>

            {styledPieData.length > 0 && (
                <View className="mb-12">
                    <Text className="text-white/40 text-xs mb-6 uppercase tracking-wider font-semibold">
                        Categorias de Despesas
                    </Text>
                    <View className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <PieChart
                            data={styledPieData}
                            width={screenWidth - 100}
                            height={240}
                            chartConfig={baseChartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            center={[0, 0]}
                            hasLegend={true}
                            absolute={false}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}