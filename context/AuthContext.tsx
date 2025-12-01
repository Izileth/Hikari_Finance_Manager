import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { Tables } from '../lib/database.types';

// Define the shape of the session and user for our context
type Session = {
  access_token: string;
  refresh_token: string;
  user: User;
};

type User = {
  id: string;
  email: string;
  // Add other user properties as needed
};

type AuthData = {
  session: Session | null;
  user: User | null;
  profile: Tables<'profiles'> | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthData>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (email: string, token: string) => {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${email}&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.length > 0) {
        setProfile(data[0]);
      } else {
        throw new Error(data.message || 'Failed to fetch profile');
      }
    } catch (e) {
      console.error('Failed to fetch profile.', e);
      setProfile(null); // Clear profile on error
    }
  };
  
  const refreshProfile = async () => {
    if (user && session) {
      await fetchProfile(user.email, session.access_token);
    }
  };

  // Fetch session from storage on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem('supabase.session');
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          setSession(parsedSession);
          setUser(parsedSession.user);
          // Fetch profile after setting user
          if (parsedSession.user) {
            await fetchProfile(parsedSession.user.email, parsedSession.access_token);
          }
        }
      } catch (e) {
        console.error('Failed to load session.', e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error_description || 'Failed to sign in');
      }
      
      setSession(data);
      setUser(data.user);
      await AsyncStorage.setItem('supabase.session', JSON.stringify(data));
      await fetchProfile(data.user.email, data.access_token);
      return {};

    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // 1. Sign up the user in Supabase Auth
      const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.user) {
        throw new Error(data.message || 'Failed to sign up');
      }

      // 2. The user is signed up but not logged in. Log them in to get a token.
      const loginResponse = await signIn(email, password);
      if (loginResponse.error) {
          throw loginResponse.error;
      }

      // 3. Create the profile in the 'profiles' table
      const newProfile = { name, email, password: '[protected]' };
      // We need the token from the login response to authorize this request
      const sessionDataString = await AsyncStorage.getItem('supabase.session');
      if (!sessionDataString) {
        throw new Error("Session not found after login.");
      }
      const sessionData = JSON.parse(sessionDataString);

      const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${sessionData.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
          },
          body: JSON.stringify(newProfile),
      });

      if (!profileResponse.ok) {
          const profileError = await profileResponse.json();
          throw new Error(profileError.message || 'Failed to create profile.');
      }

      // Fetch the newly created profile to update the context
      await fetchProfile(email, sessionData.access_token);

      return {};

    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('supabase.session');
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (e) {
      console.error('Failed to sign out.', e);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
