import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowUpRight, CookingPot } from 'lucide-react-native';
import { imgUrl } from '../../api/client';
import { c } from '../../styles/theme';
import { categoryName, number } from '../../styles/content.mjs';
import { ui } from '../ui/Kit';

export function FoodImage({ uri, style, size = 26 }) {
  const [failed, setFailed] = useState(null);
  const source = imgUrl(uri);
  return source && failed !== source
    ? <Image source={{ uri: source }} style={[s.photo, style]} resizeMode="cover" onError={() => setFailed(source)} />
    : <View style={[s.photo, style, s.placeholder]}><CookingPot size={size} color={c.muted} strokeWidth={1.5} /></View>;
}

export function RecipeCard({ recipe, onPress, reason }) {
  if (!recipe?.title) return null;
  return <Pressable accessibilityRole="button" accessibilityLabel={'Xem công thức ' + recipe.title}
    style={({ pressed }) => [s.card, pressed && { opacity: 0.74 }]} onPress={() => onPress(recipe)}>
    <FoodImage uri={recipe.imageUrl} style={s.thumb} />
    <View style={ui.fill}>
      {!!recipe.category && <Text style={ui.small} numberOfLines={1}>{categoryName(recipe.category)}</Text>}
      <Text style={ui.label} numberOfLines={2}>{recipe.title}</Text>
      {!!reason && <Text style={ui.small}>{reason}</Text>}
      {recipe.kcalPerServing != null && <Text style={ui.small}>{number(recipe.kcalPerServing, 'kcal')} / phần</Text>}
    </View>
    <ArrowUpRight size={17} color={c.primary} />
  </Pressable>;
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 86, borderRadius: 16, padding: 9,
    borderWidth: 1, borderColor: c.line, backgroundColor: c.surface },
  photo: { backgroundColor: c.primaryLight },
  thumb: { width: 64, height: 64, borderRadius: 10 },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
});
