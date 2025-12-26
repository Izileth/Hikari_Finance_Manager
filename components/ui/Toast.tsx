import React, { useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import {
  CheckCircleIcon,
  ErrorCircleIcon,
  InfoCircleIcon,
} from './Icons';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onDismiss: (id: string) => void;
  duration?: number;
}

/**
 * Minimal black & white config
 */
const toastConfig = {
  success: {
    icon: <CheckCircleIcon color="#FFFFFF" />,
  },
  error: {
    icon: <ErrorCircleIcon color="#FFFFFF" />,
  },
  info: {
    icon: <InfoCircleIcon color="#FFFFFF" />,
  },
};

export function Toast({
  id,
  message,
  type,
  onDismiss,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY < -5) {
        runOnJS(onDismiss)(id);
      }
    })
    .activeOffsetY([-10, 10]);

  const config = toastConfig[type];

  return (
    <GestureDetector gesture={pan}>
      <MotiView
        from={{ opacity: 0, transform: [{ translateY: -40 }] }}
        animate={{ opacity: 1, transform: [{ translateY: 0 }] }}
        exit={{ opacity: 0, transform: [{ translateY: -40 }] }}
        transition={{ type: 'timing', duration: 250 }}
        style={{
          position: 'absolute',
          top: 50,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 9999,
        }}
      >
        <TouchableOpacity
          onPress={() => onDismiss(id)}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',

            backgroundColor: '#0B0B0B',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',

            paddingVertical: 14,
            paddingHorizontal: 18,
            borderRadius: 10,

            shadowColor: '#000',
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,

            marginHorizontal: 16,
          }}
        >
          {config.icon}

          <Text
            style={{
              color: '#FFFFFF',
              fontWeight: '500',
              fontSize: 14,
              marginLeft: 12,
              flexShrink: 1,
              lineHeight: 20,
            }}
          >
            {message}
          </Text>
        </TouchableOpacity>
      </MotiView>
    </GestureDetector>
  );
}
