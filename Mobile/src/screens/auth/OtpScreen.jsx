import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CheckCircle2, RefreshCw } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from './AuthLayout';
import { Badge, Notice, ui } from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { authService } from '../../api/services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { c, font, r } from '../../styles/theme';

const deadline = seconds => (typeof seconds === 'number' ? Date.now() + seconds * 1000 : null);
const secondsLeft = (due, now) => (due == null ? null : Math.max(0, Math.ceil((due - now) / 1000)));

export function OtpScreen({ route, navigation }) {
  const { email, alreadySent } = route.params;
  const inputRef = useRef(null);
  const pending = useAuthStore(state => state.pendingVerification);
  const remember = useAuthStore(state => state.rememberVerification);
  const [otp, setOtp] = useState('');
  const [focused, setFocused] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [retryAt, setRetryAt] = useState(null);
  const [info, setInfo] = useState(alreadySent ? 'Dùng mã xác thực gần nhất đã gửi đến hộp thư.' : '');

  const login = useAuthStore(state => state.loginSuccess);
  const saved = pending?.email === email ? pending : null;
  const expiresIn = secondsLeft(saved?.expiresAt, now);
  const cooldown = secondsLeft(Math.max(retryAt || 0, saved?.resendAt || 0), now);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const verify = useMutation({
    mutationFn: async () => login(await authService.verifyCode(email, otp)),
  });

  const resend = useMutation({
    mutationFn: () => authService.resend(email),
    onSuccess: result => {
      setOtp('');
      remember(email, result ?? {});
      setRetryAt(null);
      setNow(Date.now());
      setInfo(
        result?.codeSent === false
          ? 'Dùng mã gần nhất đã gửi đến email của bạn.'
          : 'Đã gửi mã mới. Hãy kiểm tra cả mục Thư rác / Quảng cáo.'
      );
    },
    onError: error => {
      if (error.retryAfterSeconds) setRetryAt(deadline(error.retryAfterSeconds));
    },
  });

  const busy = verify.isPending || resend.isPending;

  return (
    <AuthLayout
      navigation={navigation}
      title="Xác thực email"
      detail={`Nhập mã gồm 6 chữ số vừa gửi tới ${email}`}
      step="Bước 2 / 2"
      error={verify.error?.message || resend.error?.message}
    >
      <View style={{ gap: 10, alignItems: 'center' }}>
        <Text style={ui.label}>Mã xác thực OTP</Text>

        {/* 6-Digit Segmented Visual Boxes backed by Native OTP Input */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nhập mã xác thực 6 chữ số"
          onPress={() => inputRef.current?.focus()}
          style={s.otpRow}
        >
          {Array.from({ length: 6 }).map((_, index) => {
            const digit = otp[index] || '';
            const isCurrent = focused && (otp.length === index || (otp.length === 6 && index === 5));
            return (
              <View
                key={index}
                style={[
                  s.otpCell,
                  digit && s.otpCellFilled,
                  isCurrent && s.otpCellActive,
                ]}
              >
                <Text style={s.otpDigit}>{digit}</Text>
              </View>
            );
          })}
          <TextInput
            ref={inputRef}
            accessibilityLabel="Mã xác thực 6 số"
            inputMode="numeric"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            caretHidden
            maxLength={6}
            value={otp}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChangeText={value => setOtp(value.replace(/\D/g, '').slice(0, 6))}
            style={s.hiddenInput}
          />
        </Pressable>

        <Badge
          label={
            expiresIn === 0
              ? 'Mã đã hết hạn · Vui lòng gửi lại'
              : expiresIn != null
                ? `Còn hiệu lực trong ${expiresIn} giây`
                : 'Kiểm tra mã mới nhất trong hộp thư'
          }
          tone={expiresIn === 0 ? 'error' : 'soft'}
        />
      </View>

      <Notice success>{info}</Notice>

      <Button
        title="Xác thực email"
        icon={CheckCircle2}
        loading={verify.isPending}
        disabled={busy || otp.length !== 6 || expiresIn === 0}
        onPress={() => {
          resend.reset();
          verify.mutate();
        }}
      />

      <Button
        title={cooldown ? `Gửi lại mã sau ${cooldown} giây` : 'Gửi lại mã xác thực'}
        icon={RefreshCw}
        variant="outline"
        loading={resend.isPending}
        disabled={busy || cooldown > 0}
        onPress={() => {
          verify.reset();
          resend.mutate();
        }}
      />
    </AuthLayout>
  );
}

const s = StyleSheet.create({
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    position: 'relative',
    paddingVertical: 4,
  },
  otpCell: {
    flex: 1,
    maxWidth: 48,
    height: 56,
    borderRadius: r.md,
    borderWidth: 1.5,
    borderColor: c.lineStrong,
    backgroundColor: c.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpCellFilled: {
    backgroundColor: c.surface,
    borderColor: c.ink,
  },
  otpCellActive: {
    borderColor: c.terracotta,
    borderWidth: 2,
    backgroundColor: c.surfaceElevated,
  },
  otpDigit: {
    fontFamily: font.bold,
    fontSize: 22,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.01,
    color: 'transparent',
  },
});
