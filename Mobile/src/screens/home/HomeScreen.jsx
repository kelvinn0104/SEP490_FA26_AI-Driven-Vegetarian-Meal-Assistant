import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { theme } from '../../styles/theme';
import { recipeService } from '../../api/services/recipeService';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { Search, Sparkles, Camera, UtensilsCrossed } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';

export function HomeScreen({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const user = useAuthStore((state) => state.user);

  // TanStack Query: Tự động cache & fetch ngầm danh sách công thức
  const {
    data: recipeResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['recipes', keyword],
    queryFn: () => recipeService.getRecipes({ search: keyword, pageSize: 20 }),
    staleTime: 1000 * 60 * 15, // Dữ liệu còn tươi trong 15 phút
  });

  const recipes = Array.isArray(recipeResponse)
    ? recipeResponse
    : recipeResponse?.items || [];

  return (
    <View style={styles.container}>
      {/* Header Chào mừng */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Xin chào, {user?.displayName || 'Bạn yêu thuần chay'} 👋
          </Text>
          <Text style={styles.subGreeting}>Hôm nay bạn muốn thưởng thức món gì?</Text>
        </View>

        {/* Nút bấm nhanh sang quét tủ lạnh */}
        <TouchableOpacity
          style={styles.scanQuickBtn}
          onPress={() => navigation.navigate('VisionTab')}
        >
          <Camera size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Thanh tìm kiếm */}
      <View style={styles.searchBox}>
        <Search size={18} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Tìm món chay, nguyên liệu, calo..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
          value={keyword}
          onChangeText={setKeyword}
          returnKeyType="search"
        />
      </View>

      {/* Banner AI gợi ý */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.aiBanner}
        onPress={() => navigation.navigate('VisionTab')}
      >
        <Sparkles size={24} color="#ffffff" style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.aiBannerTitle}>Quét tủ lạnh bằng AI (YOLOv8)</Text>
          <Text style={styles.aiBannerSub}>
            Chụp ảnh nguyên liệu sẵn có để AI gợi ý món ngon không lãng phí thực phẩm!
          </Text>
        </View>
      </TouchableOpacity>

      {/* Danh sách công thức */}
      <View style={styles.listHeader}>
        <UtensilsCrossed size={18} color={theme.colors.primary} />
        <Text style={styles.listTitle}>Món Chay Dành Cho Bạn</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải thực đơn gợi ý...</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item, index) => String(item.id || index)}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={(recipe) => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không tìm thấy món ăn phù hợp.</Text>
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subGreeting: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scanQuickBtn: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    height: 46,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  aiBanner: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  aiBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  aiBannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: 6,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  listContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
});
