import { View, Text } from "react-native";
import { Link } from "expo-router";
export default function ProfileScreen() {
    return (
        <View className="bg-slate-50 flex items-center justify-center w-full h-screen">
            <Text className="text-black">Profile Screen</Text>
            <Link href="/" className="mt-4 px-4 py-2 bg-blue-500 rounded">
                <Text className="text-white">Go to Profile</Text>
            </Link>
        </View>
    );
}

