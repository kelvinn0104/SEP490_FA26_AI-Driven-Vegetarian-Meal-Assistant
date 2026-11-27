import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from './AuthLayout';
import { Field } from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { authService } from '../../api/services/authService';
import { useAuthStore } from '../../store/useAuthStore';

export function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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
  return <AuthLayout navigation={navigation} title="Tạo tài khoản" detail="Bạn sẽ xác thực email trước khi sử dụng tài khoản." step="Bước 1 / 2" error={mutation.error?.message}>
    <Field label="Tên hiển thị" autoComplete="name" maxLength={100} value={name} onChangeText={setName} />
    <Field label="Email" autoComplete="email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
    <Field label="Mật khẩu" autoComplete="new-password" secureTextEntry value={password} onChangeText={setPassword} />
    <Field label="Xác nhận mật khẩu" autoComplete="new-password" secureTextEntry value={confirm} onChangeText={setConfirm} />
    <Button title="Gửi mã xác thực" loading={mutation.isPending} disabled={!name.trim() || !email.includes('@') || password.length < 6 || !confirm} onPress={() => mutation.mutate()} />
  </AuthLayout>;
}
