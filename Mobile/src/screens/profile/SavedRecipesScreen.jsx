import React, { useMemo, useState } from 'react';
import { RefreshControl, Text, View } from 'react-native';
import { Bookmark, Compass } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Empty, Page, QueryState, ui } from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { recipeService } from '../../api/services/recipeService';
import { duplicateImageUrls, isDemo, listOf } from '../../styles/content.mjs';
import { c } from '../../styles/theme';

export function SavedRecipesScreen({ navigation }) {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['favorites', page],
    queryFn: ({ signal }) => recipeService.getFavorites(page, signal),
  });

  const recipes = useMemo(
    () => listOf(query.data).filter(recipe => !isDemo(recipe)),
    [query.data]
  );
  const dupes = useMemo(() => duplicateImageUrls(recipes), [recipes]);
  const total = query.data?.totalPages || 1;

  return (
    <Page
      title="Món đã lưu"
      back={navigation.goBack}
      refreshControl={
        <RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} colors={[c.terracotta]} />
      }
    >
      <QueryState query={query} skeletonCount={4}>
        {!recipes.length ? (
          <Empty
            title="Chưa lưu món nào"
            icon={Bookmark}
          >
            <Button
              title="Tìm món chay"
              icon={Compass}
              onPress={() => {
                navigation.popToTop();
                navigation.navigate('MainTabs', { screen: 'HomeTab' });
              }}
            />
          </Empty>
        ) : (
          <View style={{ gap: 12 }}>
            {recipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                suppressPhoto={dupes.has(String(recipe.imageUrl ?? '').trim())}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
              />
            ))}
          </View>
        )}

        {(page > 1 || page < total) && (
          <View style={ui.between}>
            <Button
              title="Trang trước"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onPress={() => setPage(page - 1)}
            />
            <Text style={ui.small}>
              Trang {page} / {total}
            </Text>
            <Button
              title="Trang sau"
              variant="outline"
              size="sm"
              disabled={page >= total}
              onPress={() => setPage(page + 1)}
            />
          </View>
        )}
      </QueryState>
    </Page>
  );
}
