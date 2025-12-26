
import { View, Text } from 'react-native';
import { ChartIcon } from '@/components/ui/Icons';

export function EmptyFinancials() {
    return (
        <View className="py-16 items-center">
            <ChartIcon size={48} />
            <Text className="text-white/40 text-center mt-4">
                Nenhuma transação para exibir
            </Text>
        </View>
    );
}
