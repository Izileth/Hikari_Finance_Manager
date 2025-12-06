import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { FinancialProvider } from '../context/FinancialContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ProfileProvider } from '@/context/ProfileContext';
import '@/global.css';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <ProfileProvider>
          <FinancialProvider>
            <Stack screenOptions={{ 
              contentStyle: { backgroundColor: '#000' }, 
            }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="redirector" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false}} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="light" backgroundColor="#000" translucent />
          </FinancialProvider>
          </ProfileProvider>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
