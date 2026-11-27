import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CalendarDays, ChevronLeft, ChevronRight, Flame, Footprints, Trash2, X } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mealPlanService } from '../../api/services/mealPlanService';
import { apiRequest, writeJson } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/Header';
import { CeramicBowlGauge, MacroBar } from '../../components/ui/Gauges';
import {
  Chip,
  Field,
  Notice,
  Page,
  QueryState,
  SectionHeader,
  ui,
} from '../../components/ui/Kit';
import { c, font, mealTones, r, sh } from '../../styles/theme';
import { addDays, fullViDate, mealNames, number, today, validDate } from '../../styles/content.mjs';

export function NutritionScreen({ route, navigation }) {
  const currentToday = today();
  const [date, setDate] = useState(route.params?.date || currentToday);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState('');

  const curYear = Number(currentToday.slice(0, 4));
  const [y, setY] = useState(() => Number(date.slice(0, 4)));
  const [m, setM] = useState(() => Number(date.slice(5, 7)));
  const [d, setD] = useState(() => Number(date.slice(8, 10)));

  const daysInMonth = useMemo(() => new Date(Date.UTC(y, m, 0)).getUTCDate(), [y, m]);
  const safeDay = Math.min(d, daysInMonth);
  const years = useMemo(() => [curYear, curYear - 1, curYear - 2], [curYear]);

  const query = useQuery({
    queryKey: ['diary', date],
    queryFn: ({ signal }) => mealPlanService.daily(date, signal),
  });

  const goDay = delta => {
    const next = addDays(date, delta);
    if (next && next <= currentToday) {
      setError('');
      setDate(next);
    }
  };

  const openPicker = () => {
    const base = validDate(date) ? date : currentToday;
    setY(Number(base.slice(0, 4)));
    setM(Number(base.slice(5, 7)));
    setD(Number(base.slice(8, 10)));
    setPickerOpen(true);
  };

  return (
    <Page title="Nhật ký dinh dưỡng" back={navigation.goBack} keyboard>
      {/* 1-Tap Date Bar with Native-Feel Picker Modal */}
      <View style={s.dateBar}>
        <IconButton
          label="Ngày trước"
          icon={ChevronLeft}
          tone="plain"
          size={38}
          onPress={() => goDay(-1)}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chọn ngày nhật ký"
          onPress={openPicker}
          style={s.dateCenter}
        >
          <CalendarDays size={15} color={c.terracotta} strokeWidth={1.9} />
          <Text style={s.dateTitle} numberOfLines={1}>
            {date === currentToday ? 'Hôm nay · ' : ''}
            {fullViDate(date)}
          </Text>
        </Pressable>
        <IconButton
          label="Ngày tiếp theo"
          icon={ChevronRight}
          tone="plain"
          size={38}
          disabled={date >= currentToday}
          onPress={() => goDay(1)}
        />
      </View>

      {date !== currentToday ? (
        <View style={{ alignItems: 'center' }}>
          <Chip
            label="Quay về hôm nay"
            selected
            onPress={() => {
              setError('');
              setDate(currentToday);
            }}
          />
        </View>
      ) : null}

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={s.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={s.modalSheet} onPress={() => {}}>
            <View style={ui.between}>
              <Text style={ui.h2}>Chọn ngày nhật ký</Text>
              <Pressable hitSlop={8} onPress={() => setPickerOpen(false)}>
                <X size={20} color={c.muted} />
              </Pressable>
            </View>

            <View style={s.pickerCols}>
              <View style={s.pickerCol}>
                <Text style={ui.small}>Ngày</Text>
                <ScrollView style={s.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(dayNum => (
                    <Pressable
                      key={dayNum}
                      onPress={() => setD(dayNum)}
                      style={[s.pickerOpt, safeDay === dayNum && s.pickerOptActive]}
                    >
                      <Text style={[s.pickerOptText, safeDay === dayNum && s.pickerOptTextActive]}>
                        {String(dayNum).padStart(2, '0')}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={s.pickerCol}>
                <Text style={ui.small}>Tháng</Text>
                <ScrollView style={s.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => (
                    <Pressable
                      key={monthNum}
                      onPress={() => setM(monthNum)}
                      style={[s.pickerOpt, m === monthNum && s.pickerOptActive]}
                    >
                      <Text style={[s.pickerOptText, m === monthNum && s.pickerOptTextActive]}>
                        Thg {monthNum}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={s.pickerCol}>
                <Text style={ui.small}>Năm</Text>
                <ScrollView style={s.pickerScroll} showsVerticalScrollIndicator={false}>
                  {years.map(yr => (
                    <Pressable
                      key={yr}
                      onPress={() => setY(yr)}
                      style={[s.pickerOpt, y === yr && s.pickerOptActive]}
                    >
                      <Text style={[s.pickerOptText, y === yr && s.pickerOptTextActive]}>{yr}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Button
              title={`Xem ngày ${String(safeDay).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`}
              onPress={() => {
                const candidate = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
                if (candidate > currentToday) {
                  setError('Chưa thể xem nhật ký của ngày tương lai.');
                  setPickerOpen(false);
                  return;
                }
                setError('');
                setDate(candidate);
                setPickerOpen(false);
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Notice error>{error}</Notice>

      <QueryState query={query} skeletonCount={3}>
        {query.data ? <Diary key={date} date={date} data={query.data} /> : null}
      </QueryState>
    </Page>
  );
}

function Diary({ date, data }) {
  const [steps, setSteps] = useState(data.steps == null ? '' : String(data.steps));
  const [burned, setBurned] = useState(data.kcalBurned == null ? '' : String(data.kcalBurned));
  const [saved, setSaved] = useState('');
  const client = useQueryClient();

  const action = useMutation({
    mutationFn: ({ id }) => {
      if (id) return apiRequest('/nutrition/logs/' + id, { method: 'DELETE' });
      const energy = Number(String(burned).replace(',', '.'));
      if (
        !/^\d+$/.test(steps) ||
        Number(steps) > 200000 ||
        !String(burned).trim() ||
        !(energy >= 0 && energy <= 10000)
      ) {
        throw new Error('Nhập từ 0–200.000 bước chân và 0–10.000 kcal tiêu hao.');
      }
      return writeJson(
        '/nutrition/activity',
        { activityDate: date, steps: Number(steps), kcalBurned: energy },
        'PUT'
      );
    },
    onSuccess: async (_, { id }) => {
      setSaved(id ? 'Đã bỏ ghi nhận bữa ăn.' : 'Đã cập nhật chỉ số vận động.');
      await client.invalidateQueries({ queryKey: ['diary', date] });
    },
  });

  const consumed = data.consumed || {};
  const target = data.target || {};

  return (
    <>
      <Notice error>{action.error?.message}</Notice>
      <Notice success>{saved}</Notice>

      {/* Single Focal Surface: Unified Ceramic Bowl Gauge + Macros & Micronutrients */}
      <View style={ui.card}>
        <CeramicBowlGauge
          value={consumed.kcal ?? 0}
          target={target.kcal}
          proteinG={consumed.proteinG}
          proteinTarget={target.proteinG}
          carbG={consumed.carbG}
          fatG={consumed.fatG}
        />

        {data.kcalBurned > 0 || data.steps > 0 ? (
          <View style={s.netStrip}>
            <View style={ui.row}>
              <Footprints size={14} color={c.inkSoft} />
              <Text style={ui.small}>{number(data.steps, 'bước')}</Text>
            </View>
            <View style={ui.row}>
              <Flame size={14} color={c.terracotta} />
              <Text style={ui.small}>Tiêu hao {number(data.kcalBurned, 'kcal')}</Text>
            </View>
            {data.netKcal != null ? (
              <Text style={ui.label}>Thực nạp {number(data.netKcal, 'kcal')}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={s.macroRow}>
          <MacroBar label="Chất đạm" value={consumed.proteinG} target={target.proteinG} tone={c.terracotta} />
          <MacroBar label="Tinh bột" value={consumed.carbG} target={target.carbG} tone={c.primary} />
          <MacroBar label="Chất béo" value={consumed.fatG} target={target.fatG} tone="#8B7332" />
        </View>

        <View style={s.microStrip}>
          {[
            ['Sắt', 'ironMg', 'mg'],
            ['B12', 'b12Mcg', 'µg'],
            ['Canxi', 'calciumMg', 'mg'],
            ['Kẽm', 'zincMg', 'mg'],
          ].map(([label, key, unit], idx, arr) => (
            <View key={key} style={[s.microCell, idx < arr.length - 1 && s.microCellBorder]}>
              <Text style={ui.small}>{label}</Text>
              <Text style={s.microVal} numberOfLines={1}>
                {number(consumed[key], unit)}
              </Text>
              {target[key] > 0 ? (
                <Text style={s.microTarget} numberOfLines={1}>
                  /{number(target[key], unit)}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      {data.alerts?.map((alert, index) => (
        <Notice key={index} warning>
          {alert.message}
        </Notice>
      ))}

      {/* Flat Logged Meals Section on Paper */}
      <View style={ui.flatSection}>
        <SectionHeader
          title="Các bữa đã ghi nhận"
          count={data.logs?.length ? `${data.logs.length} bữa` : undefined}
        />
        {!data.logs?.length ? (
          <Text style={ui.body}>Chưa có bữa ăn nào được ghi nhận trong ngày này.</Text>
        ) : (
          <View>
            {data.logs.map((log, idx, arr) => {
              const tone = mealTones[log.mealType] || mealTones.lunch;
              return (
                <View key={log.id} style={[s.logRow, idx < arr.length - 1 && s.logDivider]}>
                  <View style={[s.mealDot, { backgroundColor: tone.fill }]} />
                  <View style={ui.fill}>
                    <Text style={ui.small}>
                      {mealNames[log.mealType] || 'Bữa ăn'} · {number(log.kcalConsumed, 'kcal')}
                      {log.servings ? ` · ${number(log.servings, 'phần')}` : ''}
                    </Text>
                    <Text style={s.dishTitle}>{log.recipeTitle}</Text>
                  </View>
                  <IconButton
                    label={'Bỏ ghi ' + log.recipeTitle}
                    icon={Trash2}
                    size={36}
                    tone="plain"
                    disabled={action.isPending}
                    onPress={() =>
                      Alert.alert('Bỏ ghi nhận bữa ăn?', log.recipeTitle, [
                        { text: 'Hủy', style: 'cancel' },
                        { text: 'Bỏ ghi', style: 'destructive', onPress: () => action.mutate({ id: log.id }) },
                      ])
                    }
                  />
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Flat Activity & Steps Section on Paper (Non-wrapping 4-column preset row) */}
      <View style={ui.flatSection}>
        <SectionHeader title="Vận động trong ngày" detail="Bước chân & năng lượng tiêu hao" />

        <View style={s.stepPresetRow}>
          {[3000, 5000, 8000, 10000].map(preset => {
            const active = Number(steps) === preset;
            return (
              <Pressable
                key={preset}
                accessibilityRole="button"
                accessibilityState={{ selected: active, disabled: action.isPending }}
                disabled={action.isPending}
                onPress={() => {
                  setSteps(String(preset));
                  if (!burned || Number(burned) === 0) setBurned(String(Math.round(preset * 0.04)));
                }}
                style={[s.stepPill, active && s.stepPillActive]}
              >
                <Text style={[s.stepPillText, active && s.stepPillTextActive]} numberOfLines={1}>
                  {preset / 1000}k bước
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={s.twoCols}>
          <View style={ui.fill}>
            <Field
              label="Số bước chân"
              inputMode="numeric"
              placeholder="0"
              value={steps}
              onChangeText={setSteps}
              editable={!action.isPending}
            />
          </View>
          <View style={ui.fill}>
            <Field
              label="Tiêu hao (kcal)"
              inputMode="decimal"
              placeholder="0"
              value={burned}
              onChangeText={setBurned}
              editable={!action.isPending}
            />
          </View>
        </View>
        <Button
          title="Lưu vận động"
          loading={action.isPending && !action.variables?.id}
          disabled={action.isPending}
          onPress={() => action.mutate({})}
        />
      </View>
    </>
  );
}

const s = StyleSheet.create({
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: r.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.lineStrong,
    backgroundColor: c.surfaceElevated,
  },
  dateCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  dateTitle: {
    fontFamily: font.semi,
    fontSize: 13.5,
    color: c.ink,
    textTransform: 'capitalize',
    includeFontPadding: false,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: 'center',
    padding: 20,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: c.surfaceElevated,
    borderRadius: r.xl,
    padding: 18,
    gap: 14,
    ...sh.float,
  },
  pickerCols: {
    flexDirection: 'row',
    gap: 8,
    height: 188,
  },
  pickerCol: {
    flex: 1,
    gap: 6,
  },
  pickerScroll: {
    flex: 1,
    borderRadius: r.sm,
    backgroundColor: c.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  pickerOpt: {
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOptActive: {
    backgroundColor: c.ink,
  },
  pickerOptText: {
    fontFamily: font.regular,
    fontSize: 14,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  pickerOptTextActive: {
    fontFamily: font.semi,
    color: '#FFFEFA',
  },
  netStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  microStrip: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.line,
  },
  microCell: {
    flex: 1,
    paddingHorizontal: 6,
    gap: 1,
  },
  microCellBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: c.line,
  },
  microVal: {
    fontFamily: font.semi,
    fontSize: 13.5,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  microTarget: {
    fontFamily: font.regular,
    fontSize: 11,
    color: c.muted,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  logDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
  },
  mealDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dishTitle: {
    fontFamily: font.serifBold,
    fontSize: 15.5,
    color: c.ink,
    includeFontPadding: false,
  },
  stepPresetRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepPill: {
    flex: 1,
    minWidth: 0,
    minHeight: 36,
    borderRadius: r.pill,
    borderWidth: 1,
    borderColor: c.lineStrong,
    backgroundColor: c.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  stepPillActive: {
    backgroundColor: c.ink,
    borderColor: c.ink,
  },
  stepPillText: {
    fontFamily: font.medium,
    fontSize: 12.5,
    color: c.inkSoft,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  stepPillTextActive: {
    color: '#FFFEFA',
    fontFamily: font.semi,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 10,
  },
});
