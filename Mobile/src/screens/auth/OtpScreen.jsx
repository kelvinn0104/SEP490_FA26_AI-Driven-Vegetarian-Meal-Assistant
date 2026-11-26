import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from './AuthLayout';
import { Field, Notice, ui } from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { authService } from '../../api/services/authService';
import { useAuthStore } from '../../store/useAuthStore';

const deadline = seconds => typeof seconds === 'number' ? Date.now() + seconds * 1000 : null;
const secondsLeft = (due, now) => due == null ? null : Math.max(0, Math.ceil((due - now) / 1000));

export function OtpScreen({ route, navigation }) {
  const { email, alreadySent } = route.params;
  const pending = useAuthStore(state => state.pendingVerification);
  const remember = useAuthStore(state => state.rememberVerification);
  const [otp, setOtp] = useState('');
  const [now, setNow] = useState(Date.now());
  const [retryAt, setRetryAt] = useState(null);
  const [info, setInfo] = useState(alreadySent ? 'Dùng mã gần nhất đã gửi đến email.' : '');
  const login = useAuthStore(state => state.loginSuccess);
  const saved = pending?.email === email ? pending : null;
  const expiresIn = secondsLeft(saved?.expiresAt, now);
  const cooldown = secondsLeft(Math.max(retryAt || 0, saved?.resendAt || 0), now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const verify = useMutation({ mutationFn: async () => login(await authService.verifyCode(email, otp)) });
  const resend = useMutation({
    mutationFn: () => authService.resend(email),
    onSuccess: result => {
      setOtp('');
      remember(email, result ?? {});
      setRetryAt(null);
      setNow(Date.now());
      setInfo(result?.codeSent === false ? 'Dùng mã gần nhất đã gửi đến email.' : 'Đã gửi mã mới. Kiểm tra cả thư rác.');
    },
    onError: error => {
      if (error.retryAfterSeconds) setRetryAt(deadline(error.retryAfterSeconds));
    },
  });
  const busy = verify.isPending || resend.isPending;
  return <AuthLayout navigation={navigation} title="Xác thực email" detail={'Nhập mã 6 số gửi đến ' + email} step="Bước 2 / 2" error={verify.error?.message || resend.error?.message}>
    <Field label="Mã xác thực" inputMode="numeric" autoComplete="one-time-code" textContentType="oneTimeCode"
      value={otp} onChangeText={value => setOtp(value.replace(/\D/g, '').slice(0, 6))}
      style={{ fontSize: 25, letterSpacing: 9, textAlign: 'center', fontVariant: ['tabular-nums'] }} />
    <Text style={ui.small}>{expiresIn === 0 ? 'Mã hết hạn. Hãy gửi lại.' : expiresIn != null ? 'Mã còn hiệu lực ' + expiresIn + ' giây' : 'Dùng mã gần nhất trong hộp thư.'}</Text>
    <Notice>{info}</Notice>
    <Button title="Xác thực và tiếp tục" loading={verify.isPending} disabled={busy || otp.length !== 6 || expiresIn === 0} onPress={() => { resend.reset(); verify.mutate(); }} />
    <Button title={cooldown ? 'Gửi lại sau ' + cooldown + ' giây' : 'Gửi lại mã'} variant="outline"
      loading={resend.isPending} disabled={busy || cooldown > 0} onPress={() => { verify.reset(); resend.mutate(); }} />
  </AuthLayout>;
}
