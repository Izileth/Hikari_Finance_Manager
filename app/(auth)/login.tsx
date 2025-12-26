import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { WalletIcon, EyeIcon, EyeOffIcon } from '../../components/ui/Icons';

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

          {/* Forgot Password 
          
            <TouchableOpacity className="self-end mb-8">
            <Text className="text-white text-sm">
              Esqueceu a senha?
            </Text>
          </TouchableOpacity>

          */}

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