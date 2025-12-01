import { useAuth } from '../context/AuthContext';
import { Redirect } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return <View />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/profile" />;
}

