
import { useMemo } from 'react';
import { Transaction, Category } from '@/context/FinancialContext';
const formatCurrencyForAxis = (value: number): string => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
    return `R$ ${value.toFixed(0)}`;
};

export const useFinancialChartData = (transactions: Transaction[], categories: Category[]) => {
    return useMemo(() => {
        const sortedTransactions = [...transactions].sort((a, b) =>
            new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
        );

        const monthlyDataMap = new Map<string, { income: number; expense: number; net: number }>();
        const today = new Date();
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthYearKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            monthlyDataMap.set(monthYearKey, { income: 0, expense: 0, net: 0 });
        }

        sortedTransactions.forEach(t => {
            if (!t.transaction_date) return;
            const transactionDate = new Date(t.transaction_date);
            const monthYearKey = `${transactionDate.getFullYear()}-${(transactionDate.getMonth() + 1).toString().padStart(2, '0')}`;

            if (monthlyDataMap.has(monthYearKey)) {
                if (Number(t.amount) > 0) {
                    monthlyDataMap.get(monthYearKey)!.income += Number(t.amount);
                } else {
                    monthlyDataMap.get(monthYearKey)!.expense += Math.abs(Number(t.amount));
                }
                monthlyDataMap.get(monthYearKey)!.net = monthlyDataMap.get(monthYearKey)!.income - monthlyDataMap.get(monthYearKey)!.expense;
            }
        });

        const labelsForLineCharts: string[] = [];
        const monthlyIncomeDataset: number[] = [];
        const monthlyExpensesDataset: number[] = [];
        const savingsRateDataset: number[] = [];
        const cumulativeIncomeDataset: number[] = [];
        const cumulativeExpensesDataset: number[] = [];

        let currentCumulativeIncome = 0;
        let currentCumulativeExpenses = 0;

        const sortedMonthlyKeys = Array.from(monthlyDataMap.keys()).sort();

        sortedMonthlyKeys.forEach(monthYearKey => {
            const [, month] = monthYearKey.split('-');
            const monthIndex = parseInt(month, 10) - 1;
            const data = monthlyDataMap.get(monthYearKey)!;

            labelsForLineCharts.push(monthNames[monthIndex]);
            monthlyIncomeDataset.push(data.income);
            monthlyExpensesDataset.push(data.expense);

            const savingsRate = data.income > 0 ? ((data.income - data.expense) / data.income) * 100 : 0;
            savingsRateDataset.push(Math.round(savingsRate));

            currentCumulativeIncome += data.income;
            currentCumulativeExpenses += data.expense;
            cumulativeIncomeDataset.push(currentCumulativeIncome);
            cumulativeExpensesDataset.push(currentCumulativeExpenses);
        });

        const cumulativeIncomeExpensesData = {
            labels: labelsForLineCharts,
            datasets: [
                {
                    data: cumulativeIncomeDataset.length > 0 ? cumulativeIncomeDataset : [0],
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                },
                {
                    data: cumulativeExpensesDataset.length > 0 ? cumulativeExpensesDataset : [0],
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.6})`,
                }
            ],
        };

        const monthlyIncomeData = {
            labels: labelsForLineCharts,
            datasets: [{ data: monthlyIncomeDataset.length > 0 ? monthlyIncomeDataset : [0] }]
        };

        const monthlyExpensesData = {
            labels: labelsForLineCharts,
            datasets: [{ data: monthlyExpensesDataset.length > 0 ? monthlyExpensesDataset : [0] }]
        };

        const savingsRateData = {
            labels: labelsForLineCharts,
            datasets: [{ data: savingsRateDataset.length > 0 ? savingsRateDataset : [0] }]
        };

        const expensesByCategoryMap = new Map<string, number>();
        sortedTransactions.filter(t => Number(t.amount) < 0).forEach(t => {
            const category = categories.find(c => c.id === t.category_id);
            const categoryName = category ? category.name : 'Outros';
            expensesByCategoryMap.set(categoryName, (expensesByCategoryMap.get(categoryName) || 0) + Math.abs(Number(t.amount)));
        });

        const colors = ['#FFFFFF', '#CCCCCC', '#999999', '#666666', '#444444'];
        const expensesByCategoryPieData = Array.from(expensesByCategoryMap.entries())
            .sort(([, amountA], [, amountB]) => amountB - amountA)
            .slice(0, 5)
            .map(([name, amount], index) => ({
                name: `${name} (${formatCurrencyForAxis(amount)})`,
                population: amount,
                color: colors[index % 5],
                legendFontColor: "#FFFFFF",
                legendFontSize: 12
            }));

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

        return { cumulativeIncomeExpensesData, expensesByCategoryPieData, incomeVsExpensesData, monthlyIncomeData, monthlyExpensesData, savingsRateData, formatCurrencyForAxis };
    }, [transactions, categories]);
};
