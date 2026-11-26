import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Image, RefreshControl, ScrollView } from 'react-native';
import { MessageCircle, ScanLine, CalendarDays } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Frame, Title, Field, Chip, QueryState, Empty, Notice, ui } from '../../components/ui/Kit';
import { IconButton } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { recipeService } from '../../api/services/recipeService';
import { c } from '../../styles/theme';
import { categoryName, fold, isDemo, listOf } from '../../styles/content.mjs';
import { useAuthStore } from '../../store/useAuthStore';

export function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(null);
  const notice = useAuthStore(state => state.notice);
  const query = useQuery({ queryKey: ['recipes'], queryFn: ({ signal }) => recipeService.getRecipes(signal) });
  const recipes = useMemo(() => listOf(query.data).filter(recipe => recipe.status === 'published' && !isDemo(recipe)), [query.data]);
  const categories = useMemo(() => [...new Set(recipes.map(recipe => recipe.category).filter(Boolean))], [recipes]);
  const term = fold(search);
  const results = recipes.filter(recipe => (!category || recipe.category === category) && fold(recipe.title).includes(term));
  return <Frame title="VeggieAI" tab action={<IconButton label="Hỏi trợ lý" icon={MessageCircle} onPress={() => navigation.navigate('Chatbot')} />}>
    <FlatList keyboardShouldPersistTaps="handled" contentContainerStyle={[ui.content, { gap: 8 }]}
      data={results} keyExtractor={item => String(item.id)} ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} colors={[c.primary]} />}
      renderItem={({ item }) => <RecipeCard recipe={item} onPress={recipe => navigation.navigate('RecipeDetail', { recipeId: recipe.id })} />}
      ListHeaderComponent={<View style={s.header}>
        <Notice>{notice}</Notice>
        <View style={s.hero}>
          <View style={s.heroCopy}><Title eyebrow="Sổ tay bếp chay" title={'Hôm nay\nnấu gì?'} detail="Tìm một món để nấu, hay lên thực đơn cho tuần này." /></View>
          <Image source={require('../../../assets/editorial-kitchen.webp')} style={s.editorial} resizeMode="cover" />
        </View>
        <View style={ui.row}>
          <Button title="Lên thực đơn" style={ui.fill} icon={CalendarDays} onPress={() => navigation.navigate('PlannerTab')} />
          <Button title="Quét ảnh" style={ui.fill} icon={ScanLine} variant="secondary" onPress={() => navigation.navigate('VisionTab')} />
        </View>
        <Field label="Tìm công thức" placeholder="Ví dụ: đậu hũ, nấm, canh…" value={search} onChangeText={setSearch} returnKeyType="search" />
        {!!categories.length && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label="Tất cả" selected={!category} onPress={() => setCategory(null)} />
          {categories.map(name => <Chip key={name} label={categoryName(name)} selected={category === name} onPress={() => setCategory(name)} />)}
        </ScrollView>}
        <View style={ui.between}><Text style={ui.h2}>Công thức chay</Text>{!query.isPending && !query.isError && <Text style={ui.small}>{results.length} món</Text>}</View>
      </View>}
      ListEmptyComponent={<QueryState query={query}>
        <Empty title={term || category ? 'Chưa tìm thấy món phù hợp' : 'Chưa có công thức'} detail={term || category ? 'Thử từ khóa khác hoặc bỏ bộ lọc.' : undefined}>
          {(term || category) && <Button variant="outline" title="Xóa bộ lọc" onPress={() => { setSearch(''); setCategory(null); }} />}
        </Empty>
      </QueryState>}
    />
  </Frame>;
}
const s = StyleSheet.create({
  header: { gap: 12, paddingBottom: 4 },
  hero: { borderRadius: 24, overflow: 'hidden', backgroundColor: c.primaryLight, borderWidth: 1, borderColor: c.line },
  heroCopy: { padding: 18 },
  editorial: { width: '100%', height: 166 },
});
