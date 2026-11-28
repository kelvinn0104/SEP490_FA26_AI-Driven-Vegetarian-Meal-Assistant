import React, { useCallback, useMemo, useState } from 'react';
import { BackHandler, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  CookingPot,
  Minus,
  Plus,
  RotateCcw,
  Square,
  SquareCheck,
} from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/Header';
import { Empty, Notice, Page, QueryState, SectionHeader, ui } from '../../components/ui/Kit';
import { StepProgress } from '../../components/ui/Gauges';
import { Readable } from '../../components/ui/Readable';
import { recipeService } from '../../api/services/recipeService';
import { imgUrl } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { c, font, r, sh } from '../../styles/theme';
import {
  categoryName,
  duplicateImageUrls,
  ingredientLabel,
  isDemo,
  listOf,
  number,
  parseSteps,
} from '../../styles/content.mjs';

const macros = [
  ['Năng lượng', 'kcalPerServing', 'kcal'],
  ['Đạm', 'proteinG', 'g'],
  ['Tinh bột', 'carbG', 'g'],
  ['Chất béo', 'fatG', 'g'],
];

const micronutrients = [
  ['Sắt', 'ironMg', 'mg'],
  ['Vitamin B12', 'b12Mcg', 'µg'],
  ['Canxi', 'calciumMg', 'mg'],
  ['Kẽm', 'zincMg', 'mg'],
];

