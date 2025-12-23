import { Redirect } from "expo-router";
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator } from "react-native";
import { Colors } from '../constants/theme';

export default function RedirectorScreen() {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <ActivityIndicator size="large" color={Colors.dark.text} />;
  }

  if (!session || !session.user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/feed" />;
}
