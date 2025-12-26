
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import React from 'react';
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { CameraIcon, ChartIcon, CogIcon, EditIcon, FinancialsIcon } from "@/components/ui/Icons";
import { PlusSquareIcon } from "@/components/ui/CustomHeader";
import { Tables } from "@/lib/database.types";
import { User } from "@supabase/supabase-js";

type Profile = Tables<'profiles'>;

type ProfileHeaderProps = {
    user: User | null;
    profile: Profile | null;
    isSaving: boolean;
    onPickBanner: () => void;
    onPickAvatar: () => void;
};

const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export function ProfileHeader({ user, profile, isSaving, onPickBanner, onPickAvatar }: ProfileHeaderProps) {
    const router = useRouter();

    return (
        <>
         {/* Banner Section */}
            <TouchableOpacity
                onPress={onPickBanner}
                disabled={isSaving}
                className="relative h-64 bg-white/5"
            >
                {profile?.banner_url ? (
                    <Image source={{ uri: profile.banner_url }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <View className="w-full h-full justify-center items-center">
                        <ChartIcon size={40} />
                        <Text className="text-white/40 mt-2 text-sm">Adicionar banner</Text>
                    </View>
                )}
                
                {/* Gradiente superior (escurece o topo) */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent']}
                    className="absolute top-0 left-0 right-0 h-20"
                    pointerEvents="none"
                />
                
                {/* Gradiente inferior (transição para o fundo preto) */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
                    className="absolute bottom-0 left-0 right-0 h-32"
                    pointerEvents="none"
                />

                <View className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white items-center justify-center">
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#000" />
                    ) : (
                        <CameraIcon size={18} />
                    )}
                </View>
            </TouchableOpacity>

            {/* Avatar Section */}
            <View className="items-center -mt-14 mb-6">
                <TouchableOpacity
                    onPress={onPickAvatar}
                    disabled={isSaving}
                    className="relative mb-4"
                >
                    <View className="w-28 h-28 rounded-full border-4 border-black bg-white/10 items-center justify-center overflow-hidden">
                        {profile?.avatar_url ? (
                            <>
                                <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
                                
                                {/* Gradiente sutil no avatar para suavizar borda */}
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.2)']}
                                    className="absolute bottom-0 left-0 right-0 h-8"
                                    pointerEvents="none"
                                />
                            </>
                        ) : (
                            <Text className="text-white text-4xl font-bold">
                                {getInitials(profile?.name)}
                            </Text>
                        )}
                    </View>

                    <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white items-center justify-center border-2 border-black">
                        {isSaving ? (
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
                    <Text className="text-white/60 text-base mb-1">
                        @{profile.nickname}
                    </Text>
                )}

                <Text className="text-white/40 text-sm">
                    {user?.email}
                </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2 px-5 mb-6">
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/edit-profile')}
                    className="flex-1 flex-row items-center justify-center py-3 border border-white/20 rounded-lg"
                >
                    <EditIcon size={16} />
                    <Text className="text-white font-medium ml-2">
                        Editar
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/create-post')}
                    className="flex-1 flex-row items-center justify-center py-3 border border-white/20 rounded-lg"
                >
                    <PlusSquareIcon size={16} />
                    <Text className="text-white font-medium ml-2">
                        Postar
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/financials')}
                    className="flex-1 flex-row items-center justify-center py-3 border border-white/20 rounded-lg"
                >
                    <FinancialsIcon size={16} />
                    <Text className="text-white font-medium ml-2">
                        Finanças
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/financial-settings')}
                    className="flex-1 flex-row items-center justify-center py-3 border border-white/20 rounded-lg"
                >
                    <CogIcon size={16} />
                    <Text className="text-white font-medium ml-2">
                        Ajustes
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}
