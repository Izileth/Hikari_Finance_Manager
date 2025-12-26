import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Modal } from "react-native";
import React, { useState, useEffect } from 'react';
import { useProfile } from "../../context/ProfileContext";
import { useFinancials, FinancialTarget, FinancialTargetInsert, FinancialTargetUpdate } from "../../context/FinancialContext";
import { useRouter } from "expo-router";
import { CustomPicker } from "../../components/ui/CustomPicker";
import { BackIcon, EditIcon, TrashIcon, PlusIcon, ShareIcon, TargetIcon } from "../../components/ui/Icons";
import { useToast } from "@/context/ToastContext";

const targetTypes = [
    { label: "Valor (R$)", value: "currency" },
    { label: "Porcentagem (%)", value: "percentage" },
];

const targetTimescales = [
    { label: "Mensal", value: "monthly" },
    { label: "Anual", value: "yearly" },
];

export default function EditProfileScreen() {
    const { profile, updateProfile, loading: profileLoading } = useProfile();
    const { financialTargets, addFinancialTarget, updateFinancialTarget, deleteFinancialTarget, loading: financialsLoading } = useFinancials();
    const router = useRouter();

    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [bio, setBio] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentTarget, setCurrentTarget] = useState<FinancialTarget | null>(null);

    const [metricName, setMetricName] = useState('');
    const [targetValue, setTargetValue] = useState('');
    const [targetType, setTargetType] = useState<'currency' | 'percentage'>('currency');
    const [timescale, setTimescale] = useState<'monthly' | 'yearly'>('monthly');

    const { showToast } = useToast();

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setNickname(profile.nickname || '');
            setBio(profile.bio || '');
        }
    }, [profile]);

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            showToast('O nome é obrigatório', 'error');
            return;
        }

        const slugRegex = /^[a-z0-9_]+$/;
        if (nickname.trim() && !slugRegex.test(nickname)) {
            showToast('Apelido Inválido', 'error');
            return;
        }

        setIsSaving(true);
        const { error } = await updateProfile({
            name,
            nickname,
            bio,
        });

        if (error) {
            showToast('Erro ao atualizar perfil', 'error');
        } else {
            showToast('Perfil atualizado com sucesso!', 'success');
        }
        setIsSaving(false);
    };

    const openTargetModal = (target: FinancialTarget | null = null) => {
        setCurrentTarget(target);
        if (target) {
            setMetricName(target.metric_name);
            setTargetValue(String(target.target_value));
            setTargetType(target.target_type as any);
            setTimescale(target.timescale as any);
        } else {
            setMetricName('');
            setTargetValue('');
            setTargetType('currency');
            setTimescale('monthly');
        }
        setModalVisible(true);
    };

    const handleSaveTarget = async () => {
        if (!metricName.trim() || !targetValue.trim()) {
            Alert.alert('Atenção', 'O nome da métrica e o valor alvo são obrigatórios');
            return;
        }

        const numericValue = parseFloat(targetValue.replace(',', '.'));
        if (isNaN(numericValue)) {
            Alert.alert('Erro', 'O valor alvo deve ser um número');
            return;
        }

        const targetData = {
            metric_name: metricName,
            target_value: numericValue,
            target_type: targetType,
            timescale,
        };

        try {
            if (currentTarget) {
                await updateFinancialTarget(currentTarget.id, targetData as FinancialTargetUpdate);
            } else {
                await addFinancialTarget(targetData as FinancialTargetInsert);
            }
            setModalVisible(false);
        } catch (error: any) {
            Alert.alert('Erro ao Salvar Meta', error.message);
        }
    };
    
    const handleDeleteTarget = (targetId: number) => {
        Alert.alert(
            'Excluir Meta',
            'Tem certeza que deseja excluir esta meta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', style: 'destructive', onPress: () => deleteFinancialTarget(targetId) }
            ]
        );
    };

    const handleShareTarget = (target: FinancialTarget) => {
        const formattedValue = target.target_type === 'percentage' 
            ? `${target.target_value}%` 
            : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(target.target_value);

        const shareTitle = `New Goal: ${target.metric_name}`;
        const shareDescription = `I'm aiming for ${formattedValue} on a ${target.timescale} basis.`;
        
        router.push({
            pathname: '/(tabs)/create-post',
            params: { title: shareTitle, description: shareDescription, type: 'achievement' }
        });
    }

    if ((profileLoading || financialsLoading) && !profile) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black">
            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                <View className="pt-16">
                    {/* Header */}
                    <View className="flex-row items-center px-0 mb-8">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <BackIcon />
                        </TouchableOpacity>
                        <Text className="text-white text-2xl font-bold">Editar Perfil</Text>
                    </View>

                    <View className="px-2 pb-8">
                        {/* Profile Info */}
                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-2">Nome</Text>
                            <View className="border border-white/20 rounded-lg">
                                <TextInput 
                                    placeholder="Seu nome" 
                                    value={name} 
                                    onChangeText={setName} 
                                    className="px-4 py-4 text-white text-base" 
                                    placeholderTextColor="#666666" 
                                />
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-2">Apelido</Text>
                            <View className="border border-white/20 rounded-lg flex-row items-center">
                                <Text className="text-white/40 pl-4 text-base">@</Text>
                                <TextInput 
                                    placeholder="seu_apelido" 
                                    value={nickname} 
                                    onChangeText={setNickname} 
                                    autoCapitalize="none" 
                                    className="flex-1 px-2 py-4 text-white text-base" 
                                    placeholderTextColor="#666666"
                                />
                            </View>
                            <Text className="text-white/40 text-xs mt-2">
                                Apenas letras minúsculas, números e underlines
                            </Text>
                        </View>

                        <View className="mb-8">
                            <Text className="text-white/60 text-sm mb-2">Bio</Text>
                            <View className="border border-white/20 rounded-lg">
                                <TextInput 
                                    placeholder="Conte um pouco sobre você..." 
                                    value={bio} 
                                    onChangeText={setBio} 
                                    multiline 
                                    numberOfLines={4}
                                    className="px-4 py-4 text-white text-base min-h-[100px]" 
                                    placeholderTextColor="#666666" 
                                    textAlignVertical="top" 
                                />
                            </View>
                        </View>

                        <TouchableOpacity 
                            onPress={handleUpdateProfile} 
                            disabled={isSaving} 
                            className={`rounded-lg py-4 mb-12 ${isSaving ? 'bg-white/20' : 'bg-white'}`}
                        >
                            <Text className={`text-center font-bold text-base ${isSaving ? 'text-white/60' : 'text-black'}`}>
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </Text>
                        </TouchableOpacity>
                        
                        {/* Divider */}
                        <View className="h-px bg-white/20 my-12" />

                        {/* Financial Targets */}
                        <View>
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-white text-xl font-bold">Metas Financeiras</Text>
                                <TouchableOpacity 
                                    onPress={() => openTargetModal(null)} 
                                    className="flex-row items-center border border-white/20 px-3 py-2 rounded-lg"
                                >
                                    <PlusIcon size={16} />
                                    <Text className="text-white font-medium text-sm ml-2">Nova</Text>
                                </TouchableOpacity>
                            </View>

                            {financialTargets.length > 0 ? (
                                financialTargets.map(target => (
                                    <View key={target.id} className="border border-white/20 rounded-lg p-4 mb-3">
                                        <View className="flex-row justify-between items-start mb-3">
                                            <View className="flex-1 mr-4">
                                                <Text className="text-white font-bold text-base mb-1">
                                                    {target.metric_name}
                                                </Text>
                                                <Text className="text-white/40 text-sm">
                                                    {target.timescale === 'monthly' ? 'Mensal' : 'Anual'}
                                                </Text>
                                            </View>
                                            <View className="flex-row gap-3">
                                                <TouchableOpacity onPress={() => openTargetModal(target)}>
                                                    <EditIcon size={18} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleDeleteTarget(target.id)}>
                                                    <TrashIcon size={18} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleShareTarget(target)}>
                                                    <ShareIcon size={18} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Text className="text-white text-2xl font-bold">
                                            {target.target_type === 'percentage' 
                                                ? `${target.target_value}%` 
                                                : new Intl.NumberFormat('pt-BR', { 
                                                    style: 'currency', 
                                                    currency: 'BRL' 
                                                  }).format(target.target_value)
                                            }
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <View className="border border-white/20 rounded-lg p-8 items-center">
                                    <TargetIcon size={40} color="#333333" />
                                    <Text className="text-white/40 text-center mt-4">
                                        Nenhuma meta definida
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Target Form Modal */}
            <Modal 
                animationType="slide" 
                transparent={true} 
                visible={modalVisible} 
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    className="flex-1 bg-black/95 justify-end"
                >
                    <View className="bg-black border-t border-white/20 p-6 rounded-t-2xl">
                        <Text className="text-white text-xl font-bold mb-6">
                            {currentTarget ? 'Editar Meta' : 'Nova Meta'}
                        </Text>
                        
                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-2">Nome da Métrica</Text>
                            <View className="border border-white/20 rounded-lg">
                                <TextInput 
                                    value={metricName} 
                                    onChangeText={setMetricName} 
                                    placeholder="Ex: Economia Mensal" 
                                    className="px-4 py-4 text-white text-base" 
                                    placeholderTextColor="#666666"
                                />
                            </View>
                        </View>
                        
                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-2">Valor Alvo</Text>
                            <View className="border border-white/20 rounded-lg">
                                <TextInput 
                                    value={targetValue} 
                                    onChangeText={setTargetValue} 
                                    placeholder="1000" 
                                    keyboardType="numeric" 
                                    className="px-4 py-4 text-white text-base" 
                                    placeholderTextColor="#666666"
                                />
                            </View>
                        </View>
                        
                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-2">Tipo de Meta</Text>
                            <CustomPicker 
                                selectedValue={targetType} 
                                onValueChange={setTargetType} 
                                items={targetTypes} 
                            />
                        </View>

                        <View className="mb-8">
                            <Text className="text-white/60 text-sm mb-2">Período</Text>
                            <CustomPicker 
                                selectedValue={timescale} 
                                onValueChange={setTimescale} 
                                items={targetTimescales} 
                            />
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity 
                                onPress={() => setModalVisible(false)} 
                                className="flex-1 border border-white/20 rounded-lg py-4"
                            >
                                <Text className="text-white text-center font-medium">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={handleSaveTarget} 
                                className="flex-1 bg-white rounded-lg py-4"
                            >
                                <Text className="text-black text-center font-bold">Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </KeyboardAvoidingView>
    );
}