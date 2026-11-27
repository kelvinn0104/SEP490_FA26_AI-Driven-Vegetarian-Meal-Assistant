import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ArrowLeft, Leaf } from 'lucide-react-native';
import { c, font, r } from '../../styles/theme';

export function IconButton({ label, icon: Icon, onPress, disabled, badge = 0, tone = 'plain', size = 44 }) {
  const bg =
    tone === 'overlay'
      ? 'rgba(250, 247, 240, 0.92)'
      : tone === 'surface'
        ? c.surfaceElevated
        : tone === 'soft'
          ? c.surfaceMuted
          : 'transparent';
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={6}
      android_ripple={{ color: 'rgba(20,38,28,0.08)', borderless: true }}
      onPress={onPress}
      style={({ pressed }) => [
        s.icon,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderWidth: tone === 'surface' ? StyleSheet.hairlineWidth : 0,
          borderColor: c.lineStrong,
        },
        pressed && !disabled && { opacity: 0.72 },
        disabled && { opacity: 0.4 },
      ]}
    >
      <Icon size={20} color={c.ink} strokeWidth={1.8} />
      {badge > 0 ? (
        <View style={s.badge}>
          <Text style={s.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function Header({ title, subtitle, onBack, rightAction }) {
  const isBrand = !onBack && title === 'VeggieAI';
  return (
    <View style={s.header}>
      {onBack ? (
        <IconButton label="Quay lại" icon={ArrowLeft} onPress={onBack} tone="plain" />
      ) : isBrand ? (
        <Leaf size={19} color={c.primary} strokeWidth={2} />
      ) : null}
      <View style={s.titleWrap}>
        <Text accessibilityRole="header" style={[s.title, isBrand && s.brandTitle]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {rightAction ? <View style={s.actions}>{rightAction}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: c.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontFamily: font.semi,
    color: c.ink,
    fontSize: 19.5,
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
  brandTitle: {
    fontSize: 22,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: font.regular,
    fontSize: 12,
    color: c.muted,
    includeFontPadding: false,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  badge: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3.5,
    borderRadius: r.pill,
    backgroundColor: c.terracotta,
    borderWidth: 1.5,
    borderColor: c.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: font.semi,
    fontSize: 9.5,
    color: '#FFFEFA',
    includeFontPadding: false,
  },
});
