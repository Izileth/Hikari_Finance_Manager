import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Switch, Image } from "react-native";
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle} from 'react-native-svg';


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

const GlobeIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
    <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const { profile, updateProfile, uploadAvatar, loading: profileLoading } = useProfile();

    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [bio, setBio] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [preferences, setPreferences] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setNickname(profile.nickname || '');
            setBio(profile.bio || '');
            setIsPublic(profile.is_public);
            setPreferences(JSON.stringify(profile.preferences || {}, null, 2));
            setAvatarUrl(profile.avatar_url || '');
        }
    }, [profile]);

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Atenção', 'O nome é obrigatório');
            return;
        }

        let parsedPrefs;
        try {
            parsedPrefs = JSON.parse(preferences);
        } catch (e) {
            Alert.alert('Erro', 'As preferências não são um JSON válido.');
            return;
        }

        setIsSaving(true);
        const { error } = await updateProfile({
            name,
            nickname,
            bio,
            is_public: isPublic,
            preferences: parsedPrefs,
        });

        if (error) {
            Alert.alert('Erro', error.message);
        } else {
            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
            setIsEditing(false);
        }
        setIsSaving(false);
    };

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

    const handleCancel = () => {
        if (profile) {
            setName(profile.name || '');
            setNickname(profile.nickname || '');
            setBio(profile.bio || '');
            setIsPublic(profile.is_public);
            setPreferences(JSON.stringify(profile.preferences || {}, null, 2));
        }
        setIsEditing(false);
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

    const getInitials = () => {
        if (!name) return '?';
        const names = name.trim().split(' ');
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
                <View className="flex-1 px-8 pt-16 pb-8">
                    {/* Avatar Section */}
                    <View className="items-center mb-12">
                        <TouchableOpacity 
                            onPress={handlePickAvatar} 
                            disabled={isSaving}
                            className="relative mb-4"
                        >
                            <View className="w-28 h-28 rounded-full border-2 border-white/20 items-center justify-center bg-black overflow-hidden">
                                {avatarUrl ? (
                                    <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                                ) : (
                                    <Text className="text-white text-4xl font-bold">
                                        {getInitials()}
                                    </Text>
                                )}
                            </View>
                            
                            {/* Camera Badge */}
                            <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white items-center justify-center border-2 border-black">
                                {(isSaving && profileLoading) ? (
                                    <ActivityIndicator size="small" color="#000" />
                                ) : (
                                    <CameraIcon size={18} />
                                )}
                            </View>
                        </TouchableOpacity>

                        <Text className="text-white text-2xl font-bold mb-1">
                            {name || 'Seu Nome'}
                        </Text>
                        
                        {nickname && (
                            <Text className="text-white/60 text-base mb-2">
                                @{nickname}
                            </Text>
                        )}
                        
                        <Text className="text-white/40 text-sm">
                            {user?.email}
                        </Text>
                    </View>

                    {/* Edit Button */}
                    {!isEditing && (
                        <TouchableOpacity
                            onPress={() => setIsEditing(true)}
                            className="flex-row items-center justify-center py-3 mb-8 border border-white/20 rounded-lg"
                        >
                            <EditIcon size={16} />
                            <Text className="text-white font-medium ml-2">
                                Editar Perfil
                            </Text>
                        </TouchableOpacity>
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

                    {/* Name */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">
                            Nome completo
                        </Text>
                        <View className={`border rounded-lg ${isEditing ? 'border-white/40' : 'border-white/20'}`}>
                            <TextInput
                                placeholder="Seu nome"
                                placeholderTextColor="#666666"
                                value={name}
                                onChangeText={setName}
                                editable={isEditing}
                                className="px-4 py-3 text-white text-base"
                            />
                        </View>
                    </View>

                    {/* Nickname */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">
                            Apelido
                        </Text>
                        <View className={`border rounded-lg flex-row items-center ${isEditing ? 'border-white/40' : 'border-white/20'}`}>
                            <Text className="text-white/40 pl-4 text-base">@</Text>
                            <TextInput
                                placeholder="apelido"
                                placeholderTextColor="#666666"
                                value={nickname}
                                onChangeText={setNickname}
                                editable={isEditing}
                                autoCapitalize="none"
                                className="flex-1 px-2 py-3 text-white text-base"
                            />
                        </View>
                    </View>

                    {/* Bio */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">
                            Sobre você
                        </Text>
                        <View className={`border rounded-lg ${isEditing ? 'border-white/40' : 'border-white/20'}`}>
                            <TextInput
                                placeholder="Conte um pouco sobre você..."
                                placeholderTextColor="#666666"
                                value={bio}
                                onChangeText={setBio}
                                editable={isEditing}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                className="px-4 py-3 text-white text-base min-h-[100px]"
                            />
                        </View>
                    </View>

                    {/* Public Profile Toggle */}
                    <View className="flex-row items-center justify-between mb-6 p-4 border border-white/20 rounded-lg">
                        <View className="flex-row items-center flex-1">
                            <GlobeIcon size={20} />
                            <View className="ml-3 flex-1">
                                <Text className="text-white font-medium">Perfil Público</Text>
                                <Text className="text-white/40 text-xs mt-1">
                                    Outros usuários poderão ver seu perfil
                                </Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#333333', true: '#ffffff' }}
                            thumbColor={isPublic ? '#000000' : '#666666'}
                            ios_backgroundColor="#333333"
                            onValueChange={setIsPublic}
                            value={isPublic}
                            disabled={!isEditing}
                        />
                    </View>

                    {/* Preferences */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">
                            Preferências (JSON)
                        </Text>
                        <View className={`border rounded-lg ${isEditing ? 'border-white/40' : 'border-white/20'}`}>
                            <TextInput
                                placeholder='{"theme": "dark"}'
                                placeholderTextColor="#666666"
                                value={preferences}
                                onChangeText={setPreferences}
                                editable={isEditing}
                                multiline
                                autoCapitalize="none"
                                textAlignVertical="top"
                                className="px-4 py-3 text-white text-base min-h-[100px] font-mono"
                            />
                        </View>
                    </View>

                    {/* Action Buttons */}
                    {isEditing && (
                        <View className="flex-row gap-3 mb-6">
                            <TouchableOpacity
                                onPress={handleCancel}
                                disabled={isSaving}
                                className="flex-1 border border-white/20 rounded-lg py-3"
                            >
                                <Text className="text-white text-center font-medium">
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleUpdateProfile}
                                disabled={isSaving}
                                className={`flex-1 rounded-lg py-3 ${isSaving ? 'bg-white/20' : 'bg-white'}`}
                            >
                                <Text className={`text-center font-bold ${isSaving ? 'text-white' : 'text-black'}`}>
                                    {isSaving ? 'Salvando...' : 'Salvar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

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
            </ScrollView>
        </KeyboardAvoidingView>
    );
}