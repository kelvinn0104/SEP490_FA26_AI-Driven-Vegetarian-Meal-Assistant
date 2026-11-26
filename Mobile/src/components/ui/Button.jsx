import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { c } from '../../styles/theme';

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, icon: Icon, style }) {
  const primary = variant === 'primary';
  const ink = primary ? c.surface : c.ink;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title}
      accessibilityState={{ busy: loading, disabled: disabled || loading }}
      disabled={disabled || loading} onPress={onPress}
      style={({ pressed }) => [s.button, { backgroundColor: primary ? c.primary : c.primaryLight },
        variant === 'outline' && s.outline, (pressed || disabled) && s.dim, style]}>
      {loading ? <ActivityIndicator color={ink} /> : <>
        {Icon && <Icon size={18} color={ink} />}
        <Text style={[s.label, { color: ink }]}>{title}</Text>
      </>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: { minHeight: 48, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 13, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { fontSize: 14, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.line },
  dim: { opacity: 0.64 },
});
