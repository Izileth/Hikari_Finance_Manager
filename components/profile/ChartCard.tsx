
import { View, Text, ScrollView, Dimensions } from 'react-native';
import React from 'react';

type ChartCardProps = {
    title: string;
    children: React.ReactNode;
    chartWidth?: number;
};

const screenWidth = Dimensions.get("window").width;

export function ChartCard({ title, children, chartWidth }: ChartCardProps) {
    const defaultChartWidth = screenWidth - 48;
    const width = chartWidth ? Math.max(defaultChartWidth, chartWidth) : defaultChartWidth;

    return (
        <View className="mb-12">
            <Text className="text-white/40 text-xs mb-4 uppercase tracking-wider">
                {title}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ width }}>
                    {children}
                </View>
            </ScrollView>
        </View>
    );
}
