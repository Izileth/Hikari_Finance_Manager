import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import Svg, { Path, Circle } from 'react-native-svg';

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

const ArrowLeftIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const UserPlusIcon = ({ size = 80 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckIcon = ({ size = 12 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  async function handleSignUp() {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Atenção', 'Você precisa aceitar os termos de uso');
      return;
    }

    setLoading(true);
    const { error } = await signUp(name, email, password);

    if (error) {
      Alert.alert('Erro', error.message);
    }
    setLoading(false);
  }

  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 3;
    return 2;
  };

  const passwordStrength = getPasswordStrength();

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
        <View className="flex-1 px-8 mt-20 py-12">
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center mb-8"
          >
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>

          {/* Header */}
          <View className="items-center mb-12">
            <UserPlusIcon size={80} />
            <Text className="text-white text-3xl font-bold mt-6 mb-2">
              Criar Conta
            </Text>
            <Text className="text-white/60 text-base text-center">
              Comece a controlar suas finanças
            </Text>
          </View>

          {/* Name Input */}
          <View className="mb-6">
            <Text className="text-white text-sm mb-2">
              Nome completo
            </Text>
            <View className="border border-white/20 rounded-lg">
              <TextInput
                placeholder="João Silva"
                placeholderTextColor="#666666"
                value={name}
                onChangeText={setName}
                className="px-4 py-4 text-white text-base"
              />
            </View>
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
          <View className="mb-6">
            <Text className="text-white text-sm mb-2">
              Senha
            </Text>
            <View className="border border-white/20 rounded-lg flex-row items-center pr-4">
              <TextInput
                placeholder="Mínimo 6 caracteres"
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

          {/* Confirm Password Input */}
          <View className="mb-4">
            <Text className="text-white text-sm mb-2">
              Confirmar senha
            </Text>
            <View className="border border-white/20 rounded-lg flex-row items-center pr-4">
              <TextInput
                placeholder="Digite a senha novamente"
                placeholderTextColor="#666666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                className="flex-1 px-4 py-4 text-white text-base"
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="ml-2"
              >
                {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <View className="mb-6">
              <View className="flex-row gap-2 mb-2">
                <View className={`flex-1 h-1 rounded ${passwordStrength >= 1 ? 'bg-white' : 'bg-white/20'}`} />
                <View className={`flex-1 h-1 rounded ${passwordStrength >= 2 ? 'bg-white' : 'bg-white/20'}`} />
                <View className={`flex-1 h-1 rounded ${passwordStrength >= 3 ? 'bg-white' : 'bg-white/20'}`} />
              </View>
              <Text className="text-white/40 text-xs">
                {passwordStrength === 1 ? 'Senha fraca' : passwordStrength === 2 ? 'Senha média' : 'Senha forte'}
              </Text>
            </View>
          )}

          {/* Terms Checkbox */}
          <TouchableOpacity 
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            className="flex-row items-start mb-8"
            activeOpacity={0.7}
          >
            <View className={`w-5 h-5 rounded border mr-3 items-center justify-center mt-0.5 ${acceptedTerms ? 'bg-white border-white' : 'border-white/20'}`}>
              {acceptedTerms && <CheckIcon size={12} />}
            </View>
            <Text className="flex-1 text-white/60 text-sm leading-5">
              Eu aceito os{' '}
              <Text className="text-white">
                Termos de Uso
              </Text>
              {' '}e a{' '}
              <Text className="text-white">
                Política de Privacidade
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            className={`rounded-lg py-4 mb-8 ${loading ? 'bg-white/20' : 'bg-white'}`}
            activeOpacity={0.8}
          >
            <Text className={`text-center text-base font-bold ${loading ? 'text-white' : 'text-black'}`}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-white/60 text-sm">
              Já tem uma conta?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-white text-sm font-bold">
                  Entrar
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}