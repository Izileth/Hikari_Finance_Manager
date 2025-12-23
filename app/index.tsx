import { View, Text, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { FinanceLogoIcon } from "../components/ui/Icons";

export default function Index() {
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Animações para "Bem-vindo"
  const welcomeFadeAnim = useRef(new Animated.Value(0)).current;
  const welcomeSlideAnim = useRef(new Animated.Value(20)).current;
  
  // Animação do loading indicator
  const loadingAnim = useRef(new Animated.Value(0)).current;
  
  // Animação de brilho na logo
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequência de animações
    Animated.sequence([
      // 1. Entrada da logo com efeito de brilho
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      
      // 2. Pequena pausa
      Animated.delay(300),
      
      // 3. Entrada da mensagem "Bem-vindo"
      Animated.parallel([
        Animated.timing(welcomeFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(welcomeSlideAnim, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      
      // 4. Efeito de brilho sutil na logo
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navega após completar todas as animações
      setTimeout(() => {
        router.replace("/redirector");
      }, 1500);
    });

    // Animação contínua do loading indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(loadingAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View className="flex-1 bg-black justify-center items-center">
      {/* Logo Container com Animação */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}
        className="items-center"
      >
        {/* Logo Icon com efeito de brilho */}
        <Animated.View
          style={{
            opacity: Animated.add(0.7, Animated.multiply(glowAnim, 0.3)),
          }}
          className="mb-6"
        >
          <FinanceLogoIcon size={120} />
        </Animated.View>

        {/* App Name com Animação */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <Text className="text-white text-5xl font-bold tracking-tight mb-2">
            Hikari
          </Text>
          <Text className="text-white/40 text-sm text-center tracking-widest uppercase">
            Finance Manager
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Mensagem "Bem-vindo" */}
      <Animated.View
        style={{
          opacity: welcomeFadeAnim,
          transform: [{ translateY: welcomeSlideAnim }]
        }}
        className="absolute"
        pointerEvents="none"
      >
        <View className="items-center mt-80">
          <Text className="text-white/90 text-2xl font-light tracking-wide">
            Bem-vindo
          </Text>
          <View className="h-0.5 w-16 bg-white/30 mt-2 rounded-full" />
        </View>
      </Animated.View>

      {/* Loading Indicator Melhorado */}
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="absolute bottom-20"
      >
        <View className="flex-row gap-2">
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={{
                opacity: loadingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: index === 0 ? [0.3, 1] : index === 1 ? [0.5, 0.3] : [1, 0.5],
                }),
                transform: [
                  {
                    scale: loadingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: index === 0 ? [1, 1.2] : index === 1 ? [1.2, 1] : [1, 1.2],
                    }),
                  },
                ],
              }}
              className="w-2 h-2 rounded-full bg-white"
            />
          ))}
        </View>
      </Animated.View>

      {/* Version/Copyright */}
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="absolute bottom-8"
      >
        <Text className="text-white/20 text-xs">
          v1.6.2
        </Text>
      </Animated.View>
    </View>
  );
}