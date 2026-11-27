import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from './AuthLayout';
import { Field } from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { authService } from '../../api/services/authService';
import { useAuthStore } from '../../store/useAuthStore';

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const notice = useAuthStore(state => state.notice);
  const pending = useAuthStore(state => state.pendingVerification);
  const remember = useAuthStore(state => state.rememberVerification);
  const login = useAuthStore(state => state.loginSuccess);
  const address = email.trim().toLowerCase();
  const mutation = useMutation({
    mutationFn: async () => login(await authService.login(address, password)),
    onError: error => {
      if (error.status === 403 && (JSON.stringify(error.data).includes('EMAIL_NOT_VERIFIED') || /chưa xác thực/i.test(error.message))) {
        if (pending?.email !== address) remember(address);
        navigation.navigate('OtpVerify', { email: address });
      }
    },
  });
  return <AuthLayout navigation={navigation} title="Đăng nhập" detail="Dùng tài khoản VeggieAI của bạn." error={mutation.error?.message || notice}>
    <Field label="Email" autoComplete="email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
    <Field label="Mật khẩu" autoComplete="current-password" secureTextEntry value={password} onChangeText={setPassword} />
    <Button title="Đăng nhập" loading={mutation.isPending} disabled={!address.includes('@') || !password} onPress={() => mutation.mutate()} />
    <Button title="Tạo tài khoản" variant="outline" onPress={() => navigation.navigate('Register')} />
    {pending?.email && <Button title="Tiếp tục xác thực email" variant="secondary" onPress={() => navigation.navigate('OtpVerify', { email: pending.email })} />}
  </AuthLayout>;
}
