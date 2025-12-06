import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabaseUrl = 'https://ejtntwmlkirfbwcotljl.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdG50d21sa2lyZmJ3Y290bGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MjQ1MzMsImV4cCI6MjA4MDEwMDUzM30.N9QERE4Wty0vpZbTf2e3kuj5KxLKn1v1QQziFmpOr3c';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
