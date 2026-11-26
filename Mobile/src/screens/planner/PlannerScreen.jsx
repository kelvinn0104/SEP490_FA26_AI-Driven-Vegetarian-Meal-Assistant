import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theme } from '../../styles/theme';
import { mealPlanService } from '../../api/services/mealPlanService';
import { Button } from '../../components/ui/Button';
import { Calendar, CheckCircle, Circle, Flame, Sparkles, Plus } from 'lucide-react-native';

export function PlannerScreen({ navigation }) {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  // TanStack Query: Lấy thực đơn hiện tại
  const {
    data: plan,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['currentMealPlan'],
    queryFn: () => mealPlanService.getCurrentPlan(),
  });

  // Đánh dấu đã ăn bữa này
  const completeMutation = useMutation({
    mutationFn: ({ planId, itemId, completed }) =>
      mealPlanService.markItemCompleted(planId, itemId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentMealPlan'] });
    },
  });

  // Tự động sinh thực đơn tuần mới bằng AI (Linear Programming solver)
  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      await mealPlanService.generatePlan({
        days: 7,
        healthGoal: 'Duy trì sức khỏe',
      });
      queryClient.invalidateQueries({ queryKey: ['currentMealPlan'] });
      Alert.alert('Thành công', 'Đã tạo thực đơn tuần cân bằng dinh dưỡng mới!');
    } catch (err) {
      Alert.alert('Lỗi tạo thực đơn', err.message || 'Không thể tạo thực đơn lúc này.');
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải kế hoạch dinh dưỡng...</Text>
      </View>
    );
  }

  const days = plan?.days || plan?.mealPlanDays || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
    >
      {/* Tiêu đề & Nút tạo mới */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Kế Hoạch Bữa Ăn</Text>
          <Text style={styles.headerSub}>Tối ưu vi chất Protein, Sắt, B12 bởi AI</Text>
        </View>

        <TouchableOpacity
          style={styles.newPlanBtn}
          onPress={handleGeneratePlan}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Sparkles size={16} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.newPlanBtnText}>Tạo mới</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {!plan || days.length === 0 ? (
        <View style={styles.emptyCard}>
          <Calendar size={48} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>Chưa có thực đơn tuần này</Text>
          <Text style={styles.emptySub}>
            Hãy để AI tối ưu hóa thực đơn ăn chay 7 ngày chuẩn khoa học dựa trên chiều cao và cân nặng của bạn.
          </Text>
          <Button
            title="Tạo Thực Đơn Thông Minh (AI)"
            icon={Sparkles}
            onPress={handleGeneratePlan}
            loading={generating}
            style={{ marginTop: 16 }}
          />
        </View>
      ) : (
        days.map((day, dayIdx) => (
          <View key={dayIdx} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>
                {day.dayOfWeek || `Ngày ${dayIdx + 1}`} - {day.date || ''}
              </Text>
              <View style={styles.dayCaloBadge}>
                <Flame size={12} color={theme.colors.calories} />
                <Text style={styles.dayCaloText}>{day.totalCalories || 0} kcal</Text>
              </View>
            </View>

            {(day.meals || day.items || []).map((meal, mIdx) => {
              const isCompleted = meal.isCompleted || meal.completed;
              return (
                <View key={mIdx} style={styles.mealItem}>
                  <TouchableOpacity
                    onPress={() =>
                      completeMutation.mutate({
                        planId: plan.id,
                        itemId: meal.id,
                        completed: !isCompleted,
                      })
                    }
                    style={styles.checkBtn}
                  >
                    {isCompleted ? (
                      <CheckCircle size={22} color={theme.colors.primary} />
                    ) : (
                      <Circle size={22} color={theme.colors.border} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.mealInfo}
                    onPress={() => {
                      if (meal.recipeId) {
                        navigation.navigate('RecipeDetail', { recipeId: meal.recipeId });
                      }
                    }}
                  >
                    <Text style={styles.mealType}>{meal.mealType || 'Bữa ăn'}</Text>
                    <Text style={[styles.mealTitle, isCompleted && styles.completedText]}>
                      {meal.recipeTitle || meal.title || meal.name}
                    </Text>
                    <Text style={styles.mealNutri}>
                      {meal.calories || 0} kcal • {meal.protein || 0}g protein
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  newPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
  },
  newPlanBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    padding: 32,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: 20,
    ...theme.shadows.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  dayCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    paddingBottom: 8,
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  dayCaloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayCaloText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.calories,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkBtn: {
    paddingRight: 10,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  mealNutri: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
});
