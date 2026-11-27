import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ArrowUpDown,
  Bell,
  ChevronRight,
  HeartPulse,
  LogIn,
  ScanLine,
} from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Chip,
  Empty,
  FormScroll,
  Frame,
  Notice,
  QueryState,
  SearchBar,
  SectionHeader,
  ui,
} from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/Header';
import { CeramicBowlGauge, MealTrayAxis } from '../../components/ui/Gauges';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { recipeService } from '../../api/services/recipeService';
import { mealPlanService } from '../../api/services/mealPlanService';
import { notificationService } from '../../api/services/notificationService';
import { c, font, r, sh } from '../../styles/theme';
import {
  categoryName,
  duplicateImageUrls,
  fold,
  fullViDate,
  isDemo,
  listOf,
  loggedMealIds,
  sortRecipes,
  today,
} from '../../styles/content.mjs';
import { useAuthStore } from '../../store/useAuthStore';

const SORT_MODES = [
  ['default', 'Mặc định'],
  ['protein', 'Giàu đạm'],
  ['kcal_asc', 'Nhẹ kcal'],
];

function MamComHomNay({ user, navigation }) {
  const client = useQueryClient();
  const currentDay = today();
  const displayName = (user?.displayName || user?.name || 'bạn')
    .replace(/^chef\s+/i, '')
    .trim()
    .split(/\s+/)
    .slice(-2)
    .join(' ');

  const daily = useQuery({
    queryKey: ['diary', currentDay],
    queryFn: ({ signal }) => mealPlanService.daily(currentDay, signal),
  });
  const plan = useQuery({
    queryKey: ['current-plan-home'],
    queryFn: ({ signal }) => mealPlanService.getCurrentPlan(signal),
  });

  const logMeal = useMutation({
    mutationFn: itemId => mealPlanService.log(itemId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['diary', currentDay] });
    },
  });

  const dayEntry = (plan.data?.days || []).find(d => d.date === currentDay);
  const meals = (dayEntry?.meals || []).filter(m => !isDemo({ title: m.recipeTitle }));
  const logged = loggedMealIds(daily.data, currentDay);
  const nextUnlogged = meals.find(m => !logged.has(String(m.id)));
  const consumed = daily.data?.consumed;
  const target = daily.data?.target;

  return (
    <View style={s.traySurface}>
      <View style={ui.between}>
        <View style={ui.fill}>
          <Text style={s.dateLine} numberOfLines={1}>
            {fullViDate(currentDay)} · {displayName}
          </Text>
          <Text style={s.trayHeading}>Hôm nay</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mở nhật ký dinh dưỡng"
          hitSlop={8}
          onPress={() => navigation.navigate('Nutrition', { date: currentDay })}
          style={ui.linkBtn}
        >
          <Text style={ui.linkText}>Nhật ký</Text>
          <ChevronRight size={14} color={c.terracotta} strokeWidth={2} />
        </Pressable>
      </View>

      {daily.isSuccess ? <CeramicBowlGauge
        compact
        value={consumed?.kcal ?? 0}
        target={target?.kcal}
        proteinG={consumed?.proteinG ?? 0}
        proteinTarget={target?.proteinG}
        carbG={consumed?.carbG ?? 0}
        fatG={consumed?.fatG ?? 0}
        nextMealTitle={nextUnlogged?.recipeTitle}
        onPress={() => navigation.navigate('Nutrition', { date: currentDay })}
      /> : null}

      {user.hasHealthProfile === false ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('HealthProfile')}
          style={s.profileHint}
        >
          <HeartPulse size={16} color={c.terracotta} strokeWidth={1.9} />
          <Text style={s.profileHintText} numberOfLines={1}>
            Thiết lập hồ sơ sức khỏe
          </Text>
          <ChevronRight size={15} color={c.terracotta} />
        </Pressable>
      ) : null}

      {logMeal.error ? <Notice error>{logMeal.error.message}</Notice> : null}

      <MealTrayAxis
        meals={meals}
        logged={logged}
        busyId={logMeal.isPending ? logMeal.variables : null}
        onOpenRecipe={recipeId => navigation.navigate('RecipeDetail', { recipeId })}
        onToggleLog={meal => {
          if (!daily.isPending && !daily.isError) logMeal.mutate(meal.id);
        }}
        onOpenPlanner={() => navigation.navigate('PlannerTab')}
      />
    </View>
  );
}

