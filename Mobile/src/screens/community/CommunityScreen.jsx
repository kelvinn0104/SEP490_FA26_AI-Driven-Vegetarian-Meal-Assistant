import React, { useEffect, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ArrowUpDown, ArrowUpRight, BookOpen, Clock3, Heart, ImagePlus, MessageCircle, PenLine, Users } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { communityService } from '../../api/services/communityService';
import { Button } from '../../components/ui/Button';
import {
  Avatar,
  Badge,
  Empty,
  Notice,
  Page,
  QueryState,
  SearchBar,
  SegmentedControl,
  ui,
} from '../../components/ui/Kit';
import { PostMedia } from './PostMedia';
import { c, font, r } from '../../styles/theme';
import { formatPostDate, isDemo, listOf } from '../../styles/content.mjs';

export function postStatus(post) {
  if (post.moderation?.decision === 'rejected') return 'Không được duyệt';
  if (post.moderation?.decision === 'revision' && post.status !== 'published') return 'Cần chỉnh sửa';
  return (
    {
      pending: 'Chờ duyệt',
      published: 'Đã đăng',
      removed: 'Đã gỡ',
      flagged: 'Đang xem xét',
    }[post.status] || post.status
  );
}

export function postStatusTone(post) {
  if (post.moderation?.decision === 'revision' && post.status !== 'published') return 'warm';
  if (post.status === 'published') return 'done';
  if (post.status === 'removed') return 'error';
  return 'soft';
}

