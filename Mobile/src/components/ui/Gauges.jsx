import React, { useId } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';
import { Check } from 'lucide-react-native';
import { c, font, mealTones, r } from '../../styles/theme';
import { mealNames, number, nutrientRatio } from '../../styles/content.mjs';

// Bespoke VeggieAI icon: Ceramic Bowl & Chopsticks (replaces generic AI Sparkles everywhere)
export function BowlChopsticksIcon({ size = 20, color = c.ink, strokeWidth = 1.8 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12.5h16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path
        d="M5 12.5c0 4.2 3.1 7 7 7s7-2.8 7-7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path d="M9.5 19.8h5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="7" y1="5.2" x2="19" y2="3.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="7" y1="8.4" x2="19" y2="6.8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function BrandArt({ size = 120, color = c.primary, opacity = 1, style }) {
  return (
    <View pointerEvents="none" style={[{ width: size, height: size, opacity }, style]} importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 520 520" fill="none">
        <Circle cx="260" cy="260" r="228" stroke={color} strokeOpacity={0.14} strokeWidth={3} />
        <Circle cx="260" cy="260" r="184" fill={color} fillOpacity={0.05} />
        <Path
          d="M88 418C132 364 152 323 168 248M166 253C194 215 227 186 280 170"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <G fill={color}>
          <Path d="M165 281c-52-3-76-30-77-70 44 0 75 21 77 70Z" />
          <Path d="M172 246c-2-46 21-73 63-81 5 41-16 71-63 81Z" />
          <Path d="M142 333c-43-2-66-21-70-58 41-2 65 17 70 58Z" />
        </G>
      </Svg>
    </View>
  );
}

/**
 * Signature Motif: "Bát Năng Lượng" (Vietnamese Ceramic Bowl Gauge)
 * Used consistently across HomeScreen & NutritionScreen.
 * When value === 0, displays a warm waiting ceramic bowl + target / next meal invitation instead of an empty 0% chart.
 */
export function CeramicBowlGauge({
  value = 0,
  target,
  proteinG,
  proteinTarget,
  carbG,
  fatG,
  nextMealTitle,
  compact = false,
  onPress,
}) {
  const clipId = useId();
  const numVal = Number(value) || 0;
  const hasTarget = target != null && Number(target) > 0;
  const pct = nutrientRatio(numVal, target) ?? 0;
  const empty = numVal <= 0;

  // Bowl interior height spans y=36 (rim) down to y=82 (bowl floor) -> 46 units
  const fillHeight = empty ? 0 : Math.max(8, Math.round((pct / 100) * 46));
  const fillY = 82 - fillHeight;
  const bowlW = compact ? 88 : 108;
  const bowlH = compact ? 74 : 90;

  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      accessible
      accessibilityRole={onPress ? 'button' : 'progressbar'}
      accessibilityLabel={
        empty
          ? `Chưa ghi nhận bữa ăn hôm nay${hasTarget ? `, mục tiêu ${number(target, 'kcal')}` : ''}`
          : `Đã ghi nhận ${number(numVal, 'kcal')}${hasTarget ? ` trên ${number(target, 'kcal')}` : ''}`
      }
      style={s.bowlRow}
    >
      {/* Handcrafted SVG Ceramic Bowl */}
      <View style={{ width: bowlW, height: bowlH, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={bowlW} height={bowlH} viewBox="0 0 120 100" fill="none">
          <Defs>
            <ClipPath id={clipId}>
              <Path d="M16 36 C16 66, 36 82, 60 82 C84 82, 104 66, 104 36 Z" />
            </ClipPath>
          </Defs>

          {/* Gentle steam wisps */}
          <Path
            d="M45 24 C43 18, 48 15, 46 9"
            stroke={empty ? c.lineStrong : c.terracotta}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={empty ? 0.55 : 0.7}
          />
          <Path
            d="M62 22 C60 15, 65 12, 63 6"
            stroke={empty ? c.lineStrong : c.primary}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={empty ? 0.45 : 0.65}
          />
          <Path
            d="M78 25 C76 19, 81 16, 79 11"
            stroke={empty ? c.lineStrong : '#C89B3C'}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={empty ? 0.4 : 0.6}
          />

          {/* Ceramic interior background */}
          <Path d="M16 36 C16 66, 36 82, 60 82 C84 82, 104 66, 104 36 Z" fill="#EFE9DC" />

          {/* Layered meal fills inside bowl when meals are logged */}
          {!empty ? (
            <G clipPath={`url(#${clipId})`}>
              <Rect x="12" y={fillY} width="96" height={fillHeight + 4} fill="#DFB056" />
              {pct > 30 ? (
                <Rect x="12" y={fillY + Math.round(fillHeight * 0.36)} width="96" height={fillHeight} fill="#C46D45" opacity={0.88} />
              ) : null}
              {pct > 65 ? (
                <Rect x="12" y={fillY + Math.round(fillHeight * 0.68)} width="96" height={fillHeight} fill="#356849" opacity={0.9} />
              ) : null}
            </G>
          ) : null}

          {/* Decorative ceramic glaze band */}
          <Path
            d="M22 52 C38 56, 82 56, 98 52"
            stroke={c.terracotta}
            strokeOpacity={0.32}
            strokeWidth={1.8}
            strokeDasharray="4 4"
          />

          {/* Bowl outline & rim */}
          <Path
            d="M14 36 L106 36"
            stroke={c.ink}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <Path
            d="M16 36 C16 66, 36 82, 60 82 C84 82, 104 66, 104 36"
            stroke={c.ink}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          {/* Bowl ceramic foot (đế bát) */}
          <Path
            d="M42 83 L45 90 L75 90 L78 83"
            stroke={c.ink}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#EAE2D2"
          />
        </Svg>
      </View>

      {/* Editorial Right Column */}
      <View style={s.bowlCopy}>
        {empty ? (
          <>
            <Text style={s.waitingTitle}>
              {nextMealTitle ? `Sắp tới: ${nextMealTitle}` : 'Chưa ghi bữa'}
            </Text>
            <Text style={s.waitingSub}>
              {hasTarget
                ? `Mục tiêu ${number(target, 'kcal')}${!compact && proteinTarget > 0 ? ` · ${number(proteinTarget, 'g')} đạm` : ''}`
                : 'Ghi nhận bữa ăn đầu tiên để theo dõi năng lượng & vi chất.'}
            </Text>
          </>
        ) : (
          <>
            <View style={s.kcalBaseline}>
              <Text style={s.kcalBig}>{number(numVal)}</Text>
              <Text style={s.kcalTargetText}>
                {hasTarget ? `/ ${number(target)} kcal` : 'kcal đã nạp'}
              </Text>
            </View>
            <Text style={s.macroInline} numberOfLines={1}>
              Đạm {number(proteinG, 'g')}
              {proteinTarget > 0 ? `/${number(proteinTarget, 'g')}` : ''}
              {'  ·  '}Tinh bột {number(carbG, 'g')}
              {'  ·  '}Béo {number(fatG, 'g')}
            </Text>
          </>
        )}
      </View>
    </Wrapper>
  );
}

// Keep EnergyGauge alias pointing to CeramicBowlGauge so every screen uses ONE unified motif
export const EnergyGauge = CeramicBowlGauge;

/**
 * Signature Motif: "Mâm Ba Bữa" (Sáng · Trưa · Tối Horizontal Axis)
 */
export function MealTrayAxis({ meals = [], logged = new Set(), onOpenRecipe, onToggleLog, onOpenPlanner, busyId }) {
  const slots = [
    ['breakfast', 'Sáng'],
    ['lunch', 'Trưa'],
    ['dinner', 'Tối'],
  ];

  const byType = {};
  for (const m of meals) {
    if (!byType[m.mealType]) byType[m.mealType] = m;
  }

  if (!meals.length) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onOpenPlanner}
        style={s.emptyTray}
      >
        <View style={s.emptyTrayDots}>
          {slots.map(([key, label]) => (
            <View key={key} style={s.emptySlot}>
              <View style={[s.slotDot, { backgroundColor: mealTones[key].fill }]} />
              <Text style={s.slotTime}>{label}</Text>
            </View>
          ))}
        </View>
        <Text style={s.emptyTrayAction}>Lên thực đơn</Text>
      </Pressable>
    );
  }

  return (
    <View style={s.trayGrid}>
      {slots.map(([key, label], idx) => {
        const meal = byType[key];
        const done = meal && logged.has(String(meal.id));
        const tone = mealTones[key];
        const loadingThis = meal && busyId === meal.id;

        return (
          <View
            key={key}
            style={[
              s.trayCell,
              idx < slots.length - 1 && s.trayDivider,
              done && s.trayCellDone,
            ]}
          >
            <View style={s.trayCellTop}>
              <View style={[s.slotDot, { backgroundColor: tone.fill }]} />
              <Text style={s.slotTime}>{label}</Text>
              {meal && onToggleLog ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={done ? `${label} đã ăn` : `Đánh dấu đã ăn bữa ${label}`}
                  hitSlop={8}
                  disabled={done || !!busyId}
                  onPress={() => onToggleLog(meal)}
                  style={[s.checkCircle, done && s.checkCircleDone]}
                >
                  {done ? (
                    <Check size={11} color={c.ink} strokeWidth={2.6} />
                  ) : (
                    <Text style={s.plusMark}>{loadingThis ? '…' : '+'}</Text>
                  )}
                </Pressable>
              ) : null}
            </View>

            {meal ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => onOpenRecipe?.(meal.recipeId)}
                style={{ gap: 2 }}
              >
                <Text style={s.trayDish} numberOfLines={2}>
                  {meal.recipeTitle}
                </Text>
                <Text style={s.trayKcal}>{number(meal.nutrition?.kcal, 'kcal')}</Text>
              </Pressable>
            ) : (
              <Pressable onPress={onOpenPlanner}>
                <Text style={s.trayEmptyText}>Chưa xếp món</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

export function MacroBar({ label, value, target, unit = 'g', tone = c.primary }) {
  const pct = nutrientRatio(value, target);
  const hasTarget = target != null && Number(target) > 0;
  return (
    <View style={s.macroItem}>
      <Text style={s.macroLabel} numberOfLines={1}>{label}</Text>
      <Text style={s.macroValue} numberOfLines={1}>
        {number(value)}
        <Text style={s.macroUnit}>{hasTarget ? ` / ${number(target, unit)}` : ` ${unit}`}</Text>
      </Text>
      <View style={s.macroTrack}>
        {pct != null && pct > 0 ? (
          <View style={[s.macroFill, { width: `${Math.max(8, pct)}%`, backgroundColor: tone }]} />
        ) : null}
      </View>
    </View>
  );
}

export function StepProgress({ current = 0, total = 1, label }) {
  const safeTotal = Math.max(1, total);
  const pct = Math.max(0, Math.min(100, Math.round((current / safeTotal) * 100)));
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <View style={s.stepRow}>
          <Text style={s.stepLabel}>{label}</Text>
          <Text style={s.stepCount}>{current}/{total}</Text>
        </View>
      ) : null}
      <View style={s.stepTrack}>
        <View style={[s.stepFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bowlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bowlCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  waitingTitle: {
    fontFamily: font.serifBold,
    fontSize: 17.5,
    lineHeight: 24,
    color: c.ink,
    includeFontPadding: false,
  },
  waitingSub: {
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 19,
    color: c.muted,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  kcalBaseline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
  },
  kcalBig: {
    fontFamily: font.regular,
    fontSize: 30,
    lineHeight: 35,
    color: c.ink,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  kcalTargetText: {
    fontFamily: font.regular,
    fontSize: 13.5,
    color: c.muted,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  macroInline: {
    fontFamily: font.regular,
    fontSize: 12.5,
    color: c.muted,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  emptyTray: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.line,
  },
  emptyTrayDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptySlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  emptyTrayAction: {
    fontFamily: font.semi,
    fontSize: 13,
    color: c.terracotta,
    includeFontPadding: false,
  },
  trayGrid: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.line,
  },
  trayCell: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
    borderRadius: r.sm,
  },
  trayCellDone: {
    backgroundColor: c.limeSoft,
  },
  trayDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: c.line,
  },
  trayCellTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  slotDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  slotTime: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: 11.5,
    color: c.muted,
    includeFontPadding: false,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.lineStrong,
    backgroundColor: c.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: c.lime,
    borderColor: c.lime,
  },
  plusMark: {
    fontFamily: font.medium,
    fontSize: 12,
    lineHeight: 14,
    color: c.inkSoft,
    includeFontPadding: false,
  },
  trayDish: {
    fontFamily: font.serif,
    fontSize: 13.5,
    lineHeight: 18,
    color: c.ink,
    includeFontPadding: false,
  },
  trayKcal: {
    fontFamily: font.regular,
    fontSize: 11,
    color: c.muted,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  trayEmptyText: {
    fontFamily: font.serifItalic,
    fontSize: 12.5,
    color: c.subtle,
    includeFontPadding: false,
  },
  macroItem: { flex: 1, minWidth: 82, gap: 5 },
  macroLabel: { fontFamily: font.regular, fontSize: 12, color: c.muted, includeFontPadding: false },
  macroValue: {
    fontFamily: font.regular,
    fontSize: 13.5,
    color: c.ink,
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
  macroUnit: { fontFamily: font.regular, fontSize: 11.5, color: c.muted },
  macroTrack: { height: 4.5, borderRadius: r.pill, backgroundColor: c.gaugeTrack, overflow: 'hidden' },
  macroFill: { height: '100%', borderRadius: r.pill },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepLabel: { fontFamily: font.regular, fontSize: 12.5, color: c.muted, includeFontPadding: false },
  stepCount: {
    fontFamily: font.medium,
    fontSize: 12.5,
    color: c.ink,
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
  stepTrack: { height: 5, borderRadius: r.pill, backgroundColor: c.surfaceMuted, overflow: 'hidden' },
  stepFill: { height: '100%', borderRadius: r.pill, backgroundColor: c.terracotta },
});
