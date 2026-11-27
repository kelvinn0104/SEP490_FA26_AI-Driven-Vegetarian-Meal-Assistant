import React, { useEffect, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';
import { useAuthStore } from './src/store/useAuthStore';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const token = useAuthStore(state => state.token);
  const initAuth = useAuthStore(state => state.initAuth);
  const client = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: { retry: (count, error) => ![400, 401, 403, 404].includes(error.status) && count < 1, staleTime: 45_000, gcTime: 300_000 },
      mutations: { retry: false },
    },
  }), [token]);

  useEffect(() => { initAuth(); }, [initAuth]);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = AppState.addEventListener('change', state => focusManager.setFocused(state === 'active'));
    return () => subscription.remove();
  }, []);
  useEffect(() => () => client.clear(), [client]);

  return <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <QueryClientProvider client={client}>
      <StatusBar style="dark" />
      <AppNavigator key={token ? 'user' : 'guest'} />
    </QueryClientProvider>
  </SafeAreaProvider>;
}
