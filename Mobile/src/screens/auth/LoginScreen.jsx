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
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Leaf, Mail, Lock } from 'lucide-react-native';

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const loginSuccess = useAuthStore((state) => state.loginSuccess);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const token = res?.accessToken || res?.token;
      const user = res?.user;

      if (!token || !user) {
        throw new Error('Dữ liệu đăng nhập không hợp lệ.');
      }

      // Kiểm tra role: Nếu là Admin hoặc Mod, nhắc nhở dùng web
      const role = (user.role || '').toLowerCase();
      if (role === 'admin' || role === 'moderator' || role === 'mod') {
        Alert.alert(
          'Thông báo quản trị',
          'Tài khoản của bạn có quyền Quản trị (Admin/Mod). Ứng dụng di động chỉ phục vụ cho người dùng (User). Vui lòng sử dụng phiên bản Web để truy cập các tính năng quản lý!',
          [{ text: 'Đã hiểu' }]
        );
      }

      await loginSuccess(token, user);
    } catch (err) {
      Alert.alert('Đăng nhập thất bại', err.message || 'Kiểm tra lại email hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        {/* Logo & Slogan */}
        <View style={styles.logoBox}>
          <View style={styles.iconCircle}>
            <Leaf size={36} color="#ffffff" />
          </View>
          <Text style={styles.brandTitle}>VeggieAI</Text>
          <Text style={styles.brandSub}>Trợ lý dinh dưỡng thuần chay thông minh</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Mail size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              placeholder="Email của bạn"
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
            title="Đăng Nhập"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 8 }}
          />

          <View style={styles.footerLink}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
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
  logoBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...theme.shadows.md,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  brandSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
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
  footerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
