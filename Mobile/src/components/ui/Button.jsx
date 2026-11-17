import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../styles/theme';

export function Button({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  loading = false,
  disabled = false,
  icon: Icon,
  style,
  textStyle,
}) {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  let bg = theme.colors.primary;
  let textColor = '#ffffff';

  if (variant === 'secondary') {
    bg = theme.colors.primaryLight;
    textColor = theme.colors.primaryDark;
  } else if (isOutline) {
    bg = 'transparent';
    textColor = theme.colors.primary;
  } else if (isDanger) {
    bg = theme.colors.error;
    textColor = '#ffffff';
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: bg },
        isOutline && { borderWidth: 1.5, borderColor: theme.colors.primary },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {Icon && <Icon size={18} color={textColor} style={{ marginRight: 8 }} />}
          <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});
