import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { Tables } from '../lib/database.types';
import { ImagePickerAsset } from 'expo-image-picker';

type ProfileData = {
  profile: Tables<'profiles'> | null;
  loading: boolean;
  updateProfile: (updatedInfo: Partial<Tables<'profiles'>>) => Promise<{ error?: Error }>;
  uploadAvatar: (asset: ImagePickerAsset) => Promise<{ error?: Error }>;
};

const ProfileContext = createContext<ProfileData>({
  profile: null,
  loading: true,
  updateProfile: async () => ({}),
  uploadAvatar: async () => ({}),
});

export const useProfile = () => {
  return useContext(ProfileContext);
};

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session, profile: initialProfile, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(initialProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProfile(initialProfile);
    setLoading(false);
  }, [initialProfile]);

  const updateProfile = async (updatedInfo: Partial<Tables<'profiles'>>) => {
    if (!user || !session) {
      return { error: new Error('User not authenticated') };
    }
    setLoading(true);
    try {
      delete updatedInfo.id;
      delete updatedInfo.email;

      const response = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${user.email}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updatedInfo),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      if (data.length > 0) {
        setProfile(data[0]);
      }

      return {};

    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (asset: ImagePickerAsset) => {
    if (!user || !session) {
      return { error: new Error('User not authenticated') };
    }
  
    try {
      const file = asset;
      const fileName = `${user.id}/${new Date().getTime()}.${file.uri.split('.').pop()}`;
      const formData = new FormData();
      
      // The asset URI needs to be adapted for FormData
      const fileData: any = {
        uri: file.uri,
        name: fileName,
        type: file.mimeType ?? 'image/jpeg',
      };

      formData.append('file', fileData);
  
      const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/avatars/${fileName}`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });
  
      const uploadData = await uploadResponse.json();
  
      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || 'Failed to upload image.');
      }
      
      // Construct the public URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`;

      // Update the profile with the new avatar URL
      await updateProfile({ avatar_url: publicUrl });

      // After updating, refresh the profile data from the server
      if(refreshProfile) {
        await refreshProfile();
      }

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };
  
  const value = {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
