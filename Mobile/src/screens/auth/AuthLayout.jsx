import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BowlChopsticksIcon } from '../../components/ui/Gauges';
import { Badge, Notice, Page, ui } from '../../components/ui/Kit';
import { c, font } from '../../styles/theme';

export function AuthLayout({ navigation, title, detail, step, error, children, footer }) {
  return (
    <Page title="VeggieAI" back={navigation.goBack} keyboard>
      <View style={s.heading}>
        <View style={s.brandRow}>
          <View style={s.mark}><BowlChopsticksIcon size={23} color={c.primary} strokeWidth={1.9} /></View>
          {step ? <Badge label={step} tone="neutral" /> : null}
        </View>
        <Text accessibilityRole="header" style={s.title}>
          {title}
        </Text>
        {detail ? <Text style={ui.body}>{detail}</Text> : null}
      </View>

      <Notice error>{error}</Notice>
      <View style={ui.card}>{children}</View>
      {footer}
    </Page>
  );
}

const s = StyleSheet.create({
  heading: {
    gap: 10,
    paddingTop: 4,
    paddingBottom: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primaryLight,
  },
  title: {
    fontFamily: font.serifBold,
    fontSize: 28,
    lineHeight: 36,
    color: c.ink,
    letterSpacing: -0.3,
    includeFontPadding: false,
  },
});