export function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(null);
  const [sortIndex, setSortIndex] = useState(0);
  const sort = SORT_MODES[sortIndex][0];
  const sortLabel = SORT_MODES[sortIndex][1];

  const user = useAuthStore(state => state.user);
  const signedIn = useAuthStore(state => !!state.token);
  const notice = useAuthStore(state => state.notice);

  const query = useQuery({
    queryKey: ['recipes'],
    queryFn: ({ signal }) => recipeService.getRecipes(signal),
  });
  const unread = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: ({ signal }) => notificationService.getUnreadCount(signal),
    enabled: signedIn,
  });

  const recipes = useMemo(
    () => listOf(query.data).filter(recipe => recipe.status === 'published' && !isDemo(recipe)),
    [query.data]
  );
  const dupes = useMemo(() => duplicateImageUrls(recipes), [recipes]);
  const categories = useMemo(
    () => [...new Set(recipes.map(recipe => recipe.category).filter(Boolean))],
    [recipes]
  );
  const term = fold(search);
  const results = useMemo(() => {
    const filtered = recipes.filter(
      recipe => (!category || recipe.category === category) && fold(recipe.title).includes(term)
    );
    return sortRecipes(filtered, sort);
  }, [recipes, category, term, sort]);

  const openScan = () => navigation.navigate(signedIn ? 'VisionScan' : 'Login');

  return (
    <Frame
      title="VeggieAI"
      tab
      action={
        signedIn ? (
          <IconButton
            label="Thông báo"
            icon={Bell}
            badge={unread.data || 0}
            onPress={() => navigation.navigate('Notifications')}
          />
        ) : (
          <IconButton
            label="Đăng nhập"
            icon={LogIn}
            onPress={() => navigation.navigate('Login')}
          />
        )
      }
    >
      <FlatList
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[ui.content, { gap: 10 }]}
        renderScrollComponent={props => <FormScroll {...props} />}
        data={results}
        keyExtractor={item => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => {
              query.refetch();
              if (signedIn) unread.refetch();
            }}
            colors={[c.terracotta]}
          />
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            suppressPhoto={Boolean(item.imageUrl && dupes.has(String(item.imageUrl).trim()))}
            onPress={recipe => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
          />
        )}
        ListHeaderComponent={
          <View style={s.headerBlock}>
            <Notice>{notice}</Notice>

            <SearchBar
              label="Tìm công thức chay"
              placeholder="Tìm đậu hũ, nấm kho, canh…"
              value={search}
              onChangeText={setSearch}
              trailing={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Quét nguyên liệu"
                  hitSlop={6}
                  onPress={openScan}
                  style={({ pressed }) => [s.scanPill, pressed && { opacity: 0.75 }]}
                >
                  <ScanLine size={15} color={c.ink} strokeWidth={1.9} />
                </Pressable>
              }
            />

            {!term && !category && (signedIn ? (
              user ? <MamComHomNay user={user} navigation={navigation} /> : null
            ) : (
              <View style={s.guestHero}>
                <Image source={require('../../../assets/editorial-kitchen.webp')} style={s.editorialImage} resizeMode="cover" accessible={false} />
                <View style={s.guestCopy}>
                  <Text accessibilityRole="header" style={s.guestHeroTitle}>{'Hôm nay\nnấu gì?'}</Text>
                  <Button title="Lên thực đơn" size="sm" variant="primary" onPress={() => navigation.navigate('PlannerTab')} />
                </View>
              </View>
            ))}

            <View style={s.catalogueHeader}>
              <SectionHeader
                title="Công thức chay"
                count={!query.isPending && !query.isError ? `${results.length} món` : undefined}
              />

              {/* Distinct Filter Strip vs Distinct Sort Button */}
              <View style={s.filterToolbar}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.filterStrip}
                  style={ui.fill}
                >
                  <Chip label="Tất cả" selected={!category} onPress={() => setCategory(null)} />
                  {categories.map(name => (
                    <Chip
                      key={name}
                      label={categoryName(name)}
                      selected={category === name}
                      onPress={() => setCategory(category === name ? null : name)}
                    />
                  ))}
                </ScrollView>

                {recipes.length > 1 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Sắp xếp: ${sortLabel}`}
                    onPress={() => setSortIndex((sortIndex + 1) % SORT_MODES.length)}
                    style={s.sortToggle}
                  >
                    <ArrowUpDown size={13} color={c.inkSoft} strokeWidth={1.9} />
                    <Text style={s.sortToggleText}>{sortLabel}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {query.isRefetchError && !!results.length ? (
              <Notice error>Chưa cập nhật được danh sách mới. Kéo xuống để thử lại.</Notice>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <QueryState query={query} skeletonCount={4}>
            <Empty
              title={term || category ? 'Chưa tìm thấy món phù hợp' : 'Chưa có công thức'}
              detail={term || category ? 'Thử từ khóa khác hoặc bỏ bộ lọc danh mục.' : undefined}
            >
              {(term || category) && (
                <Button
                  variant="outline"
                  title="Xóa bộ lọc"
                  onPress={() => {
                    setSearch('');
                    setCategory(null);
                  }}
                />
              )}
            </Empty>
          </QueryState>
        }
      />
    </Frame>
  );
}

const s = StyleSheet.create({
  headerBlock: { gap: 16, paddingBottom: 4 },
  scanPill: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r.pill,
    backgroundColor: c.surfaceMuted,
  },
  guestHero: {
    minHeight: 171,
    borderRadius: r.xl,
    overflow: 'hidden',
    backgroundColor: c.primaryDark,
    ...sh.card,
  },
  guestCopy: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    width: '56%',
    padding: 16,
    gap: 14,
  },
  guestHeroTitle: {
    fontFamily: font.serifBold,
    fontSize: 29,
    lineHeight: 34,
    color: '#FFFEFA',
    includeFontPadding: false,
  },
  editorialImage: {
    position: 'absolute',
    right: 0,
    width: '44%',
    height: '100%',
  },
  // Single elevated surface on HomeScreen
  traySurface: {
    backgroundColor: c.surfaceElevated,
    borderRadius: r.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.lineStrong,
    padding: 16,
    gap: 14,
    ...sh.card,
  },
  dateLine: {
    fontFamily: font.regular,
    fontSize: 12,
    color: c.muted,
    textTransform: 'capitalize',
    includeFontPadding: false,
  },
  trayHeading: {
    fontFamily: font.serifBold,
    fontSize: 21,
    lineHeight: 27,
    color: c.ink,
    includeFontPadding: false,
  },
  profileHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: r.sm,
    backgroundColor: c.terracottaSoft,
  },
  profileHintText: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 12.5,
    color: c.terracotta,
    includeFontPadding: false,
  },
  catalogueHeader: {
    gap: 10,
    paddingTop: 4,
  },
  filterToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterStrip: { gap: 7, paddingVertical: 2 },
  sortToggle: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: r.sm,
    backgroundColor: c.surfaceMuted,
  },
  sortToggleText: {
    fontFamily: font.medium,
    fontSize: 12,
    color: c.inkSoft,
    includeFontPadding: false,
  },
});
