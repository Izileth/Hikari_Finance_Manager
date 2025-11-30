import { View, Text } from "react-native";
import { Link } from "expo-router";
export default function HomeScreen() {
    return (
        <View className="bg-slate-50 flex items-center justify-center w-full h-screen">
            <Text className="text-black">Home Screen</Text>
            <Link href="/profile" className="mt-4 px-4 py-2 bg-red-500 rounded">
                <Text className="text-white">Go to Profile</Text>
            </Link>
        </View>
    );
}

