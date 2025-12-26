
import { View, ActivityIndicator, Text } from 'react-native';

export function ProfileLoading() {
    return (
        <View className="flex-1 bg-black justify-center items-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="text-white/60 mt-4">Carregando perfil...</Text>
        </View>
    );
}
