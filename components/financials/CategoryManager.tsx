import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, ScrollView, Switch, Platform } from 'react-native';
import { useFinancials, Category, CategoryInsert, CategoryUpdate } from '../../context/FinancialContext';
import { useAuth } from '../../context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import Svg, { Path } from 'react-native-svg';

interface CategoryManagerProps {
    onClose: () => void;
}

// SVG Icons
const TagIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M7 7h.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PlusIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const TrashIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ArrowUpIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ArrowDownIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M19 12l-7 7-7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const GlobeIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const CategoryManager: React.FC<CategoryManagerProps> = ({ onClose }) => {
    const { categories, addCategory, updateCategory, deleteCategory } = useFinancials();
    const { profile } = useAuth();

    const [isEditing, setIsEditing] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [isPublic, setIsPublic] = useState(false);

    const userCategories = useMemo(() => {
        return categories.filter(c => c.profile_id === profile?.id);
    }, [categories, profile]);

    useEffect(() => {
        if (isEditing) {
            setName(isEditing.name);
            setType(isEditing.type);
            setIsPublic(isEditing.is_public || false);
        } else {
            setName('');
            setType('expense');
            setIsPublic(false);
        }
    }, [isEditing]);

    const handleSelectCategory = (category: Category) => {
        setIsEditing(category);
    };

    const clearForm = () => {
        setIsEditing(null);
    };

    const handleSave = async () => {
        if (!name) {
            Alert.alert('Atenção', 'O nome da categoria é obrigatório');
            return;
        }

        try {
            if (isEditing) {
                const categoryData: CategoryUpdate = { name, type, is_public: isPublic };
                await updateCategory(isEditing.id, categoryData);
            } else {
                if (!profile?.id) {
                    Alert.alert('Erro', 'Usuário não autenticado para criar categoria');
                    return;
                }
                const categoryData: CategoryInsert = { name, type, is_public: isPublic };
                const newCategory = await addCategory(categoryData);
                if (newCategory && newCategory.length > 0) {
                    setIsEditing(newCategory[0]);
                }
            }
            if (isEditing) {
                clearForm();
            }
        } catch (error: any) {
            Alert.alert('Erro ao Salvar', error.message);
        }
    };

    const handleDelete = async () => {
        if (!isEditing) return;

        Alert.alert(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir a categoria "${isEditing.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCategory(isEditing.id);
                            clearForm();
                        } catch (error: any) {
                            Alert.alert('Erro ao Excluir', error.message);
                        }
                    },
                },
            ]
        );
    };

    const renderCategoryItem = ({ item }: { item: Category }) => (
        <TouchableOpacity 
            onPress={() => handleSelectCategory(item)} 
            className="border border-white/20 rounded-lg p-4 mb-3"
            activeOpacity={0.7}
        >
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${item.type === 'income' ? 'bg-white/10' : 'bg-white/10'}`}>
                        {item.type === 'income' ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />}
                    </View>
                    <Text className="text-white font-bold text-base flex-1">{item.name}</Text>
                </View>
                {item.is_public && <GlobeIcon size={14} />}
            </View>
            <Text className="text-white/40 text-sm ml-11">
                {item.type === 'income' ? 'Receita' : 'Despesa'}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView className="flex-1 bg-black">
            <View className="py-6">
                {/* Header */}
                <Text className="text-white text-2xl font-bold mb-8">
                    Gerenciar Categorias
                </Text>

                {/* Form */}
                <View className="mb-8">
                    <Text className="text-white text-lg font-bold mb-6">
                        {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
                    </Text>

                    {/* Name */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">Nome da Categoria</Text>
                        <View className="border border-white/20 rounded-lg">
                            <TextInput
                                className="text-white px-4 py-4 text-base"
                                placeholder="Ex: Alimentação, Salário"
                                placeholderTextColor="#666666"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    {/* Type Picker */}
                    <View className="mb-6">
                        <Text className="text-white/60 text-sm mb-2">Tipo</Text>
                        <View className="border border-white/20 rounded-lg overflow-hidden">
                            <Picker
                                selectedValue={type}
                                onValueChange={(itemValue) => setType(itemValue)}
                                style={{ color: '#FFFFFF', backgroundColor: 'transparent' }}
                                dropdownIconColor="#FFFFFF"
                            >
                                <Picker.Item label="Despesa" value="expense" color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                                <Picker.Item label="Receita" value="income" color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                            </Picker>
                        </View>
                    </View>

                    {/* Public Switch */}
                    <View className="flex-row items-center justify-between mb-6 p-4 border border-white/20 rounded-lg">
                        <View className="flex-1 mr-4">
                            <Text className="text-white font-medium mb-1">Categoria Pública</Text>
                            <Text className="text-white/40 text-xs">
                                Outros usuários poderão ver esta categoria
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#333333', true: '#ffffff' }}
                            thumbColor={isPublic ? '#000000' : '#666666'}
                            ios_backgroundColor="#333333"
                            onValueChange={setIsPublic}
                            value={isPublic}
                        />
                    </View>

                    {/* Action Buttons */}
                    <TouchableOpacity 
                        onPress={handleSave} 
                        className="bg-white rounded-lg py-4 mb-3 flex-row items-center justify-center"
                    >
                        <PlusIcon size={20} />
                        <Text className="text-black text-center font-bold text-base ml-2">
                            {isEditing ? 'Atualizar' : 'Criar Categoria'}
                        </Text>
                    </TouchableOpacity>

                    {isEditing && (
                        <View className="flex-row gap-3">
                            <TouchableOpacity 
                                onPress={handleDelete} 
                                className="flex-1 border border-white/20 rounded-lg py-4 flex-row items-center justify-center"
                            >
                                <TrashIcon size={18} />
                                <Text className="text-white text-center font-bold ml-2">
                                    Excluir
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={clearForm} 
                                className="flex-1 border border-white/20 rounded-lg py-4"
                            >
                                <Text className="text-white text-center font-bold">
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Divider */}
                <View className="h-px bg-white/20 my-8" />

                {/* Category List */}
                <View className="mb-8">
                    <Text className="text-white text-lg font-bold mb-4">Minhas Categorias</Text>
                    {userCategories.length > 0 ? (
                        <FlatList
                            data={userCategories}
                            renderItem={renderCategoryItem}
                            keyExtractor={(item) => item.id.toString()}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View className="border border-white/20 rounded-lg p-8 items-center">
                            <TagIcon size={40} />
                            <Text className="text-white/40 text-center mt-4">
                                Nenhuma categoria encontrada
                            </Text>
                        </View>
                    )}
                </View>

                {/* Close Button */}
                <TouchableOpacity 
                    onPress={onClose} 
                    className="border border-white/20 rounded-lg py-4"
                >
                    <Text className="text-white text-center font-medium">
                        Fechar
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default CategoryManager;