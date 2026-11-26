import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theme } from '../../styles/theme';
import { recipeService } from '../../api/services/recipeService';
import { recipeImageUrl } from '../../api/client';
import { Header } from '../../components/ui/Header';
import { Clock, Flame, Dumbbell, Bookmark, ChefHat, CheckCircle2 } from 'lucide-react-native';

export function RecipeDetailScreen({ route, navigation }) {
  const { recipeId } = route.params;
  const queryClient = useQueryClient();

  // TanStack Query: Cache dữ liệu món ăn 24 tiếng, vào bếp mất mạng vẫn xem tốt!
  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => recipeService.getRecipeById(recipeId),
    staleTime: 1000 * 60 * 30,      // 30 phút
    cacheTime: 1000 * 60 * 60 * 24, // 24 tiếng lưu offline trong bộ nhớ
  });

  const favoriteMutation = useMutation({
    mutationFn: () => recipeService.addFavorite(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết công thức...</Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không thể tải công thức này.</Text>
      </View>
    );
  }

  const imageSrc = recipeImageUrl(recipe.imageUrl || recipe.image);
  const ingredients = recipe.ingredients || recipe.recipeIngredients || [];
  const steps = recipe.instructions || recipe.steps || [];

  return (
    <View style={styles.container}>
      <Header
        title={recipe.title || 'Chi tiết món chay'}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={() => favoriteMutation.mutate()} style={styles.iconBtn}>
            <Bookmark size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: imageSrc }} style={styles.heroImage} resizeMode="cover" />

        <View style={styles.body}>
          {recipe.categoryName && (
            <Text style={styles.categoryBadge}>{recipe.categoryName.toUpperCase()}</Text>
          )}
          <Text style={styles.title}>{recipe.title}</Text>
          {recipe.description && <Text style={styles.desc}>{recipe.description}</Text>}

          {/* Dinh dưỡng (Macros) */}
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionItem}>
              <Flame size={18} color={theme.colors.calories} />
              <Text style={styles.nutriVal}>{recipe.calories || recipe.kcal || 0}</Text>
              <Text style={styles.nutriLabel}>Calories</Text>
            </View>

            <View style={styles.nutritionItem}>
              <Dumbbell size={18} color={theme.colors.protein} />
              <Text style={styles.nutriVal}>{recipe.protein || 0}g</Text>
              <Text style={styles.nutriLabel}>Protein</Text>
            </View>

            <View style={styles.nutritionItem}>
              <Clock size={18} color={theme.colors.secondary} />
              <Text style={styles.nutriVal}>{recipe.cookingTimeMinutes || 20}p</Text>
              <Text style={styles.nutriLabel}>Thời gian</Text>
            </View>
          </View>

          {/* Danh sách nguyên liệu */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ChefHat size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Nguyên Liệu Cần Có</Text>
            </View>
            {ingredients.length === 0 ? (
              <Text style={styles.mutedText}>Chưa có thông tin nguyên liệu chi tiết.</Text>
            ) : (
              ingredients.map((ing, idx) => (
                <View key={idx} style={styles.ingredientRow}>
                  <CheckCircle2 size={16} color={theme.colors.primary} />
                  <Text style={styles.ingredientText}>
                    {ing.ingredientName || ing.name || ing} - {ing.amount || ''} {ing.unit || ''}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Các bước nấu */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Các Bước Thực Hiện</Text>
            {Array.isArray(steps) ? (
              steps.map((st, idx) => (
                <View key={idx} style={styles.stepRow}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumber}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{st.instruction || st.text || st}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.stepText}>{String(steps)}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: theme.colors.borderLight,
  },
  body: {
    padding: theme.spacing.md,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    lineHeight: 28,
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutriVal: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  nutriLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  ingredientText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 15,
  },
  iconBtn: {
    padding: 6,
  },
  mutedText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
});
