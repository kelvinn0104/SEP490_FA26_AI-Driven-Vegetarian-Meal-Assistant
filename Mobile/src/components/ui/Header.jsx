import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ArrowLeft, Leaf } from 'lucide-react-native';
import { c } from '../../styles/theme';

export function IconButton({ label, icon: Icon, onPress, disabled }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [s.icon, (pressed || disabled) && { opacity: 0.55 }]}>
      <Icon size={21} color={c.ink} strokeWidth={1.8} />
    </Pressable>
  );
}

export function Header({ title, onBack, rightAction }) {
  return (
    <View style={s.header}>
      {onBack ? <IconButton label="Quay lại" icon={ArrowLeft} onPress={onBack} /> : <Leaf size={22} color={c.primary} />}
      <Text accessibilityRole="header" style={s.title}>{title}</Text>
      {rightAction}
    </View>
  );
}

const s = StyleSheet.create({
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16,
    paddingVertical: 4, backgroundColor: c.background, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.line },
  title: { flex: 1, color: c.ink, fontWeight: '700', fontSize: 19 },
  icon: { minHeight: 48, width: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: c.primaryLight },
});