function FeedCard({ post, mine, navigation, signedIn }) {
  const client = useQueryClient();
  const reaction = useMutation({
    mutationFn: () => communityService.setLike(post, post.myVote !== 1),
    onSuccess: result => {
      client.setQueriesData({ queryKey: ['posts'] }, data => Array.isArray(data?.items) ? {
        ...data, items: data.items.map(item => item.id === post.id ? { ...item, ...result } : item),
      } : data);
      client.setQueryData(['post', post.id], data => data ? { ...data, ...result } : data);
    },
  });
  const open = (comments = false) => navigation.navigate('PostDetail', { postId: post.id, comments });
  const liked = post.myVote === 1;
  const sameTitle = post.excerpt && (post.excerpt.startsWith(post.title) || post.title.startsWith(post.excerpt.replace(/…$/, '')));
  return (
    <View style={s.articleRow}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Đọc bài ${post.title}`}
        onPress={() => open()} style={({ pressed }) => [s.postCopy, pressed && s.pressed]}>
        <View style={ui.between}>
          <View style={[ui.row, ui.fill]}>
            <Avatar name={post.authorName} size={40} tone="paper" />
            <View style={ui.fill}>
              <Text style={ui.label} numberOfLines={1}>{post.authorName || 'Thành viên VeggieAI'}</Text>
              <Text style={ui.small}>{formatPostDate(post.createdAt)}</Text>
            </View>
          </View>
          {mine ? <Badge label={postStatus(post)} tone={postStatusTone(post)} /> : null}
        </View>
        {!sameTitle && post.title ? <Text style={s.postTitle} numberOfLines={2}>{post.title}</Text> : null}
        {post.excerpt ? <Text style={s.excerpt} numberOfLines={4}>{post.excerpt}</Text> : null}
        {post.excerpt?.endsWith('…') ? <Text style={[ui.label, { color: c.primary }]}>Xem thêm</Text> : null}
      </Pressable>
      {mine && post.moderation?.note ? <Notice warning>{post.moderation.note}</Notice> : null}
      {post.mediaUrl ? <PostMedia key={post.mediaUrl} value={post.mediaUrl} video={post.postType === 'video'} /> : null}
      {post.recipeId && post.recipeTitle ? (
        <Pressable accessibilityRole="button" style={s.recipeAttach}
          onPress={() => navigation.navigate('RecipeDetail', { recipeId: post.recipeId })}>
          <BookOpen size={18} color={c.primary} />
          <View style={ui.fill}>
            <Text style={ui.small}>Công thức đính kèm</Text>
            <Text style={ui.label} numberOfLines={2}>{post.recipeTitle}</Text>
          </View>
          <ArrowUpRight size={17} color={c.primary} />
        </Pressable>
      ) : null}
      {post.status === 'published' ? (
        <>
          <View style={ui.between}>
            <Text style={ui.small}>{post.likeCount ?? post.score ?? 0} {post.likeCount == null ? 'điểm hữu ích' : 'lượt thích'}</Text>
            <Text style={ui.small}>{post.commentCount ?? 0} bình luận</Text>
          </View>
          <View style={s.actions}>
            <FeedAction icon={Heart} label={liked ? 'Đã thích' : 'Thích'} selected={liked} disabled={reaction.isPending}
              onPress={() => signedIn ? reaction.mutate() : navigation.navigate('Login')} />
            <FeedAction icon={MessageCircle} label="Bình luận" onPress={() => open(true)} />
          </View>
        </>
      ) : null}
      {mine && post.canEdit ? (
        <View style={s.actions}>
          <FeedAction icon={PenLine} label="Sửa bài" onPress={() => navigation.navigate('CreatePost', { postId: post.id })} />
        </View>
      ) : null}
      <Notice error>{reaction.error?.message}</Notice>
    </View>
  );
}

function FeedAction({ icon: Icon, label, onPress, selected, disabled }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [s.action, selected && s.actionSelected, pressed && s.pressed]}>
      <Icon size={18} color={selected ? c.terracotta : c.primary} fill={selected ? c.terracotta : 'none'} />
      <Text style={ui.label}>{label}</Text>
    </Pressable>
  );
}

export function CommunityScreen({ navigation, route }) {
  const signedIn = useAuthStore(state => !!state.token);
  const user = useAuthStore(state => state.user);
  const [mineRequested, setMine] = useState(false);
  const mine = signedIn && mineRequested;
  const [postType, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const showMyPostsAt = route.params?.showMyPostsAt;

  useEffect(() => {
    if (!signedIn || !showMyPostsAt) return;
    setMine(true);
    setPage(1);
  }, [signedIn, showMyPostsAt]);

  const query = useQuery({
    queryKey: ['posts', mine, page, keyword, postType, sort, user?.id ?? user?.email ?? (signedIn ? 'user' : 'guest')],
    queryFn: ({ signal }) => communityService.getPosts({ mine, page, keyword, postType, sort }, signal),
  });

  const posts = listOf(query.data).filter(post => mine || !isDemo(post));
  const pendingKeyword = search.trim() !== keyword;

  const submitSearch = () => {
    setKeyword(search.trim());
    setPage(1);
  };

  const toggleSort = () => {
    setSort(prev => (prev === 'newest' ? 'top' : 'newest'));
    setPage(1);
  };

  return (
    <Page
      title="Cộng đồng"
      tab
      keyboard
      refreshControl={
        <RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} colors={[c.terracotta]} />
      }
    >
      <SegmentedControl
        options={signedIn
          ? [['feed', 'Bảng tin'], ['video', 'Video'], ['mine', 'Bài của tôi']]
          : [['feed', 'Bảng tin'], ['video', 'Video']]}
        value={mine ? 'mine' : postType || 'feed'}
        onChange={val => {
          setMine(val === 'mine');
          setType(val === 'video' ? 'video' : '');
          setPage(1);
        }}
      />

      <View style={s.composer}>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate(signedIn ? 'CreatePost' : 'Login')}
          style={({ pressed }) => [ui.row, pressed && s.pressed]}>
          <Avatar name={user?.displayName || user?.name || 'VeggieAI'} size={40} tone="paper" />
          <Text style={s.prompt}>{signedIn ? 'Bạn muốn chia sẻ gì?' : 'Đăng nhập để viết bài'}</Text>
        </Pressable>
        <View style={s.actions}>
          <FeedAction icon={ImagePlus} label="Ảnh / video" onPress={() => navigation.navigate(signedIn ? 'CreatePost' : 'Login', signedIn ? { tool: 'file' } : undefined)} />
          <FeedAction icon={BookOpen} label="Công thức" onPress={() => navigation.navigate(signedIn ? 'CreatePost' : 'Login', signedIn ? { tool: 'recipe' } : undefined)} />
        </View>
      </View>
      {mine ? (
        <View style={s.reviewNote}>
          <Clock3 size={17} color={c.primary} />
          <Text style={[ui.small, ui.fill]}>Bài chờ duyệt chỉ hiện ở đây. Sau khi duyệt, bài sẽ lên bảng tin.</Text>
        </View>
      ) : null}

      {!mine ? (
        <View style={{ gap: 10 }}>
          <View style={s.searchRow}>
            <View style={ui.fill}>
              <SearchBar
                label="Tìm bài viết cộng đồng"
                placeholder="Tìm bài viết…"
                value={search}
                onChangeText={setSearch}
                onSubmit={submitSearch}
                onClear={() => {
                  setKeyword('');
                  setPage(1);
                }}
              />
            </View>
            {pendingKeyword ? (
              <Button title="Tìm" size="sm" variant="ink" onPress={submitSearch} />
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Đang xếp theo ${sort === 'newest' ? 'Mới nhất' : 'Nổi bật'}. Chạm để đổi`}
              accessibilityState={{ selected: sort === 'top' }}
              onPress={toggleSort}
              style={({ pressed }) => [s.sortBtn, sort === 'top' && s.sortSelected, pressed && { opacity: 0.72 }]}
            >
              <ArrowUpDown size={13} color={c.inkSoft} strokeWidth={1.9} />
            </Pressable>
          </View>
        </View>
      ) : null}

      <QueryState query={query} skeletonCount={3}>
        {!posts.length ? (
          <Empty
            icon={Users}
            title={mine ? 'Bạn chưa đăng bài viết nào' : 'Chưa có bài viết phù hợp'}
            detail={
              mine
                ? 'Chia sẻ một góc bếp hoặc công thức tâm đắc của bạn với mọi người.'
                : keyword || postType
                  ? 'Thử đổi từ khóa hoặc chọn lại bộ lọc.'
                  : undefined
            }
          >
            {mine ? (
              <Button title="Viết bài đầu tiên" icon={PenLine} onPress={() => navigation.navigate('CreatePost')} />
            ) : keyword || postType ? (
              <Button
                title="Xóa bộ lọc"
                variant="outline"
                onPress={() => {
                  setSearch('');
                  setKeyword('');
                  setType('');
                  setPage(1);
                }}
              />
            ) : null}
          </Empty>
        ) : (
          <View style={s.stream}>
            {posts.map(post => (
              <FeedCard key={post.id} post={post} mine={mine} navigation={navigation} signedIn={signedIn} />
            ))}
          </View>
        )}

        {(page > 1 || page < (query.data?.totalPages || 1)) && (
          <View style={ui.between}>
            <Button
              title="Trang trước"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onPress={() => setPage(page - 1)}
            />
            <Text style={ui.small}>
              Trang {page} / {query.data?.totalPages || 1}
            </Text>
            <Button
              title="Trang sau"
              variant="outline"
              size="sm"
              disabled={page >= (query.data?.totalPages || 1)}
              onPress={() => setPage(page + 1)}
            />
          </View>
        )}
      </QueryState>
    </Page>
  );
}

const s = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.lineStrong,
    backgroundColor: c.surface,
  },
  sortSelected: { backgroundColor: c.primaryLight, borderColor: c.primary },
  stream: { gap: 14 },
  composer: {
    padding: 10, gap: 8, backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.line, borderRadius: r.lg,
  },
  prompt: {
    flex: 1, minHeight: 44, paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: c.background, borderRadius: r.pill, color: c.muted, fontFamily: font.medium, fontSize: 14,
  },
  articleRow: {
    padding: 12, gap: 10, backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.line, borderRadius: r.lg,
  },
  postCopy: { gap: 8 },
  postTitle: { fontFamily: font.semi, fontSize: 17, lineHeight: 23, color: c.ink },
  excerpt: { fontFamily: font.regular, fontSize: 14.5, lineHeight: 22, color: c.inkSoft },
  reviewNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.turmericBg, padding: 12, borderRadius: r.md,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 3 },
  action: { flexGrow: 1, minHeight: 44, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingHorizontal: 8, borderRadius: r.sm },
  actionSelected: { backgroundColor: c.terracottaSoft },
  pressed: { opacity: 0.72 },
  recipeAttach: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: r.sm, backgroundColor: c.primarySoft,
  },
});
