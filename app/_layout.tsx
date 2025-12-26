import 'react-native-url-polyfill/auto';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { FinancialProvider } from '../context/FinancialContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ProfileProvider } from '@/context/ProfileContext';
import { SocialProvider } from '@/context/SocialContext';
import { ToastProvider } from '@/context/ToastContext';
import '@/global.css';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ToastProvider>
          <AuthProvider>
            <ProfileProvider>
              <SocialProvider>
                <FinancialProvider>
                  <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)" />
                  </Stack>
                  <StatusBar style="light" backgroundColor="#000" translucent />
                </FinancialProvider>
              </SocialProvider>
            </ProfileProvider>
          </AuthProvider>
        </ToastProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}