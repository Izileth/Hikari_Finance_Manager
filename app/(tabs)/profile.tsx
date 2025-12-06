

import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Image } from "react-native";
import React, { useState } from 'react';
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle} from 'react-native-svg';
import { useRouter } from "expo-router";


const CameraIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="13" r="4" stroke="black" strokeWidth="2"/>
  </Svg>
);

const EditIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const LogoutIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const FinancialsIcon = ({ size = 16 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const { profile, uploadAvatar, uploadBanner, loading: profileLoading } = useProfile();
    const router = useRouter();
    
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
                Alert.alert('Erro no Upload', error.message);
            } else {
                Alert.alert('Sucesso', 'Avatar atualizado!');
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
                Alert.alert('Erro no Upload', error.message);
            } else {
                Alert.alert('Sucesso', 'Banner atualizado!');
            }
            setIsSaving(false);
        }
    }

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

    const getInitials = () => {
        if (!profile?.name) return '?';
        const names = profile.name.trim().split(' ');
        if (names.length === 1) return names[0][0].toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    if (profileLoading && !profile) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white/60 mt-4">Carregando perfil...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-black"
        >
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1">
                    {/* Banner Section */}
                    <TouchableOpacity onPress={handlePickBanner} disabled={isSaving} className="relative h-48 bg-black/20">
                        {profile?.banner_url ? (
                            <Image source={{ uri: profile.banner_url }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <View className="w-full h-full justify-center items-center">
                                <Text className="text-white/40">Adicionar um banner</Text>
                            </View>
                        )}
                        <View className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 items-center justify-center border-2 border-black/50">
                            {isSaving ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : (
                                <CameraIcon size={18} />
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Avatar Section */}
                    <View className="items-center -mt-14 mb-8">
                        <TouchableOpacity 
                            onPress={handlePickAvatar} 
                            disabled={isSaving}
                            className="relative mb-4"
                        >
                            <View className="w-28 h-28 rounded-full border-4 border-black bg-black items-center justify-center overflow-hidden">
                                {profile?.avatar_url ? (
                                    <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
                                ) : (
                                    <Text className="text-white text-4xl font-bold">
                                        {getInitials()}
                                    </Text>
                                )}
                            </View>
                            
                            <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white items-center justify-center border-2 border-black">
                                {(isSaving && profileLoading) ? (
                                    <ActivityIndicator size="small" color="#000" />
                                ) : (
                                    <CameraIcon size={18} />
                                )}
                            </View>
                        </TouchableOpacity>

                        <Text className="text-white text-2xl font-bold mb-1">
                            {profile?.name || 'Seu Nome'}
                        </Text>
                        
                        {profile?.nickname && (
                            <Text className="text-white/60 text-base mb-2">
                                @{profile.nickname}
                            </Text>
                        )}
                        
                        <Text className="text-white/40 text-sm">
                            {user?.email}
                        </Text>
                    </View>

                    <View className="px-8 pb-8">
                        {/* Action Buttons */}
                        <View className="flex-row items-center justify-center mb-8 space-x-4">
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/edit-profile')}
                                className="flex-1 flex-row items-center justify-center py-3 border border-white/20 rounded-lg"
                            >
                                <EditIcon size={16} />
                                <Text className="text-white font-medium ml-2">
                                    Editar Perfil
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/financials')}
                                className="flex-1 flex-row items-center justify-center py-3 border border-white/20 rounded-lg"
                            >
                                <FinancialsIcon size={16} />
                                <Text className="text-white font-medium ml-2">
                                    Minhas Finanças
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Bio */}
                        {profile?.bio && (
                            <View className="mb-6">
                                <Text className="text-white/60 text-sm mb-2">
                                    Sobre você
                                </Text>
                                <View className="border border-white/20 rounded-lg p-4">
                                    <Text className="text-white text-base">
                                        {profile.bio}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Profile URL (Read-only) */}
                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-2">
                                URL do Perfil
                            </Text>
                            <View className="border border-white/20 rounded-lg px-4 py-3">
                                <Text className="text-white/40 text-base">
                                    /{profile?.slug || '...'}
                                </Text>
                            </View>
                        </View>

                        {/* Divider */}
                        <View className="h-px bg-white/20 my-8" />

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