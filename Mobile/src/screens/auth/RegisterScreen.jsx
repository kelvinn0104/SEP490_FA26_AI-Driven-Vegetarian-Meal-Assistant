import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Eye, EyeOff, UserPlus } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from './AuthLayout';
import { Field } from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { authService } from '../../api/services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { c } from '../../styles/theme';

export function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const remember = useAuthStore(state => state.rememberVerification);

  const mutation = useMutation({
    mutationFn: async () => {
      if (name.trim().length < 2) throw new Error('Tên hiển thị cần ít nhất 2 ký tự.');
      if (password !== confirm) throw new Error('Mật khẩu xác nhận chưa khớp.');
      return authService.register(email.trim().toLowerCase(), password, name.trim());
    },
    onSuccess: data => {
      setPassword('');
      setConfirm('');
      const address = data?.email || email.trim().toLowerCase();
      remember(address, data ?? {});
      navigation.replace('OtpVerify', { email: address, alreadySent: data?.codeSent === false });
    },
  });

  return (
    <AuthLayout
      navigation={navigation}
      title="Tạo tài khoản"
      detail="Mã xác thực 6 số sẽ được gửi qua email."
      step="Bước 1 / 2"
      error={mutation.error?.message}
    >
      <Field
        label="Tên hiển thị"
        placeholder="Ví dụ: Minh Khang"
        autoComplete="name"
        maxLength={100}
        value={name}
        onChangeText={setName}
      />
      <Field
        label="Email"
        placeholder="ban@email.com"
        autoComplete="email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Field
        label="Mật khẩu"
        hint="Tối thiểu 6 ký tự"
        placeholder="Tạo mật khẩu"
        autoComplete="new-password"
        secureTextEntry={!showPwd}
        value={password}
        onChangeText={setPassword}
        rightAction={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            hitSlop={10}
            onPress={() => setShowPwd(!showPwd)}
          >
            {showPwd ? <EyeOff size={19} color={c.muted} /> : <Eye size={19} color={c.muted} />}
          </Pressable>
        }
      />
      <Field
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu"
        autoComplete="new-password"
        secureTextEntry={!showPwd}
        value={confirm}
        onChangeText={setConfirm}
      />
      <Button
        title="Nhận mã xác thực"
        icon={UserPlus}
        loading={mutation.isPending}
        disabled={!name.trim() || !email.includes('@') || password.length < 6 || !confirm}
        onPress={() => mutation.mutate()}
      />
      <Button
        title="Đã có tài khoản? Đăng nhập"
        variant="ghost"
        onPress={() => navigation.navigate('Login')}
      />
    </AuthLayout>
  );
}
