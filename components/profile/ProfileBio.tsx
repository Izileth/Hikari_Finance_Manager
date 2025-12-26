
import { View, Text } from 'react-native';

type ProfileBioProps = {
    bio: string | null | undefined;
};

export function ProfileBio({ bio }: ProfileBioProps) {
    if (!bio) return null;

    return (
        <View className="mb-12 px-6">
            <Text className="text-white/40 text-xs mb-2 uppercase tracking-wider">
                Bio
            </Text>
            <Text className="text-white text-base leading-6">
                {bio}
            </Text>
        </View>
    );
}
