import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, CookingPot } from 'lucide-react-native';
import { imgUrl } from '../../api/client';
import { c, categoryTones, font, r } from '../../styles/theme';
import { categoryName, initialsOf, number } from '../../styles/content.mjs';
import { ui } from '../ui/Kit';

function toneForCategory(category, categoryId) {
  const raw = String(category || '');
  const idx = Math.abs(Number(categoryId || raw.length || 0)) % categoryTones.length;
  return categoryTones[idx];
}

// Typographic monogram plate instead of clip-art pot/sun icons
export function FoodImage({ uri, title, category, categoryId, style }) {
  const [failed, setFailed] = useState(null);
  const source = imgUrl(uri);
  const tone = toneForCategory(category, categoryId);

  if (source && failed !== source) {
    return (
      <Image
        source={{ uri: source }}
        style={[s.photo, style]}
        resizeMode="cover"
        onError={() => setFailed(source)}
      />
    );
  }
  return (
    <View style={[s.photo, s.monogramBox, { backgroundColor: tone.bg, borderColor: tone.rule }, style]}>
      <Text style={[s.monogramChar, { color: tone.accent }]}>
        {initialsOf(title || categoryName(category) || 'Chay').slice(0, 1)}
      </Text>
    </View>
  );
}

/**
 * Editorial Recipe Card — Unified rhythm across photo & non-photo recipes.
 * Zero clip-art icons; suppresses duplicate stock photos automatically via `suppressPhoto`.
 */
export function RecipeCard({ recipe, onPress, reason, suppressPhoto = false }) {
  const [imgFailed, setImgFailed] = useState(null);
  if (!recipe?.title) return null;

  const source = suppressPhoto ? undefined : imgUrl(recipe.imageUrl);
  const hasPhoto = !!source && imgFailed !== source;
  const tone = toneForCategory(recipe.category, recipe.categoryId);
  const catLabel = recipe.category ? categoryName(recipe.category) : 'Món chay';
  const hasKcal = recipe.kcalPerServing != null && Number(recipe.kcalPerServing) > 0;
  const hasProtein = recipe.proteinG != null && Number(recipe.proteinG) > 0;

  const nutritionMeta = [];
  if (hasKcal) nutritionMeta.push(number(recipe.kcalPerServing, 'kcal'));
  if (hasProtein) nutritionMeta.push(`${number(recipe.proteinG, 'g')} đạm`);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={'Xem công thức ' + recipe.title}
      android_ripple={{ color: 'rgba(20,38,28,0.05)' }}
      onPress={() => onPress(recipe)}
      style={({ pressed }) => [s.editorialRow, pressed && s.pressed]}
    >
      {hasPhoto ? (
        <Image source={{ uri: source }} style={s.thumb} resizeMode="cover" onError={() => setImgFailed(source)} />
      ) : (
        <View style={[s.thumb, s.iconTile, { backgroundColor: tone.bg }]} importantForAccessibility="no-hide-descendants">
          <CookingPot size={23} color={tone.accent} strokeWidth={1.65} />
        </View>
      )}
      <View style={[ui.fill, { gap: 4 }]}>
        <Text style={[s.kicker, { color: tone.accent }]} numberOfLines={1}>
          {catLabel}
        </Text>
        <Text style={s.serifTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        {reason ? (
          <Text style={s.reasonText} numberOfLines={2}>
            {reason}
          </Text>
        ) : null}
        {nutritionMeta.length > 0 ? (
          <Text style={s.metaText} numberOfLines={1}>
            {nutritionMeta.join('  ·  ')}
          </Text>
        ) : null}
      </View>

      <ChevronRight size={16} color={c.muted} strokeWidth={1.8} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  photo: { backgroundColor: c.surfaceMuted },
  monogramBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  monogramChar: {
    fontFamily: font.serifBold,
    fontSize: 18,
    includeFontPadding: false,
  },
  pressed: { opacity: 0.78 },
  editorialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 10,
    borderRadius: r.md,
    backgroundColor: c.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  kicker: {
    fontFamily: font.medium,
    fontSize: 11.5,
    includeFontPadding: false,
  },
  serifTitle: {
    fontFamily: font.semi,
    fontSize: 15,
    lineHeight: 21,
    color: c.ink,
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
  reasonText: {
    fontFamily: font.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: c.muted,
    includeFontPadding: false,
  },
  metaText: {
    fontFamily: font.regular,
    fontSize: 12.5,
    color: c.muted,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
    marginTop: 1,
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: r.md,
    backgroundColor: c.surfaceMuted,
  },
  iconTile: { alignItems: 'center', justifyContent: 'center' },
});
