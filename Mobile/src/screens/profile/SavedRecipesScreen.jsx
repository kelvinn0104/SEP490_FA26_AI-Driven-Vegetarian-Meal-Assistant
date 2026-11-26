import React, { useState } from 'react';
import { View, RefreshControl } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Page, Title, QueryState, Empty, ui } from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { recipeService } from '../../api/services/recipeService';
import { listOf, isDemo } from '../../styles/content.mjs';
import { c } from '../../styles/theme';

export function SavedRecipesScreen({ navigation }) {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['favorites', page], queryFn: ({ signal }) => recipeService.getFavorites(page, signal) });
  const recipes = listOf(query.data).filter(recipe => !isDemo(recipe));
  const total = query.data?.totalPages || 1;
  return <Page title="Món đã lưu" back={navigation.goBack} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} colors={[c.primary]} />}>
    <Title title="Món muốn nấu lại" />
    <QueryState query={query}>
      {!recipes.length && <Empty title="Chưa có món ở đây" detail="Bạn có thể lưu món ngay trên trang công thức." icon={Bookmark}>
        <Button title="Khám phá công thức" variant="secondary" onPress={() => {
          navigation.popToTop();
          navigation.navigate('MainTabs', { screen: 'HomeTab' });
        }} />
      </Empty>}
      {recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })} />)}
      {(page > 1 || page < total) && <View style={ui.row}>
        <Button title="Trang trước" variant="outline" disabled={page <= 1} onPress={() => setPage(page - 1)} />
        <Button title="Trang sau" variant="outline" disabled={page >= total} onPress={() => setPage(page + 1)} />
      </View>}
    </QueryState>
  </Page>;
}
