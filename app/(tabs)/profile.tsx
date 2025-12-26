import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import React, { useState } from 'react';
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { useFinancials } from "../../context/FinancialContext";
import * as ImagePicker from 'expo-image-picker';

import CustomHeader from "@/components/ui/CustomHeader";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileBio } from "@/components/profile/ProfileBio";
import { FinancialDashboard } from "@/components/profile/FinancialDashboard";
import { ProfileLoading } from "@/components/profile/ProfileLoading";
import { LogoutIcon } from "@/components/ui/Icons";
import { useToast } from "@/context/ToastContext";

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const { profile, uploadAvatar, uploadBanner, loading: profileLoading } = useProfile();
    const { transactions, categories, loading: financialsLoading } = useFinancials();
    const { showToast } = useToast();

    const [isSaving, setIsSaving] = useState(false);

    const handlePickAvatar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setIsSaving(true);
            const { error } = await uploadAvatar(result.assets[0]);
            if (error) {
                showToast(error.message, 'error');
            } else {
                showToast('Avatar atualizado!', 'success');
            }
            setIsSaving(false);
        }
    };

    const handlePickBanner = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            setIsSaving(true);
            const { error } = await uploadBanner(result.assets[0]);
            if (error) {
                showToast(error.message, 'error');
            } else {
                showToast('Banner atualizado!', 'success');
            }
            setIsSaving(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair da sua conta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: signOut }
            ]
        );
    };

    if (profileLoading || financialsLoading || !profile) {
        return <ProfileLoading />;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-black"
        >
            <CustomHeader />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1">
                    <ProfileHeader
                        user={user}
                        profile={profile}
                        isSaving={isSaving}
                        onPickAvatar={handlePickAvatar}
                        onPickBanner={handlePickBanner}
                    />

                    <ProfileBio bio={profile.bio} />

                    <FinancialDashboard
                        transactions={transactions}
                        categories={categories}
                    />

                    <View className="px-6 pb-8">
                        {/* Divider */}
                        <View className="h-px bg-white/10 my-6" />

                        {/* Logout Button */}
                        <TouchableOpacity
                            onPress={handleSignOut}
                            className="flex-row items-center justify-center py-4 border border-white/20 rounded-lg"
                        >
                            <LogoutIcon size={20} />
                            <Text className="text-white font-bold ml-2">
                                Sair da Conta
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}