import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './src/store/useAuthStore';
import { AppNavigator } from './src/navigation/AppNavigator';

// Cấu hình TanStack Query với chiến lược Cache thông minh cho Mobile
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 10,     // Dữ liệu coi là mới trong 10 phút
      cacheTime: 1000 * 60 * 60 * 24, // Giữ trong cache 24h để xem offline khi vào bếp
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    // Khởi tạo trạng thái đăng nhập từ SecureStore
    initAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <AppNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
