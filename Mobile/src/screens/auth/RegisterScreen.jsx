import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { theme } from '../../styles/theme';
import { authService } from '../../api/services/authService';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { User, Mail, Lock } from 'lucide-react-native';

export function RegisterScreen({ navigation }) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password || !displayName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        email,
        password,
        displayName,
        role: 'user', // Mobile chỉ cho đăng ký role User!
      });

      Alert.alert(
        'Đăng ký thành công',
        'Mã xác thực OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư!',
        [
          {
            text: 'Tiếp tục nhập OTP',
            onPress: () => navigation.navigate('OtpVerify', { email }),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Đăng ký thất bại', err.message || 'Không thể tạo tài khoản lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Tạo Tài Khoản" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <Text style={styles.title}>Gia nhập cộng đồng VeggieAI</Text>
        <Text style={styles.subTitle}>Hành trình ăn chay khỏe mạnh, cân bằng dinh dưỡng</Text>

        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <User size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              placeholder="Họ và tên của bạn"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
            />
          </View>

          <View style={styles.inputWrap}>
            <Mail size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              placeholder="Địa chỉ Email"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrap}>
            <Lock size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              placeholder="Mật khẩu"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button
            title="Đăng Ký & Nhận OTP"
            onPress={handleRegister}
            loading={loading}
            style={{ marginTop: 8 }}
          />
        </View>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subTitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    height: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
});