export function RecipeDetailScreen({ route, navigation }) {
  const id = route.params?.recipeId;
  const client = useQueryClient();
  const signedIn = useAuthStore(state => !!state.token);

  const query = useQuery({
    queryKey: ['recipe', id],
    queryFn: ({ signal }) => recipeService.getRecipeById(id, signal),
    enabled: !!id,
  });

  // Check cached catalogue for duplicate stock images so we don't blow up a mismatched stock photo to 244px
  const allRecipes = client.getQueryData(['recipes']);
  const dupes = useMemo(() => duplicateImageUrls(listOf(allRecipes)), [allRecipes]);

  const [portions, setPortions] = useState(null);
  const [cooking, setCooking] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [doneSteps, setDoneSteps] = useState([]);
  const [micros, setMicros] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!cooking) return;
      const listener = BackHandler.addEventListener('hardwareBackPress', () => {
        setCooking(false);
        return true;
      });
      return () => listener.remove();
    }, [cooking])
  );

  const recipe = query.data;
  const original = Number(recipe?.servings) || 1;
  const servings = portions ?? original;
  const scaled = servings !== original;
  const ingredients = recipe?.ingredients || [];
  const steps = useMemo(() => parseSteps(recipe?.instructions), [recipe?.instructions]);
  const rawPhoto = recipe?.imageUrl ? String(recipe.imageUrl).trim() : '';
  const photoUri = rawPhoto && !dupes.has(rawPhoto) ? imgUrl(rawPhoto) : undefined;
  const hasPhoto = !!photoUri && !imgFailed;

  const favorite = useMutation({
    mutationFn: next => recipeService.favorite(id, next),
    onSuccess: (_, next) => {
      client.setQueryData(['recipe', id], data => ({ ...data, isFavorite: next }));
      client.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const toggleIngredient = index =>
    setCheckedIngredients(items => (items.includes(index) ? items.filter(i => i !== index) : [...items, index]));

  const toggleStep = index =>
    setDoneSteps(items => (items.includes(index) ? items.filter(i => i !== index) : [...items, index]));

  const isPublished = recipe && recipe.status === 'published' && !isDemo(recipe);
  const multiStepCooking = cooking && (steps.length > 1 || ingredients.length > 0);

  return (
    <Page
      title={cooking ? 'Vào bếp' : 'Công thức'}
      subtitle={cooking && recipe?.title ? recipe.title : undefined}
      back={cooking ? () => setCooking(false) : navigation.goBack}
      action={
        isPublished && !cooking ? (
          <IconButton
            label={recipe.isFavorite ? 'Bỏ lưu công thức' : 'Lưu công thức'}
            icon={recipe.isFavorite ? Check : Bookmark}
            tone={recipe.isFavorite ? 'soft' : 'plain'}
            disabled={favorite.isPending}
            onPress={() => (signedIn ? favorite.mutate(!recipe.isFavorite) : navigation.navigate('Login'))}
          />
        ) : cooking && (checkedIngredients.length > 0 || doneSteps.length > 0) ? (
          <IconButton
            label="Đặt lại tiến độ nấu"
            icon={RotateCcw}
            onPress={() => {
              setCheckedIngredients([]);
              setDoneSteps([]);
            }}
          />
        ) : null
      }
      footer={
        isPublished && !cooking ? (
          <View style={s.stickyBar}>
            <Button
              title={recipe.isFavorite ? 'Đã lưu' : 'Lưu món'}
              icon={recipe.isFavorite ? Check : Bookmark}
              variant={recipe.isFavorite ? 'done' : 'outline'}
              loading={favorite.isPending}
              onPress={() => (signedIn ? favorite.mutate(!recipe.isFavorite) : navigation.navigate('Login'))}
            />
            <Button
              title="Vào bếp"
              icon={CookingPot}
              variant="primary"
              style={ui.fill}
              disabled={!recipe.instructions}
              onPress={() => setCooking(true)}
            />
          </View>
        ) : null
      }
    >
      {!id ? (
        <Empty title="Thiếu mã công thức" />
      ) : (
        <QueryState query={query} skeletonCount={2}>
          {isPublished ? (
            <>
              {/* Editorial Header directly on paper */}
              {!cooking ? (
                <View style={{ gap: 8 }}>
                  <Text style={ui.kicker}>
                    {categoryName(recipe.category) || 'Bếp chay'}
                    {recipe.author ? `  ·  ${recipe.author}` : ''}
                  </Text>
                  <Text accessibilityRole="header" style={s.recipeHeadline}>
                    {recipe.title}
                  </Text>
                  {recipe.description ? <Text style={ui.body}>{recipe.description}</Text> : null}
                </View>
              ) : multiStepCooking ? (
                <StepProgress
                  label="Tiến độ chuẩn bị & chế biến"
                  current={doneSteps.length + checkedIngredients.length}
                  total={steps.length + ingredients.length}
                />
              ) : null}

              {!cooking && hasPhoto ? (
                <View style={s.photoFrame}>
                  <Image
                    source={{ uri: photoUri }}
                    style={s.photo}
                    resizeMode="cover"
                    onError={() => setImgFailed(true)}
                  />
                </View>
              ) : null}

              <Notice error>{favorite.error?.message}</Notice>

              {/* Self-explanatory single-line Portion Stepper (zero redundant explanation) */}
              <View style={s.portionRow}>
                <Text style={ui.label}>
                  Khẩu phần{scaled ? ` (gốc ${original})` : ''}
                </Text>
                <View style={s.stepper}>
                  <IconButton
                    label="Giảm khẩu phần"
                    icon={Minus}
                    size={34}
                    tone="soft"
                    disabled={servings <= 1}
                    onPress={() => setPortions(servings - 1)}
                  />
                  <Text style={s.portionCount}>{servings} phần</Text>
                  <IconButton
                    label="Tăng khẩu phần"
                    icon={Plus}
                    size={34}
                    tone="soft"
                    disabled={servings >= 20}
                    onPress={() => setPortions(servings + 1)}
                  />
                </View>
              </View>

              {/* Flat Tabular Nutrition Strip (Normal Mode) */}
              {!cooking ? (
                <View style={ui.flatSection}>
                  <View style={s.macroStrip}>
                    {macros.map(([label, key, unit], idx) => (
                      <View key={key} style={[s.macroCol, idx < macros.length - 1 && s.colBorder]}>
                        <Text style={ui.small}>{label}</Text>
                        <Text style={s.numValue}>{number(recipe[key], unit)}</Text>
                      </View>
                    ))}
                  </View>

                  {micros ? (
                    <View style={s.macroStrip}>
                      {micronutrients.map(([label, key, unit], idx) => (
                        <View key={key} style={[s.macroCol, idx < micronutrients.length - 1 && s.colBorder]}>
                          <Text style={ui.small}>{label}</Text>
                          <Text style={s.numValue}>{number(recipe[key], unit)}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setMicros(!micros)}
                    style={s.microToggle}
                  >
                    <Text style={ui.linkText}>
                      {micros ? 'Thu gọn vi chất' : 'Vi chất mỗi phần (Sắt, B12, Canxi, Kẽm)'}
                    </Text>
                    {micros ? (
                      <ChevronUp size={15} color={c.terracotta} />
                    ) : (
                      <ChevronDown size={15} color={c.terracotta} />
                    )}
                  </Pressable>
                </View>
              ) : null}

              {/* Single Elevated Card: Ingredients Ledger (hidden in Cooking Mode if recipe has 0 ingredients) */}
              {(!cooking || ingredients.length > 0) ? (
                <View style={ui.card}>
                  <SectionHeader
                    title={cooking ? 'Sơ chế nguyên liệu' : 'Nguyên liệu'}
                    count={
                      ingredients.length
                        ? cooking
                          ? `${checkedIngredients.length}/${ingredients.length}`
                          : `${ingredients.length} mục`
                        : undefined
                    }
                  />
                  {ingredients.length ? (
                    <View>
                      {ingredients.map((ingredient, i) => {
                        const done = checkedIngredients.includes(i);
                        const Icon = done ? SquareCheck : Square;
                        const qty = number(
                          ingredient.quantityG == null ? null : (ingredient.quantityG * servings) / original,
                          'g'
                        );
                        const label = ingredientLabel(ingredient.name || ingredient.ingredientName);

                        if (cooking) {
                          return (
                            <Pressable
                              key={i}
                              accessibilityRole="checkbox"
                              accessibilityState={{ checked: done }}
                              accessibilityLabel={`${label}, ${qty}`}
                              onPress={() => toggleIngredient(i)}
                              style={[s.ingredientRow, i === ingredients.length - 1 && { borderBottomWidth: 0 }]}
                            >
                              <Icon size={19} color={done ? c.success : c.muted} strokeWidth={1.9} />
                              <Text style={[s.ingName, ui.fill, done && s.strikeText]}>{label}</Text>
                              <Text style={[s.qtyText, scaled && s.qtyScaled]}>{qty}</Text>
                            </Pressable>
                          );
                        }

                        return (
                          <View
                            key={i}
                            style={[s.ingredientRow, i === ingredients.length - 1 && { borderBottomWidth: 0 }]}
                          >
                            <Text style={[s.ingName, ui.fill]}>{label}</Text>
                            <Text style={[s.qtyText, scaled && s.qtyScaled]}>{qty}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={ui.body}>Định lượng nguyên liệu đang được biên tập bổ sung.</Text>
                  )}
                </View>
              ) : null}

              {/* Flat Editorial Cooking Instructions */}
              <View style={ui.flatSection}>
                <SectionHeader
                  title="Cách chế biến"
                  count={steps.length > 1 ? `${steps.length} bước` : undefined}
                />
                {!recipe.instructions ? (
                  <Text style={ui.body}>Chưa có hướng dẫn chi tiết cho món này.</Text>
                ) : steps.length > 1 ? (
                  <View style={{ gap: 12 }}>
                    {steps.map((stepText, idx) => {
                      const done = doneSteps.includes(idx);
                      if (cooking) {
                        return (
                          <Pressable
                            key={idx}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: done }}
                            onPress={() => toggleStep(idx)}
                            style={[s.cookStep, done && s.cookStepDone]}
                          >
                            <Text style={[s.stepIndex, done && { color: c.success }]}>
                              {done ? '✓' : String(idx + 1).padStart(2, '0')}
                            </Text>
                            <View style={ui.fill}>
                              <Readable
                                content={stepText}
                                style={[
                                  s.cookingStepText,
                                  done && { color: c.muted, textDecorationLine: 'line-through' },
                                ]}
                              />
                            </View>
                          </Pressable>
                        );
                      }
                      return (
                        <View key={idx} style={s.staticStep}>
                          <Text style={s.stepIndex}>{String(idx + 1).padStart(2, '0')}</Text>
                          <View style={ui.fill}>
                            <Readable content={stepText} />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Readable content={recipe.instructions} style={cooking ? s.cookingStepText : undefined} />
                )}
              </View>
            </>
          ) : (
            <Empty title="Công thức này chưa khả dụng" detail="Món ăn có thể đang được biên tập lại." />
          )}
        </QueryState>
      )}
    </Page>
  );
}

const s = StyleSheet.create({
  recipeHeadline: {
    fontFamily: font.serifBold,
    fontSize: 28,
    lineHeight: 36,
    color: c.ink,
    letterSpacing: -0.3,
    includeFontPadding: false,
  },
  photoFrame: {
    width: '100%',
    height: 196,
    borderRadius: r.lg,
    overflow: 'hidden',
    backgroundColor: c.surfaceMuted,
  },
  photo: { width: '100%', height: '100%' },
  portionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  portionCount: {
    minWidth: 58,
    textAlign: 'center',
    fontFamily: font.medium,
    fontSize: 15,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  macroStrip: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  macroCol: {
    flex: 1,
    paddingHorizontal: 6,
    gap: 3,
  },
  colBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: c.line,
  },
  numValue: {
    fontFamily: font.regular,
    fontSize: 16,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  microToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  ingName: {
    fontFamily: font.regular,
    fontSize: 15,
    color: c.ink,
    includeFontPadding: false,
  },
  strikeText: {
    color: c.muted,
    textDecorationLine: 'line-through',
  },
  qtyText: {
    fontFamily: font.regular,
    fontSize: 14,
    color: c.muted,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  qtyScaled: {
    fontFamily: font.semi,
    color: c.terracotta,
  },
  staticStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cookStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 13,
    borderRadius: r.md,
    backgroundColor: c.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.lineStrong,
  },
  cookStepDone: {
    backgroundColor: c.limeSoft,
    borderColor: c.lime,
  },
  stepIndex: {
    width: 24,
    fontFamily: font.serifBold,
    fontSize: 16,
    lineHeight: 23,
    color: c.terracotta,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  cookingStepText: {
    fontSize: 16,
    lineHeight: 25,
  },
  stickyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 11,
    backgroundColor: c.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.lineStrong,
    ...sh.float,
  },
});
