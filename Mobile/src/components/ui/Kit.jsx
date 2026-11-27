import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Animated,
  Image,
  Modal,
} from 'react-native';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays, ChevronRight, CircleAlert, CircleCheck, Info, Leaf, Search, X } from 'lucide-react-native';
import { c, font, r, sh } from '../../styles/theme';
import { initialsOf, today, validDate } from '../../styles/content.mjs';
import { imgUrl } from '../../api/client';
import { Header } from './Header';
import { Button } from './Button';

export function Frame({ title, subtitle, back, action, keyboard, tab, children }) {
  return (
    <SafeAreaView edges={tab ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']} style={ui.frame}>
      {title ? <Header title={title} subtitle={subtitle} onBack={back} rightAction={action} /> : null}
      {keyboard && Platform.OS !== 'web' ? (
        <KeyboardAvoidingView automaticOffset behavior="padding" style={ui.fill}>
          {children}
        </KeyboardAvoidingView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
}

export function Page({ title, subtitle, back, action, tab, keyboard, footer, children, contentStyle, ...props }) {
  const Scroll = keyboard ? FormScroll : ScrollView;
  return (
    <Frame title={title} subtitle={subtitle} back={back} action={action} tab={tab}>
      <Scroll keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[ui.content, contentStyle]} {...props}>
        {children}
      </Scroll>
      {footer}
    </Frame>
  );
}

export function FormScroll({ ref, ...props }) {
  if (Platform.OS === 'web') return <ScrollView ref={ref} {...props} />;
  return (
    <KeyboardAwareScrollView
      ref={ref}
      bottomOffset={22}
      disableScrollOnKeyboardHide
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
}

// Editorial Title on paper — Lora Serif, NO uppercase tracked SaaS eyebrow
export function Title({ title, detail, eyebrow, right }) {
  return (
    <View style={ui.between}>
      <View style={[ui.group, ui.fill]}>
        {eyebrow ? <Text style={ui.kicker}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" style={ui.hero}>
          {title}
        </Text>
        {detail ? <Text style={ui.body}>{detail}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function SectionHeader({ title, detail, actionLabel, onAction, count }) {
  return (
    <View style={ui.between}>
      <View style={ui.fill}>
        <Text accessibilityRole="header" style={ui.h2}>
          {title}
        </Text>
        {detail ? <Text style={ui.small}>{detail}</Text> : null}
      </View>
      {count != null ? <Text style={ui.countText}>{count}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onAction} style={ui.linkBtn}>
          <Text style={ui.linkText}>{actionLabel}</Text>
          <ChevronRight size={14} color={c.terracotta} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  trailing,
  placeholder = 'Tìm kiếm…',
  label = 'Tìm kiếm',
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[ui.searchWrap, focused && ui.searchFocused]}>
      <Search size={17} color={focused ? c.ink : c.muted} strokeWidth={1.9} />
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor={c.subtle}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        selectionColor={c.terracotta}
        returnKeyType="search"
        style={ui.searchInput}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Xóa từ khóa"
          hitSlop={10}
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          style={ui.clearBtn}
        >
          <X size={14} color={c.inkSoft} strokeWidth={2.1} />
        </Pressable>
      ) : null}
      {trailing}
    </View>
  );
}

export function SegmentedControl({ options, value, onChange, disabled }) {
  return (
    <View style={ui.segmentTrack} accessibilityRole="tablist">
      {options.map(([key, label]) => {
        const active = value === key;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled: !!disabled }}
            disabled={disabled}
            onPress={() => onChange(key)}
            style={[ui.segmentItem, active && ui.segmentActive]}
          >
            <Text style={[ui.segmentLabel, active && ui.segmentLabelActive]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Strict Semantic Badge: 'done' = Lime, 'alert'/'warm' = Turmeric, others = calm paper/ink
export function Badge({ label, tone = 'neutral', icon: Icon }) {
  const palette = {
    neutral: { bg: c.surfaceMuted, ink: c.inkSoft },
    done: { bg: c.lime, ink: c.ink },
    lime: { bg: c.lime, ink: c.ink },
    primary: { bg: c.ink, ink: '#FFFEFA' },
    soft: { bg: c.primaryLight, ink: c.ink },
    warm: { bg: c.turmericBg, ink: '#7D5110' },
    alert: { bg: c.turmericBg, ink: '#7D5110' },
    error: { bg: c.errorBg, ink: c.error },
    success: { bg: c.lime, ink: c.ink },
  }[tone] || { bg: c.surfaceMuted, ink: c.inkSoft };

  return (
    <View style={[ui.badge, { backgroundColor: palette.bg }]}>
      {Icon ? <Icon size={12} color={palette.ink} strokeWidth={2} /> : null}
      <Text style={[ui.badgeLabel, { color: palette.ink }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function Notice({ children, error = false, success = false, warning = false }) {
  if (!children) return null;
  const isWarn = warning || (!error && !success && /B12|sắt|đạm|hết hạn|đã qua/i.test(String(children)));
  const Icon = error ? CircleAlert : success ? CircleCheck : Info;
  const ink = error ? c.error : success ? c.success : isWarn ? '#784E0E' : c.inkSoft;
  return (
    <View
      accessible
      accessibilityRole={error ? 'alert' : 'text'}
      accessibilityLiveRegion="polite"
      style={[
        ui.notice,
        error && ui.error,
        success && ui.noticeSuccess,
        isWarn && ui.noticeTurmeric,
      ]}
    >
      <Icon size={17} color={ink} strokeWidth={1.9} style={{ marginTop: 1 }} />
      <Text style={[ui.noticeText, { color: ink }]}>{children}</Text>
    </View>
  );
}

export function Pending({ label = 'Đang tải…' }) {
  return (
    <View accessible accessibilityLiveRegion="polite" accessibilityLabel={label} style={ui.pending}>
      <ActivityIndicator color={c.terracotta} size="small" />
      <Text style={ui.body}>{label}</Text>
    </View>
  );
}

export function SkeletonList({ count = 3 }) {
  const pulse = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.85, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.45, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={{ gap: 14 }} accessible accessibilityLabel="Đang tải nội dung">
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View key={index} style={[ui.skeletonRow, { opacity: pulse }]}>
          <View style={[ui.skeletonLine, { width: '32%', height: 10 }]} />
          <View style={[ui.skeletonLine, { width: '78%', height: 17 }]} />
          <View style={[ui.skeletonLine, { width: '48%', height: 12 }]} />
        </Animated.View>
      ))}
    </View>
  );
}

export function Empty({ title, detail, icon: Icon = Leaf, children }) {
  return (
    <View style={ui.empty}>
      <Icon color={c.muted} size={24} strokeWidth={1.6} />
      <Text accessibilityRole="header" style={[ui.h2, { textAlign: 'center' }]}>
        {title}
      </Text>
      {detail ? <Text style={[ui.body, { textAlign: 'center', maxWidth: 310 }]}>{detail}</Text> : null}
      {children ? <View style={{ width: '100%', gap: 10, marginTop: 6 }}>{children}</View> : null}
    </View>
  );
}

export function GuestGate({ navigation, title, detail, icon }) {
  return (
    <Empty title={title} detail={detail} icon={icon}>
      <Button title="Đăng nhập" onPress={() => navigation.navigate('Login')} />
      <Button title="Tạo tài khoản mới" variant="outline" onPress={() => navigation.navigate('Register')} />
    </Empty>
  );
}

export function QueryState({ query, skeletonCount = 0, children }) {
  if (query.isPending) {
    return skeletonCount > 0 ? <SkeletonList count={skeletonCount} /> : <Pending />;
  }
  if (query.isError && (query.data === undefined || [401, 403, 404].includes(query.error.status))) {
    return (
      <Empty title="Chưa tải được dữ liệu" detail={query.error.message} icon={CircleAlert}>
        <Button title="Thử lại" variant="secondary" onPress={() => query.refetch()} />
      </Empty>
    );
  }
  return (
    <>
      {query.isError ? (
        <View style={ui.group}>
          <Notice error>Chưa cập nhật được dữ liệu mới. Đang hiển thị bản tải trước.</Notice>
          <Button title="Tải lại" variant="outline" size="sm" onPress={() => query.refetch()} />
        </View>
      ) : null}
      {children}
    </>
  );
}

export function Field({ label, hint, rightAction, style, onFocus, onBlur, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={ui.group}>
      <View style={ui.between}>
        <Text style={ui.label}>{label}</Text>
        {hint ? <Text style={ui.small}>{hint}</Text> : null}
      </View>
      <View style={[ui.fieldBox, props.multiline && ui.multilineBox, focused && ui.focused]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={c.subtle}
          onFocus={event => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={event => {
            setFocused(false);
            onBlur?.(event);
          }}
          selectionColor={c.terracotta}
          style={[ui.input, props.multiline && ui.multiline, style]}
          {...props}
        />
        {rightAction}
      </View>
    </View>
  );
}

/**
 * Native-feel Vietnamese Date Picker Modal (Day / Month / Year)
 * Replaces manual YYYY-MM-DD typing everywhere.
 */
export function DateField({
  label,
  value,
  onChange,
  minYear = 1925,
  maxYear = Number(today().slice(0, 4)) + 1,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const initial = validDate(value) ? value : today();
  const [y, setY] = useState(() => Number(initial.slice(0, 4)));
  const [m, setM] = useState(() => Number(initial.slice(5, 7)));
  const [d, setD] = useState(() => Number(initial.slice(8, 10)));
  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  const daysInMonth = useMemo(() => new Date(Date.UTC(y, m, 0)).getUTCDate(), [y, m]);
  const safeDay = Math.min(d, daysInMonth);

  const years = useMemo(() => {
    const arr = [];
    for (let yr = maxYear; yr >= minYear; yr--) arr.push(yr);
    return arr;
  }, [minYear, maxYear]);

  const openModal = () => {
    if (disabled) return;
    const base = validDate(value) ? value : '2000-06-15';
    const nextY = Number(base.slice(0, 4));
    const nextM = Number(base.slice(5, 7));
    const nextD = Number(base.slice(8, 10));
    setY(nextY);
    setM(nextM);
    setD(nextD);
    setOpen(true);
    setTimeout(() => {
      const yrIdx = Math.max(0, years.indexOf(nextY));
      dayRef.current?.scrollTo({ y: Math.max(0, (nextD - 3) * 38), animated: false });
      monthRef.current?.scrollTo({ y: Math.max(0, (nextM - 3) * 38), animated: false });
      yearRef.current?.scrollTo({ y: Math.max(0, (yrIdx - 2) * 38), animated: false });
    }, 60);
  };

  const formattedDisplay = validDate(value)
    ? `${value.slice(8, 10)} / ${value.slice(5, 7)} / ${value.slice(0, 4)}`
    : 'Chọn ngày, tháng, năm';

  return (
    <View style={ui.group}>
      {label ? <Text style={ui.label}>{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label || 'Chọn ngày'}
        disabled={disabled}
        onPress={openModal}
        style={[ui.fieldBox, disabled && { opacity: 0.5 }]}
      >
        <Text style={[ui.dateText, !validDate(value) && { color: c.subtle }]}>{formattedDisplay}</Text>
        <CalendarDays size={18} color={c.muted} strokeWidth={1.8} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={ui.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={ui.modalSheet} onPress={() => {}}>
            <View style={ui.between}>
              <Text style={ui.h2}>{label || 'Chọn ngày'}</Text>
              <Pressable hitSlop={8} onPress={() => setOpen(false)}>
                <X size={20} color={c.muted} />
              </Pressable>
            </View>

            <View style={ui.pickerCols}>
              {/* Day Column */}
              <View style={ui.pickerCol}>
                <Text style={ui.small}>Ngày</Text>
                <ScrollView ref={dayRef} style={ui.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(dayNum => (
                    <Pressable
                      key={dayNum}
                      onPress={() => setD(dayNum)}
                      style={[ui.pickerOption, safeDay === dayNum && ui.pickerOptionActive]}
                    >
                      <Text style={[ui.pickerOptionText, safeDay === dayNum && ui.pickerOptionTextActive]}>
                        {String(dayNum).padStart(2, '0')}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Month Column */}
              <View style={ui.pickerCol}>
                <Text style={ui.small}>Tháng</Text>
                <ScrollView ref={monthRef} style={ui.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => (
                    <Pressable
                      key={monthNum}
                      onPress={() => setM(monthNum)}
                      style={[ui.pickerOption, m === monthNum && ui.pickerOptionActive]}
                    >
                      <Text style={[ui.pickerOptionText, m === monthNum && ui.pickerOptionTextActive]}>
                        Thg {monthNum}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Year Column */}
              <View style={ui.pickerCol}>
                <Text style={ui.small}>Năm</Text>
                <ScrollView ref={yearRef} style={ui.pickerScroll} showsVerticalScrollIndicator={false}>
                  {years.map(yr => (
                    <Pressable
                      key={yr}
                      onPress={() => setY(yr)}
                      style={[ui.pickerOption, y === yr && ui.pickerOptionActive]}
                    >
                      <Text style={[ui.pickerOptionText, y === yr && ui.pickerOptionTextActive]}>
                        {yr}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Button
              title={`Chọn ${String(safeDay).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`}
              onPress={() => {
                const next = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
                onChange(next);
                setOpen(false);
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export function Chip({ label, selected = false, onPress, disabled, icon: Icon }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled}
      hitSlop={5}
      android_ripple={{ color: 'rgba(20,38,28,0.08)' }}
      onPress={onPress}
      style={({ pressed }) => [
        ui.chip,
        selected && ui.chipSelected,
        pressed && !disabled && { opacity: 0.82 },
        disabled && { opacity: 0.45 },
      ]}
    >
      {Icon ? <Icon size={14} color={selected ? '#FFFEFA' : c.muted} strokeWidth={1.9} /> : null}
      <Text style={[ui.chipLabel, selected && ui.chipLabelSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

// Flat frameless editorial row — NO pastel icon box, NO redundant subtitle bloat
export function RowLink({ label, detail, onPress, rightText, border = true }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: 'rgba(20,38,28,0.05)' }}
      onPress={onPress}
      style={({ pressed }) => [
        ui.rowLink,
        !border && { borderBottomWidth: 0 },
        pressed && { opacity: 0.68 },
      ]}
    >
      <View style={ui.fill}>
        <Text style={ui.rowLabel} numberOfLines={2}>
          {label}
        </Text>
        {detail ? (
          <Text style={ui.small} numberOfLines={1}>
            {detail}
          </Text>
        ) : null}
      </View>
      {rightText ? <Text style={ui.rowRightText}>{rightText}</Text> : null}
      <ChevronRight size={16} color={c.subtle} strokeWidth={1.8} />
    </Pressable>
  );
}

export function Avatar({ name, uri, size = 44, tone = 'paper' }) {
  const [failed, setFailed] = useState(false);
  const resolved = imgUrl(uri);
  const isGeneratedAvatar = resolved && /ui-avatars\.com/i.test(resolved);
  if (resolved && !isGeneratedAvatar && !failed) {
    return (
      <Image
        source={{ uri: resolved }}
        onError={() => setFailed(true)}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.surfaceMuted }}
      />
    );
  }
  const bg = tone === 'ink' ? c.ink : tone === 'terracotta' ? c.terracottaSoft : c.surfaceMuted;
  const ink = tone === 'ink' ? '#FFFEFA' : tone === 'terracotta' ? c.terracotta : c.ink;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.lineStrong,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: font.serifBold, fontSize: Math.round(size * 0.36), color: ink, includeFontPadding: false }}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}

export const ui = StyleSheet.create({
  frame: { flex: 1, backgroundColor: c.background },
  fill: { flex: 1, minWidth: 0 },
  content: {
    width: '100%',
    maxWidth: 660,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 34,
    gap: 16,
  },
  // Lora Serif Display Heading
  hero: {
    fontFamily: font.serifBold,
    fontSize: 27,
    lineHeight: 35,
    color: c.ink,
    letterSpacing: -0.3,
    includeFontPadding: false,
  },
  h2: {
    fontFamily: font.serifBold,
    fontSize: 19,
    lineHeight: 25,
    color: c.ink,
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
  h3: {
    fontFamily: font.serif,
    fontSize: 16.5,
    lineHeight: 23,
    color: c.ink,
    includeFontPadding: false,
  },
  label: {
    fontFamily: font.medium,
    fontSize: 14,
    lineHeight: 20,
    color: c.ink,
    includeFontPadding: false,
  },
  // Calm italic kicker instead of SaaS uppercase tracked eyebrow
  kicker: {
    fontFamily: font.serifItalic,
    fontSize: 13.5,
    lineHeight: 19,
    color: c.terracotta,
    includeFontPadding: false,
  },
  eyebrow: {
    fontFamily: font.medium,
    fontSize: 12,
    color: c.muted,
    includeFontPadding: false,
  },
  body: {
    fontFamily: font.regular,
    fontSize: 14.5,
    color: c.muted,
    lineHeight: 22,
    includeFontPadding: false,
  },
  small: {
    fontFamily: font.regular,
    fontSize: 12.5,
    color: c.muted,
    lineHeight: 18,
    includeFontPadding: false,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  group: { gap: 6 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.line },
  // Single elevated focal block per screen
  card: {
    backgroundColor: c.surfaceElevated,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
    padding: 16,
    gap: 12,
    ...sh.card,
  },
  // Flat paper section (zero card box)
  flatSection: {
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.line,
    gap: 10,
  },
  pending: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 13,
    backgroundColor: c.surface,
    borderLeftWidth: 3,
    borderLeftColor: c.primary,
    borderRadius: r.sm,
  },
  noticeTurmeric: {
    backgroundColor: c.turmericBg,
    borderLeftColor: c.turmeric,
  },
  noticeSuccess: {
    backgroundColor: c.limeSoft,
    borderLeftColor: c.success,
  },
  error: {
    backgroundColor: c.errorBg,
    borderLeftColor: c.error,
  },
  noticeText: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 13.5,
    lineHeight: 20,
    includeFontPadding: false,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 18,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  fieldBox: {
    minHeight: 48,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: r.sm,
    borderWidth: 1,
    borderColor: c.lineStrong,
    backgroundColor: c.surfaceElevated,
    paddingHorizontal: 13,
    gap: 8,
  },
  multilineBox: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    fontFamily: font.regular,
    color: c.ink,
    fontSize: 15,
    paddingVertical: 7,
    includeFontPadding: false,
    outlineStyle: 'none',
  },
  dateText: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 15,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  focused: {
    borderColor: c.terracotta,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingVertical: 2,
  },
  searchWrap: {
    minHeight: 46,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingLeft: 14,
    paddingRight: 7,
    borderRadius: r.pill,
    borderWidth: 1,
    borderColor: c.lineStrong,
    backgroundColor: c.surfaceElevated,
  },
  searchFocused: {
    borderColor: c.ink,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 42,
    fontFamily: font.regular,
    fontSize: 14.5,
    color: c.ink,
    paddingVertical: 7,
    includeFontPadding: false,
    outlineStyle: 'none',
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: c.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTrack: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: c.line,
    gap: 16,
  },
  segmentItem: {
    minHeight: 40,
    paddingBottom: 9,
    paddingHorizontal: 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    justifyContent: 'flex-end',
  },
  segmentActive: {
    borderBottomColor: c.ink,
  },
  segmentLabel: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 19,
    color: c.muted,
    includeFontPadding: false,
  },
  segmentLabelActive: {
    fontFamily: font.semi,
    color: c.ink,
  },
  chip: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: r.pill,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: c.lineStrong,
  },
  chipSelected: {
    backgroundColor: c.ink,
    borderColor: c.ink,
  },
  chipLabel: {
    fontFamily: font.regular,
    fontSize: 13,
    color: c.inkSoft,
    includeFontPadding: false,
  },
  chipLabelSelected: {
    fontFamily: font.medium,
    color: '#FFFEFA',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: r.pill,
  },
  badgeLabel: {
    fontFamily: font.medium,
    fontSize: 11.5,
    includeFontPadding: false,
  },
  countText: {
    fontFamily: font.regular,
    fontSize: 12.5,
    color: c.muted,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  linkText: {
    fontFamily: font.medium,
    fontSize: 13,
    color: c.terracotta,
    includeFontPadding: false,
  },
  rowLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  rowLabel: {
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 21,
    color: c.ink,
    includeFontPadding: false,
  },
  rowRightText: {
    fontFamily: font.medium,
    fontSize: 12.5,
    color: c.terracotta,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  skeletonRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
    gap: 8,
  },
  skeletonLine: {
    borderRadius: 4,
    backgroundColor: c.surfaceMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: c.background,
    borderTopLeftRadius: r.xl,
    borderTopRightRadius: r.xl,
    padding: 20,
    gap: 14,
  },
  pickerCols: {
    flexDirection: 'row',
    gap: 10,
    height: 200,
  },
  pickerCol: {
    flex: 1,
    gap: 6,
  },
  pickerScroll: {
    flex: 1,
    backgroundColor: c.surfaceElevated,
    borderRadius: r.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.lineStrong,
  },
  pickerOption: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickerOptionActive: {
    backgroundColor: c.ink,
  },
  pickerOptionText: {
    fontFamily: font.regular,
    fontSize: 14,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  pickerOptionTextActive: {
    fontFamily: font.semi,
    color: '#FFFEFA',
  },
});
