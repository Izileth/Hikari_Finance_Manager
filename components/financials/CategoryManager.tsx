import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, ScrollView, Switch } from 'react-native';
import { useFinancials, Category, CategoryInsert, CategoryUpdate } from '../../context/FinancialContext';
import { useAuth } from '../../context/AuthContext';
import { Picker } from '@react-native-picker/picker';

interface CategoryManagerProps {
    onClose: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ onClose }) => {
    const { categories, addCategory, updateCategory, deleteCategory } = useFinancials();
    const { profile } = useAuth();

    const [isEditing, setIsEditing] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [isPublic, setIsPublic] = useState(false); // New state for isPublic

    // Filter to show only categories created by the current user
    const userCategories = useMemo(() => {
        return categories.filter(c => c.profile_id === profile?.id);
    }, [categories, profile]);

    useEffect(() => {
        if (isEditing) {
            setName(isEditing.name);
            setType(isEditing.type);
            setIsPublic(isEditing.is_public || false); // Set isPublic when editing
        } else {
            setName('');
            setType('expense');
            setIsPublic(false); // Reset for new category
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
            Alert.alert('Erro', 'O nome da categoria é obrigatório.');
            return;
        }

        try {
            if (isEditing) {
                const categoryData: CategoryUpdate = { name, type, is_public: isPublic };
                await updateCategory(isEditing.id, categoryData);
            } else {
                // profile_id is NOT NULL in DB, so it must be provided for new categories
                if (!profile?.id) {
                    Alert.alert('Erro', 'Usuário não autenticado para criar categoria.');
                    return;
                }
                const categoryData: CategoryInsert = { name, type, profile_id: profile.id, is_public: isPublic };
                await addCategory(categoryData);
            }
            clearForm();
        } catch (error: any) {
            Alert.alert('Erro ao Salvar', error.message);
        }
    };

    const handleDelete = async () => {
        if (!isEditing) return;

        Alert.alert(
            'Confirmar Exclusão',
            `Você tem certeza que deseja excluir a categoria "${isEditing.name}"?`,
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
        <TouchableOpacity onPress={() => handleSelectCategory(item)} className="p-4 border-b border-gray-700">
            <Text className="text-white">{item.name} {item.is_public ? '(Pública)' : '(Privada)'}</Text>
            <Text className="text-white/60 capitalize">{item.type === 'income' ? 'Receita' : 'Despesa'}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView className="flex-1 bg-gray-900 p-4">
            <Text className="text-white text-2xl font-bold mb-6">Gerenciar Categorias</Text>

            {/* Form */}
            <View className="bg-gray-800 p-4 rounded-lg mb-6">
                <Text className="text-white font-bold text-lg mb-4">{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</Text>
                <TextInput
                    className="bg-gray-700 text-white p-3 rounded-lg mb-4"
                    placeholder="Nome da Categoria"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                />
                <View className="bg-gray-700 rounded-lg mb-4">
                    <Picker
                        selectedValue={type}
                        onValueChange={(itemValue) => setType(itemValue)}
                        style={{ color: '#FFFFFF' }}
                    >
                        <Picker.Item label="Despesa" value="expense" />
                        <Picker.Item label="Receita" value="income" />
                    </Picker>
                </View>

                {/* Public Switch */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white">Tornar Pública</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={isPublic ? "#f5dd4b" : "#f4f3f4"}
                        onValueChange={setIsPublic}
                        value={isPublic}
                    />
                </View>

                <TouchableOpacity onPress={handleSave} className="bg-violet-500 p-3 rounded-lg">
                    <Text className="text-white text-center font-bold">Salvar</Text>
                </TouchableOpacity>
                {isEditing && (
                    <View className="flex-row mt-3 gap-x-2">
                         <TouchableOpacity onPress={handleDelete} className="bg-red-500 p-3 rounded-lg flex-1">
                            <Text className="text-white text-center font-bold">Excluir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={clearForm} className="bg-gray-600 p-3 rounded-lg flex-1">
                            <Text className="text-white text-center font-bold">Cancelar Edição</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* List */}
            <Text className="text-white font-bold text-lg mb-4">Minhas Categorias</Text>
            <FlatList
                data={userCategories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id.toString()}
                className="bg-gray-800 rounded-lg"
                ListEmptyComponent={<Text className="text-white/60 text-center p-4">Nenhuma categoria pessoal encontrada.</Text>}
            />

            <TouchableOpacity onPress={onClose} className="mt-6 bg-gray-700 p-3 rounded-lg">
                <Text className="text-white text-center">Fechar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default CategoryManager;
