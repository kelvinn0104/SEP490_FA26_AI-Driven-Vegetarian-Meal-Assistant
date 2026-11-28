import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { c, font, r } from '../../styles/theme';

const VARIANTS = {
  // Terracotta ceramic glaze — ONLY primary CTA per screen
  primary: { bg: c.terracotta, ink: '#FFFEFA', border: 'transparent', ripple: 'rgba(255,255,255,0.16)' },
  // Deep botanical ink — secondary emphasis
  ink: { bg: c.ink, ink: '#FFFEFA', border: 'transparent', ripple: 'rgba(255,255,255,0.14)' },
  // Lime — STRICTLY ONLY for completed states (Đã ăn, Đã mua, Đã lưu)
  done: { bg: c.lime, ink: c.ink, border: c.lime, ripple: 'rgba(20,38,28,0.1)' },
  lime: { bg: c.lime, ink: c.ink, border: c.lime, ripple: 'rgba(20,38,28,0.1)' },
  secondary: { bg: c.surfaceMuted, ink: c.ink, border: 'transparent', ripple: 'rgba(20,38,28,0.08)' },
  outline: { bg: 'transparent', ink: c.ink, border: c.lineStrong, ripple: 'rgba(20,38,28,0.08)' },
  ghost: { bg: 'transparent', ink: c.terracotta, border: 'transparent', ripple: 'rgba(164,83,47,0.08)' },
  danger: { bg: 'transparent', ink: c.error, border: c.errorBorder, ripple: 'rgba(152,54,40,0.1)' },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  trailingIcon: TrailingIcon,
  style,
}) {
  const tone = VARIANTS[variant] || VARIANTS.primary;
  const compact = size === 'sm';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ busy: loading, disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      hitSlop={compact ? 4 : 0}
      android_ripple={{ color: tone.ripple }}
      style={({ pressed }) => [
        s.button,
        compact && s.sm,
        size === 'pill' && s.pill,
        {
          backgroundColor: tone.bg,
          borderColor: tone.border,
          borderWidth: tone.border === 'transparent' ? 0 : 1,
        },
        pressed && !disabled && s.pressed,
        disabled && s.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.ink} />
      ) : (
        <>
          {Icon ? <Icon size={compact ? 15 : 17} color={tone.ink} strokeWidth={1.9} /> : null}
          <Text style={[s.label, compact && s.labelSm, { color: tone.ink }]} numberOfLines={1}>
            {title}
          </Text>
          {TrailingIcon ? <TrailingIcon size={compact ? 14 : 16} color={tone.ink} strokeWidth={1.9} /> : null}
        </>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: r.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  sm: {
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: r.pill,
    gap: 6,
  },
  pill: {
    borderRadius: r.pill,
  },
  label: {
    fontFamily: font.semi,
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
    textAlign: 'center',
    flexShrink: 1,
  },
  labelSm: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
