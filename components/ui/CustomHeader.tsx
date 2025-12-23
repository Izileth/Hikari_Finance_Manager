import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useProfile } from '../../context/ProfileContext';

// Icons
const HomeIcon = ({ size = 24, active = false }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <Path d="M9 22V12h6v10" />
    </Svg>
);

const CompassIcon = ({ size = 24, active = false }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="10" />
        <Path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill={active ? "white" : "none"} />
    </Svg>
);

const WalletIcon = ({ size = 24, active = false }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="6" width="18" height="13" rx="2" />
        <Path d="M3 10h18M7 6V4a1 1 0 011-1h8a1 1 0 011 1v2" />
        <Circle cx="17" cy="13" r="1.5" fill="white" />
    </Svg>
);

export const PlusSquareIcon = ({ size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <Path d="M12 8v8M8 12h8" />
    </Svg>
);

const FlashIcon = ({ size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
);

const NAV_ITEMS = [
    { href: '/(tabs)/profile', icon: HomeIcon, label: 'Perfil' },
    { href: '/(tabs)/feed', icon: CompassIcon, label: 'Feed' },
    { href: '/(tabs)/financials', icon: WalletIcon, label: 'Finanças' },
] as const;

export default function CustomHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const { profile } = useProfile();

    const getInitials = () => {
        if (!profile?.name) return '?';
        const names = profile.name.trim().split(' ');
        if (names.length === 1) return names[0][0].toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };
    const handleNavigation = (href: '/(tabs)/profile' | '/(tabs)/feed' | '/(tabs)/financials') => {
        router.push(href);
    };

    return (
        <SafeAreaView className="bg-black h-32">
            <View className="flex-row  justify-between items-center px-6 pt-2">
                {/* Left Side - Logo */}
                <TouchableOpacity
                    onPress={() => handleNavigation('/(tabs)/financials')}
                    activeOpacity={0.7}
                    className="mr-4"
                >
                    <FlashIcon size={24} />
                </TouchableOpacity>

                {/* Center - Navigation Icons */}
                <View className="flex-1 flex-row items-center justify-center gap-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const IconComponent = item.icon;

                        return (
                            <TouchableOpacity
                                key={item.href}
                                onPress={() => handleNavigation(item.href)}
                                className={`px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-white/10' : 'bg-transparent'
                                    }`}
                                activeOpacity={0.7}
                            >
                                <IconComponent size={22} active={isActive} />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Right Side - Action Button & Profile */}
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        onPress={() => handleNavigation('/(tabs)/create-post')}
                        activeOpacity={0.7}
                        className="p-1"
                    >
                        <PlusSquareIcon size={22} />
                    </TouchableOpacity>

                    {/* Profile Avatar */}
                    <TouchableOpacity
                        onPress={() => handleNavigation('/(tabs)/profile')}
                        activeOpacity={0.7}
                        className="relative"
                    >
                        {profile?.avatar_url ? (
                            <View className="relative">
                                <View className={`w-9 h-9 rounded-full overflow-hidden transition-all ${pathname === '/(tabs)/profile'
                                        ? 'border-2 border-white'
                                        : 'border border-white/20'
                                    }`}>
                                    <Image
                                        source={{ uri: profile.avatar_url }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                </View>
                                {pathname === '/(tabs)/profile' && (
                                    <View className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white border-2 border-black" />
                                )}
                            </View>
                        ) : (
                            <View className="relative">
                                <View className={`w-9 h-9 rounded-full items-center justify-center transition-all ${pathname === '/(tabs)/profile'
                                        ? 'bg-white border-2 border-white'
                                        : 'bg-white/10 border border-white/20'
                                    }`}>
                                    <Text className={`text-sm font-bold ${pathname === '/(tabs)/profile' ? 'text-black' : 'text-white'
                                        }`}>
                                        {getInitials()}
                                    </Text>
                                </View>
                                {pathname === '/(tabs)/profile' && (
                                    <View className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white border-2 border-black" />
                                )}
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}