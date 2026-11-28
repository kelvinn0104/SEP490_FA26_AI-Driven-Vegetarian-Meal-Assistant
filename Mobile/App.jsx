import React, { useEffect, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { BeVietnamPro_400Regular } from '@expo-google-fonts/be-vietnam-pro/400Regular';
import { BeVietnamPro_500Medium } from '@expo-google-fonts/be-vietnam-pro/500Medium';
import { BeVietnamPro_600SemiBold } from '@expo-google-fonts/be-vietnam-pro/600SemiBold';
import { Lora_500Medium } from '@expo-google-fonts/lora/500Medium';
import { Lora_600SemiBold } from '@expo-google-fonts/lora/600SemiBold';
import { Lora_400Regular_Italic } from '@expo-google-fonts/lora/400Regular_Italic';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useAuthStore } from './src/store/useAuthStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { c } from './src/styles/theme';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_400Regular_Italic,
  });
  const token = useAuthStore(state => state.token);
  const initAuth = useAuthStore(state => state.initAuth);

  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (count, error) => ![400, 401, 403, 404].includes(error.status) && count < 1,
            staleTime: 45_000,
            gcTime: 300_000,
          },
          mutations: { retry: false },
        },
      }),
    [token]
  );

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = AppState.addEventListener('change', state => focusManager.setFocused(state === 'active'));
    return () => subscription.remove();
  }, []);

  useEffect(() => () => client.clear(), [client]);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider enabled={Platform.OS !== 'web'}>
        <QueryClientProvider client={client}>
          <StatusBar style="dark" backgroundColor={c.background} translucent={false} />
          <AppNavigator key={token ? 'user' : 'guest'} fontsReady={fontsLoaded || !!fontError} />
        </QueryClientProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
