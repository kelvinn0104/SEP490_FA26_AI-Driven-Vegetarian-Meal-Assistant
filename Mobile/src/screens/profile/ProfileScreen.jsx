import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LogOut, UserRound } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { notificationService } from '../../api/services/notificationService';
import { recipeService } from '../../api/services/recipeService';
import { communityService } from '../../api/services/communityService';
import { mealPlanService } from '../../api/services/mealPlanService';
import { Button } from '../../components/ui/Button';
import {
  Avatar,
  GuestGate,
  Notice,
  Page,
  RowLink,
  SectionHeader,
  ui,
} from '../../components/ui/Kit';
import { c, font, r, sh } from '../../styles/theme';
import { categoryName, dietLabel, isDemo, listOf, number } from '../../styles/content.mjs';

function totalCountOf(data, filteredList) {
  const explicit = data?.totalCount ?? data?.totalItems ?? data?.total;
  if (Number.isFinite(Number(explicit))) return Number(explicit);
  return filteredList.length;
}

export function ProfileScreen({ navigation }) {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const label = user?.displayName || user?.name || 'Thành viên VeggieAI';

  const unread = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: ({ signal }) => notificationService.getUnreadCount(signal),
    enabled: !!user,
  });

  const favorites = useQuery({
    queryKey: ['favorites', 1],
    queryFn: ({ signal }) => recipeService.getFavorites(1, signal),
    enabled: !!user,
  });

  const myPosts = useQuery({
    queryKey: ['posts', true, 1, '', '', 'newest'],
    queryFn: ({ signal }) =>
      communityService.getPosts({ mine: true, page: 1, keyword: '', postType: '', sort: 'newest' }, signal),
    enabled: !!user,
  });

  const plans = useQuery({
    queryKey: ['plan-history', 1],
    queryFn: ({ signal }) => mealPlanService.getHistory(1, signal),
    enabled: !!user,
  });

  const savedList = listOf(favorites.data).filter(item => !isDemo(item));
  const postList = listOf(myPosts.data);
  const planList = listOf(plans.data);

  const savedTotal = favorites.isPending ? '—' : totalCountOf(favorites.data, savedList);
  const postTotal = myPosts.isPending ? '—' : totalCountOf(myPosts.data, postList);
  const planTotal = plans.isPending ? '—' : totalCountOf(plans.data, planList);
  return (
    <Page title="Cá nhân" tab>
      {!user ? (
          <GuestGate
            navigation={navigation}
            icon={UserRound}
            title="Tài khoản VeggieAI"
            detail="Đăng nhập để lưu món, thực đơn và nhật ký."
          />
      ) : (
        <>
          {/* Chef Identity Header directly on Giấy dó paper */}
          <View style={s.chefHeader}>
            <Avatar name={label} uri={user.avatar} size={62} tone="terracotta" />
            <View style={[ui.fill, { gap: 3 }]}>
              <Text style={s.chefName} numberOfLines={1}>
                {label}
              </Text>
              {user.dietType ? <Text style={ui.small}>{dietLabel(user.dietType)}</Text> : null}
              <Text style={ui.small} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          </View>

          {user.hasHealthProfile === false ? (
            <Notice warning>
              Thêm hồ sơ sức khỏe để tính khẩu phần và lọc dị ứng.
            </Notice>
          ) : null}

          {/* Single Focal Surface: 3-Column Chef Ledger Stats */}
          <View style={s.ledgerCard}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('SavedRecipes')}
              style={({ pressed }) => [s.statCol, s.statDivider, pressed && { opacity: 0.7 }]}
            >
              <Text style={s.statValue}>{savedTotal}</Text>
              <Text style={s.statLabel}>Món đã lưu</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('CommunityTab', { showMyPostsAt: Date.now() })}
              style={({ pressed }) => [s.statCol, s.statDivider, pressed && { opacity: 0.7 }]}
            >
              <Text style={s.statValue}>{postTotal}</Text>
              <Text style={s.statLabel}>Bài chia sẻ</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('PlannerTab')}
              style={({ pressed }) => [s.statCol, pressed && { opacity: 0.7 }]}
            >
              <Text style={s.statValue}>{planTotal}</Text>
              <Text style={s.statLabel}>Thực đơn</Text>
            </Pressable>
          </View>

          {/* Living Chef Ledger Preview: Saved Dishes */}
          {savedList.length > 0 ? (
            <View style={ui.flatSection}>
              <SectionHeader
                title="Món lưu gần đây"
                actionLabel="Mở bộ sưu tập"
                onAction={() => navigation.navigate('SavedRecipes')}
              />
              <View>
                {savedList.slice(0, 3).map((recipe, idx, arr) => {
                  const meta = [
                    categoryName(recipe.category),
                    recipe.kcalPerServing > 0 ? number(recipe.kcalPerServing, 'kcal') : null,
                  ]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <RowLink
                      key={recipe.id}
                      border={idx < arr.length - 1}
                      label={recipe.title}
                      detail={meta || undefined}
                      onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
                    />
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Living Chef Ledger Preview: Community Stories */}
          {postList.length > 0 ? (
            <View style={ui.flatSection}>
              <SectionHeader
                title="Bài của tôi"
                actionLabel="Xem tất cả"
                onAction={() => navigation.navigate('CommunityTab', { showMyPostsAt: Date.now() })}
              />
              <View>
                {postList.slice(0, 2).map((post, idx, arr) => (
                  <RowLink
                    key={post.id}
                    border={idx < arr.length - 1}
                    label={post.title}
                    rightText={post.likeCount == null ? undefined : `${post.likeCount} thích`}
                    onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* Clean Frameless Kitchen Ledger Links (zero pastel icon boxes, zero robotic descriptions) */}
          <View style={ui.flatSection}>
            <SectionHeader title="Thiết lập" />
            <View>
              <RowLink
                label="Hồ sơ sức khỏe & dị ứng"
                rightText={user.hasHealthProfile ? 'Đã lưu' : 'Chưa thiết lập'}
                onPress={() => navigation.navigate('HealthProfile')}
              />
              <RowLink
                label="Nhật ký dinh dưỡng & vận động"
                onPress={() => navigation.navigate('Nutrition')}
              />
              <RowLink
                label="Quét nguyên liệu từ ảnh"
                onPress={() => navigation.navigate('VisionScan')}
              />
              <RowLink
                border={false}
                label="Thông báo"
                rightText={unread.data > 0 ? `${unread.data} chưa đọc` : undefined}
                onPress={() => navigation.navigate('Notifications')}
              />
            </View>
          </View>

          <Button
            title="Đăng xuất"
            variant="outline"
            icon={LogOut}
            onPress={() =>
              Alert.alert(
                'Đăng xuất khỏi VeggieAI?',
                'Bạn vẫn có thể xem công thức và đọc bài viết cộng đồng ở chế độ khách.',
                [
                  { text: 'Hủy', style: 'cancel' },
                  {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: () => logout().catch(() => {}),
                  },
                ]
              )
            }
          />
        </>
      )}
    </Page>
  );
}

const s = StyleSheet.create({
  chefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  chefName: {
    fontFamily: font.serifBold,
    fontSize: 24,
    lineHeight: 31,
    color: c.ink,
    letterSpacing: -0.3,
    includeFontPadding: false,
  },
  ledgerCard: {
    flexDirection: 'row',
    backgroundColor: c.surfaceElevated,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
    paddingVertical: 15,
    ...sh.card,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 6,
  },
  statDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: c.line,
  },
  statValue: {
    fontFamily: font.serifBold,
    fontSize: 23,
    lineHeight: 29,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  statLabel: {
    fontFamily: font.regular,
    fontSize: 12.5,
    color: c.muted,
    includeFontPadding: false,
  },
});
