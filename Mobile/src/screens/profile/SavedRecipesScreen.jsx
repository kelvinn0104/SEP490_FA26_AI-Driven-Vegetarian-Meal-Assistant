import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { theme } from '../../styles/theme';
import { recipeService } from '../../api/services/recipeService';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { Header } from '../../components/ui/Header';
import { Bookmark } from 'lucide-react-native';

export function SavedRecipesScreen({ navigation }) {
  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => recipeService.getFavorites(),
  });

  const list = Array.isArray(favorites) ? favorites : favorites?.items || [];

  return (
    <View style={styles.container}>
      <Header title="Món Chay Đã Lưu" onBack={() => navigation.goBack()} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.content}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item.recipe || item}
              onPress={(recipe) => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Bookmark size={40} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Bạn chưa lưu món chay nào.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: theme.colors.textMuted,
  },
});
