import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';
import { recipeImageUrl } from '../../api/client';
import { Clock, Flame, Dumbbell } from 'lucide-react-native';

export function RecipeCard({ recipe, onPress }) {
  if (!recipe) return null;

  const imageSrc = recipeImageUrl(recipe.imageUrl || recipe.image);
  const calories = recipe.calories || recipe.kcal || 0;
  const cookTime = recipe.cookingTimeMinutes || recipe.cookTimeMinutes || recipe.cookTime || 20;
  const protein = recipe.protein || recipe.proteinGrams || 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress && onPress(recipe)}
      style={styles.card}
    >
      <Image source={{ uri: imageSrc }} style={styles.image} resizeMode="cover" />
      
      <View style={styles.content}>
        {recipe.categoryName && (
          <Text style={styles.category}>{recipe.categoryName.toUpperCase()}</Text>
        )}
        <Text style={styles.title} numberOfLines={2}>{recipe.title || recipe.name}</Text>
        
        <View style={styles.metrics}>
          <View style={styles.badge}>
            <Flame size={13} color={theme.colors.calories} />
            <Text style={styles.badgeText}>{calories} kcal</Text>
          </View>

          <View style={styles.badge}>
            <Clock size={13} color={theme.colors.textSecondary} />
            <Text style={styles.badgeText}>{cookTime}p</Text>
          </View>

          {protein > 0 && (
            <View style={styles.badge}>
              <Dumbbell size={13} color={theme.colors.protein} />
              <Text style={styles.badgeText}>{protein}g protein</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: theme.colors.borderLight,
  },
  content: {
    padding: theme.spacing.md,
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});
