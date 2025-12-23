import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const ChevronDownIcon = ({ size = 20, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M6 9l6 6 6-6" />
    </Svg>
);

const CloseIcon = ({ size = 24, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
);

const SearchIcon = ({ size = 20, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="11" cy="11" r="8" />
        <Path d="M21 21l-4.35-4.35" />
    </Svg>
);

const CheckIcon = ({ size = 20, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 6L9 17l-5-5" />
    </Svg>
);

interface PickerItem {
    label: string;
    value: any;
}

interface CustomPickerProps {
    items: PickerItem[];
    onValueChange: (value: any) => void;
    selectedValue: any;
    placeholder?: string;
    enabled?: boolean;
}

export function CustomPicker({
    items = [],
    onValueChange,
    selectedValue,
    placeholder = 'Selecione um item...',
    enabled = true,
}: CustomPickerProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const selectedLabel = useMemo(() => {
        const selectedItem = items.find(item => item.value === selectedValue);
        return selectedItem ? selectedItem.label : placeholder;
    }, [items, selectedValue, placeholder]);

    const filteredItems = useMemo(() => {
        if (!searchQuery) {
            return items;
        }
        return items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    const handleSelect = (item: PickerItem) => {
        onValueChange(item.value);
        setModalVisible(false);
        setSearchQuery('');
    };

    return (
        <>
            {/* Picker Trigger */}
            <TouchableOpacity
                onPress={() => enabled && setModalVisible(true)}
                className={`border border-white/20 rounded-lg px-4 py-4 flex-row justify-between items-center ${enabled ? '' : 'opacity-50'}`}
                disabled={!enabled}
                activeOpacity={0.7}
            >
                <Text className={`text-base ${selectedValue !== undefined && selectedValue !== null ? 'text-white' : 'text-white/40'}`}>
                    {selectedLabel}
                </Text>
                <ChevronDownIcon />
            </TouchableOpacity>

            {/* Options Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setSearchQuery('');
                }}
            >
                <SafeAreaView className="flex-1 bg-black">
                    <View className="flex-1 pt-14">
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center px-6 mb-6">
                            <Text className="text-white font-bold text-xl">{placeholder}</Text>
                            <TouchableOpacity 
                                onPress={() => {
                                    setModalVisible(false);
                                    setSearchQuery('');
                                }}
                                className="w-10 h-10 items-center justify-center"
                            >
                                <CloseIcon />
                            </TouchableOpacity>
                        </View>
                        
                        {/* Search Input */}
                        <View className="px-6 mb-4">
                            <View className="border border-white/20 rounded-lg flex-row items-center px-4">
                                <SearchIcon size={18} color="#666666" />
                                <TextInput
                                    className="flex-1 text-white py-4 px-3 text-base"
                                    placeholder="Buscar..."
                                    placeholderTextColor="#666666"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                        </View>

                        {/* Options List */}
                        <FlatList
                            data={filteredItems}
                            keyExtractor={(item) => String(item.value)}
                            contentContainerStyle={{ paddingHorizontal: 24 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleSelect(item)}
                                    className="flex-row items-center justify-between py-4 border-b border-white/10"
                                    activeOpacity={0.7}
                                >
                                    <Text className={`text-base flex-1 ${selectedValue === item.value ? 'text-white font-bold' : 'text-white'}`}>
                                        {item.label}
                                    </Text>
                                    {selectedValue === item.value && (
                                        <CheckIcon size={20} />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View className="py-16 items-center">
                                    <SearchIcon size={48} color="#333333" />
                                    <Text className="text-white/40 text-center mt-4">
                                        Nenhum item encontrado
                                    </Text>
                                </View>
                            }
                        />

                        {/* Bottom Safe Area */}
                        <View className="h-8" />
                    </View>
                </SafeAreaView>
            </Modal>
        </>
    );
}