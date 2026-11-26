import React, { useCallback, useState } from 'react';
import { BackHandler, Pressable, Text, View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Bookmark, Check, CookingPot, Minus, Plus, Square, SquareCheck } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/Header';
import { Page, Title, QueryState, Notice, Empty, ui } from '../../components/ui/Kit';
import { Readable } from '../../components/ui/Readable';
import { FoodImage } from '../../components/recipe/RecipeCard';
import { recipeService } from '../../api/services/recipeService';
import { useAuthStore } from '../../store/useAuthStore';
import { c } from '../../styles/theme';
import { categoryName, isDemo, number } from '../../styles/content.mjs';

const nutrients = [
  ['Năng lượng', 'kcalPerServing', 'kcal'], ['Đạm', 'proteinG', 'g'], ['Tinh bột', 'carbG', 'g'], ['Chất béo', 'fatG', 'g'],
  ['Sắt', 'ironMg', 'mg'], ['Vitamin B12', 'b12Mcg', 'µg'], ['Canxi', 'calciumMg', 'mg'], ['Kẽm', 'zincMg', 'mg'],
];

export function RecipeDetailScreen({ route, navigation }) {
  const id = route.params?.recipeId;
  const client = useQueryClient();
  const signedIn = useAuthStore(state => !!state.token);
  const query = useQuery({ queryKey: ['recipe', id], queryFn: ({ signal }) => recipeService.getRecipeById(id, signal), enabled: !!id });
  const [portions, setPortions] = useState(null);
  const [cooking, setCooking] = useState(false);
  const [checked, setChecked] = useState([]);
  const [micros, setMicros] = useState(false);
  useFocusEffect(useCallback(() => {
    if (!cooking) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      setCooking(false);
      return true;
    });
    return () => listener.remove();
  }, [cooking]));
  const recipe = query.data;
  const original = Number(recipe?.servings) || 1;
  const servings = portions ?? original;
  const ingredients = recipe?.ingredients || [];
  const favorite = useMutation({
    mutationFn: next => recipeService.favorite(id, next),
    onSuccess: (_, next) => {
      client.setQueryData(['recipe', id], data => ({ ...data, isFavorite: next }));
      client.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return <Page title={cooking ? 'Chế độ nấu' : 'Công thức'} back={cooking ? () => setCooking(false) : navigation.goBack}>
    {!id ? <Empty title="Thiếu mã công thức" /> : <QueryState query={query}>
      {recipe && recipe.status === 'published' && !isDemo(recipe) ? <>
        {!cooking && !!recipe.imageUrl && <FoodImage uri={recipe.imageUrl} style={s.hero} size={42} />}
        <Title eyebrow={categoryName(recipe.category)} title={recipe.title} detail={!cooking ? recipe.description : null} />
        <View style={[ui.card, ui.between]}>
          <View style={ui.fill}><Text style={ui.label}>Khẩu phần</Text><Text style={ui.small}>Định lượng tự điều chỉnh</Text></View>
          <IconButton label="Giảm khẩu phần" icon={Minus} disabled={servings <= 1} onPress={() => setPortions(servings - 1)} />
          <Text style={ui.h2}>{servings}</Text>
          <IconButton label="Tăng khẩu phần" icon={Plus} disabled={servings >= 20} onPress={() => setPortions(servings + 1)} />
        </View>
        {!cooking && <View style={ui.row}>
          <Button title="Vào bếp" icon={CookingPot} style={ui.fill} disabled={!recipe.instructions} onPress={() => setCooking(true)} />
          <Button title={recipe.isFavorite ? 'Bỏ lưu' : 'Lưu món'} icon={recipe.isFavorite ? Check : Bookmark} style={ui.fill} variant="secondary"
            loading={favorite.isPending} onPress={() => signedIn ? favorite.mutate(!recipe.isFavorite) : navigation.navigate('Login')} />
        </View>}
        <Notice error>{favorite.error?.message}</Notice>
        <View style={ui.card}>
          <View style={ui.between}><Text style={ui.h2}>Nguyên liệu</Text>{!!ingredients.length && <Text style={ui.small}>{cooking ? checked.length + '/' + ingredients.length : ingredients.length + ' loại'}</Text>}</View>
          {ingredients.length ? ingredients.map((ingredient, i) => {
            const done = checked.includes(i);
            const Icon = done ? SquareCheck : Square;
            const qty = number(ingredient.quantityG == null ? null : ingredient.quantityG * servings / original, 'g');
            const label = ingredient.name || ingredient.ingredientName;
            return cooking ? <Pressable key={i} accessibilityRole="checkbox" accessibilityState={{ checked: done }} accessibilityLabel={label + ', ' + qty}
              style={s.ingredient} onPress={() => setChecked(items => done ? items.filter(item => item !== i) : [...items, i])}>
              <Icon size={21} color={c.primary} /><Text style={[ui.label, ui.fill]}>{label}</Text><Text style={ui.small}>{qty}</Text>
            </Pressable> : <View key={i} style={s.ingredient}><Text style={[ui.label, ui.fill]}>{label}</Text><Text style={ui.small}>{qty}</Text></View>;
          }) : <Text style={ui.body}>Công thức chưa có định lượng nguyên liệu.</Text>}
        </View>
        <View style={ui.card}>
          <Text style={ui.h2}>Cách nấu</Text>
          {recipe.instructions ? <Readable content={recipe.instructions} /> : <Text style={ui.body}>Chưa có hướng dẫn.</Text>}
        </View>
        {!cooking && <View style={ui.card}>
          <Text style={ui.h2}>Dinh dưỡng mỗi phần</Text>
          <View style={s.metrics}>{nutrients.slice(0, micros ? 8 : 4).map(([label, key, unit]) => <View key={key} style={s.metric}>
            <Text style={ui.small}>{label}</Text><Text style={ui.label}>{number(recipe[key], unit)}</Text>
          </View>)}</View>
          <Button title={micros ? 'Thu gọn vi chất' : 'Xem vi chất'} variant="outline" onPress={() => setMicros(!micros)} />
        </View>}
      </> : <Empty title="Công thức này chưa khả dụng" />}
    </QueryState>}
  </Page>;
}
const s = StyleSheet.create({
  hero: { width: '100%', height: 220, borderRadius: 20 },
  ingredient: { ...ui.between, minHeight: 48, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.line },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: { flexGrow: 1, flexBasis: '43%', padding: 10, borderRadius: 10, backgroundColor: c.primaryLight },
});
