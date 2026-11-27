import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, ActivityIndicator, Platform, Pressable, StyleSheet } from 'react-native';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Leaf } from 'lucide-react-native';
import { c } from '../../styles/theme';
import { Header } from './Header';
import { Button } from './Button';

export function Frame({ title, back, action, keyboard, tab, children }) {
  return (
    <SafeAreaView edges={tab ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']} style={ui.frame}>
      {title && <Header title={title} onBack={back} rightAction={action} />}
      {keyboard && Platform.OS !== 'web'
        ? <KeyboardAvoidingView automaticOffset behavior="padding" style={ui.fill}>{children}</KeyboardAvoidingView>
        : children}
    </SafeAreaView>
  );
}

export function Page({ title, back, action, tab, keyboard, children, ...props }) {
  const Scroll = keyboard ? FormScroll : ScrollView;
  return <Frame {...{ title, back, action, tab }}>
    <Scroll keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content} {...props}>{children}</Scroll>
  </Frame>;
}

export function FormScroll({ ref, ...props }) {
  if (Platform.OS === 'web') return <ScrollView ref={ref} {...props} />;
  return <KeyboardAwareScrollView ref={ref} bottomOffset={18} disableScrollOnKeyboardHide
    keyboardDismissMode="on-drag" {...props} />;
}

export function Title({ title, detail, eyebrow }) {
  return <View style={ui.group}>
    {eyebrow && <Text style={ui.eyebrow}>{eyebrow}</Text>}
    <Text accessibilityRole="header" style={ui.hero}>{title}</Text>
    {detail && <Text style={ui.body}>{detail}</Text>}
  </View>;
}

export function Notice({ children, error = false }) {
  if (!children) return null;
  return <Text accessibilityRole={error ? 'alert' : 'text'} accessibilityLiveRegion="polite"
    style={[ui.notice, error && ui.error]}>{children}</Text>;
}

export function Pending({ label = 'Đang tải…' }) {
  return <View accessible accessibilityLiveRegion="polite" accessibilityLabel={label} style={ui.pending}>
    <ActivityIndicator color={c.primary} /><Text style={ui.body}>{label}</Text>
  </View>;
}

export function Empty({ title, detail, icon: Icon = Leaf, children }) {
  return <View style={[ui.card, ui.empty]}>
    <Icon color={c.primary} size={26} strokeWidth={1.6} />
    <Text accessibilityRole="header" style={ui.h2}>{title}</Text>
    {detail && <Text style={[ui.body, { textAlign: 'center' }]}>{detail}</Text>}
    {children}
  </View>;
}

export function GuestGate({ navigation, title, detail, icon }) {
  return <Empty {...{ title, detail, icon }}>
    <Button title="Đăng nhập" onPress={() => navigation.navigate('Login')} />
    <Button title="Tạo tài khoản" variant="outline" onPress={() => navigation.navigate('Register')} />
  </Empty>;
}

export function QueryState({ query, children }) {
  if (query.isPending) return <Pending />;
  if (query.isError && (query.data === undefined || [401, 403, 404].includes(query.error.status))) return <Empty title="Chưa tải được dữ liệu" detail={query.error.message}>
    <Button title="Thử lại" variant="secondary" onPress={() => query.refetch()} />
  </Empty>;
  return <>
    {query.isError && <View style={ui.group}>
      <Notice error>Chưa cập nhật được. Bạn đang xem dữ liệu của lần tải trước.</Notice>
      <Button title="Tải lại" variant="outline" onPress={() => query.refetch()} />
    </View>}
    {children}
  </>;
}

export function Field({ label, style, onFocus, onBlur, ...props }) {
  const [focused, setFocused] = useState(false);
  return <View style={ui.group}>
    <Text style={ui.label}>{label}</Text>
    <TextInput accessibilityLabel={label} placeholderTextColor={c.muted}
      onFocus={event => { setFocused(true); onFocus?.(event); }}
      onBlur={event => { setFocused(false); onBlur?.(event); }}
      selectionColor={c.primary} style={[ui.input, props.multiline && ui.multiline, focused && ui.focused, style]} {...props} />
  </View>;
}

export function Chip({ label, selected = false, onPress, disabled }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected, disabled: !!disabled }} disabled={disabled}
    onPress={onPress} style={[ui.chip, selected && ui.chipSelected, disabled && { opacity: 0.5 }]}>
    <Text style={ui.label}>{label}</Text>
  </Pressable>;
}

export function RowLink({ label, detail, icon: Icon, onPress }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({ pressed }) => [ui.rowLink, pressed && { backgroundColor: c.primaryLight }]}>
    {Icon && <Icon size={20} color={c.primary} strokeWidth={1.7} />}
    <View style={ui.fill}><Text style={ui.label}>{label}</Text>{detail && <Text style={ui.small}>{detail}</Text>}</View>
    <ChevronRight size={17} color={c.muted} />
  </Pressable>;
}

export const ui = StyleSheet.create({
  frame: { flex: 1, backgroundColor: c.background },
  fill: { flex: 1, minWidth: 0 },
  content: { width: '100%', maxWidth: 660, alignSelf: 'center', padding: 18, paddingBottom: 28, gap: 16 },
  hero: { fontFamily: 'serif', fontSize: 34, color: c.ink, fontWeight: '500', letterSpacing: -0.7 },
  h2: { fontSize: 20, fontWeight: '700', color: c.ink },
  label: { fontSize: 14, fontWeight: '600', color: c.ink },
  eyebrow: { fontSize: 11, letterSpacing: 1.4, fontWeight: '700', color: c.muted, textTransform: 'uppercase' },
  body: { fontSize: 15, color: c.muted, lineHeight: 22 },
  small: { fontSize: 12, color: c.muted, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  group: { gap: 6 },
  card: { backgroundColor: c.surface, borderRadius: 19, borderWidth: 1, borderColor: c.line, padding: 16, gap: 12 },
  pending: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  notice: { padding: 12, backgroundColor: c.primaryLight, color: c.ink, borderRadius: 12, fontSize: 14, lineHeight: 20 },
  error: { backgroundColor: c.errorBg, color: c.error },
  empty: { alignItems: 'center', padding: 24, gap: 12 },
  input: { minHeight: 50, borderRadius: 12, borderWidth: 1, borderColor: c.line,
    paddingHorizontal: 13, paddingVertical: 10, backgroundColor: c.surface, color: c.ink, fontSize: 16 },
  focused: { borderColor: c.primary },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  chip: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14,
    borderWidth: 1, borderColor: c.line, backgroundColor: c.surface },
  chipSelected: { backgroundColor: c.lime, borderColor: c.lime },
  rowLink: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 9,
    paddingHorizontal: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.line },
});
