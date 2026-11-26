import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { theme } from '../../styles/theme';
import { authService } from '../../api/services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { KeyRound } from 'lucide-react-native';

export function OtpScreen({ route, navigation }) {
  const { email } = route.params || {};
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const loginSuccess = useAuthStore((state) => state.loginSuccess);

  const handleVerify = async () => {
    if (!otpCode || otpCode.trim().length < 4) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã OTP 6 số.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyCode({
        email,
        otpCode: otpCode.trim(),
      });

      const token = res?.accessToken || res?.token;
      const user = res?.user;

      if (!token || !user) {
        throw new Error('Dữ liệu xác thực không hợp lệ.');
      }

      await loginSuccess(token, user);
      Alert.alert('Chào mừng!', 'Xác thực tài khoản thành công.');
    } catch (err) {
      Alert.alert('Xác thực thất bại', err.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Xác Thực OTP" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.iconBox}>
          <KeyRound size={32} color={theme.colors.primary} />
        </View>

        <Text style={styles.title}>Nhập Mã Xác Thực</Text>
        <Text style={styles.subTitle}>
          Mã OTP 6 số đã được gửi đến email: {'\n'}
          <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>{email}</Text>
        </Text>

        <View style={styles.otpInputBox}>
          <TextInput
            placeholder="000000"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.otpInput}
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />
        </View>

        <Button
          title="Xác Nhận & Đăng Nhập"
          onPress={handleVerify}
          loading={loading}
          style={{ width: '100%', marginTop: 12 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subTitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    marginBottom: 24,
  },
  otpInputBox: {
    width: '100%',
    height: 60,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    marginBottom: 16,
    justifyContent: 'center',
  },
  otpInput: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 10,
    color: theme.colors.primary,
  },
});
