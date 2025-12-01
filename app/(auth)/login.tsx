import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// SVG Components
const EyeIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2"/>
  </Svg>
);

const EyeOffIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823M7.362 7.561C5.68 8.74 4.279 10.42 3 12.5c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84M17 17l.5-.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const WalletIcon = ({ size = 80 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="13" rx="2" stroke="white" strokeWidth="1.5"/>
    <Path d="M3 10h18M7 6V4a1 1 0 011-1h8a1 1 0 011 1v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <Circle cx="17" cy="13" r="1.5" fill="white"/>
  </Svg>
);

const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"/>
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
  </Svg>
);

const AppleIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="white"/>
  </Svg>
);

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="white"/>
  </Svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      Alert.alert('Erro', error.message);
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="flex-1 justify-center px-8 py-12">
          {/* Logo/Icon */}
          <View className="items-center mb-12">
            <WalletIcon size={80} />
            <Text className="text-white text-3xl font-bold mt-6 mb-2">
              Entrar
            </Text>
            <Text className="text-white/60 text-base text-center">
              Acesse sua conta para continuar
            </Text>
          </View>

          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-white text-sm mb-2">
              Email
            </Text>
            <View className="border border-white/20 rounded-lg">
              <TextInput
                placeholder="seu@email.com"
                placeholderTextColor="#666666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="px-4 py-4 text-white text-base"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-white text-sm mb-2">
              Senha
            </Text>
            <View className="border border-white/20 rounded-lg flex-row items-center pr-4">
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#666666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                className="flex-1 px-4 py-4 text-white text-base"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                className="ml-2"
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="self-end mb-8">
            <Text className="text-white text-sm">
              Esqueceu a senha?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className={`rounded-lg py-4 mb-8 ${loading ? 'bg-white/20' : 'bg-white'}`}
            activeOpacity={0.8}
          >
            <Text className={`text-center text-base font-bold ${loading ? 'text-white' : 'text-black'}`}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-8">
            <View className="flex-1 h-px bg-white/20" />
            <Text className="mx-4 text-white/40 text-sm">ou continue com</Text>
            <View className="flex-1 h-px bg-white/20" />
          </View>

          {/* Social Buttons */}
          <View className="flex-row gap-4 mb-8">
            <TouchableOpacity className="flex-1 border border-white/20 rounded-lg py-4 items-center justify-center">
              <GoogleIcon size={20} />
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 border border-white/20 rounded-lg py-4 items-center justify-center">
              <AppleIcon size={20} />
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 border border-white/20 rounded-lg py-4 items-center justify-center">
              <FacebookIcon size={20} />
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-white/60 text-sm">
              Não tem uma conta?{' '}
            </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text className="text-white text-sm font-bold">
                  Cadastre-se
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}