import React, { useEffect, useState } from 'react';
import { Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ArrowUpDown, BookOpen, Film, Heart, MessageCircle, PenLine, Users } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { communityService } from '../../api/services/communityService';
import { imgUrl } from '../../api/client';
import { Button } from '../../components/ui/Button';
import {
  Avatar,
  Badge,
  Empty,
  Page,
  QueryState,
  SearchBar,
  SegmentedControl,
  ui,
} from '../../components/ui/Kit';
import { isImageMedia } from './PostMedia';
import { c, font, r } from '../../styles/theme';
import { formatPostDate, isDemo, listOf } from '../../styles/content.mjs';

export function postStatus(post) {
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

function PostCoverThumb({ uri }) {
  const [failed, setFailed] = useState(false);
  const resolved = imgUrl(uri);
  if (!resolved || failed) return null;
  return (
    <Image
      source={{ uri: resolved }}
      style={s.cardCover}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}

export function CommunityScreen({ navigation, route }) {
  const signedIn = useAuthStore(state => !!state.token);
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
    queryKey: ['posts', mine, page, keyword, postType, sort],
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
      action={
        <Button
          title="Viết bài"
          icon={PenLine}
          size="sm"
          variant="primary"
          onPress={() => navigation.navigate(signedIn ? 'CreatePost' : 'Login')}
        />
      }
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
            {posts.map((post, idx) => {
              const showCover = isImageMedia(post.mediaUrl, post.postType === 'video');
              const sameTitle = post.excerpt && (post.excerpt.startsWith(post.title) || post.title.startsWith(post.excerpt.replace(/…$/, '')));
              return (
                <Pressable
                  key={post.id}
                  accessibilityRole="button"
                  accessibilityLabel={'Đọc bài ' + post.title}
                  android_ripple={{ color: 'rgba(20,38,28,0.05)' }}
                  onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                  style={({ pressed }) => [
                    s.articleRow,
                    idx < posts.length - 1 && s.articleDivider,
                    pressed && { opacity: 0.78 },
                  ]}
                >
                  <View style={ui.between}>
                    <View style={[ui.row, ui.fill]}>
                      <Avatar name={post.authorName} size={28} tone="paper" />
                      <Text style={s.byline} numberOfLines={1}>
                        {post.authorName || 'Thành viên VeggieAI'}
                        <Text style={s.bylineDate}> · {formatPostDate(post.createdAt)}</Text>
                      </Text>
                    </View>
                    {mine ? (
                      <Badge label={postStatus(post)} tone={postStatusTone(post)} />
                    ) : post.postType === 'video' ? (
                      <Badge label="Video" tone="soft" icon={Film} />
                    ) : null}
                  </View>

                  {!sameTitle ? <Text style={s.postTitle} numberOfLines={2}>{post.title}</Text> : null}

                  {post.excerpt ? (
                    <Text style={s.excerpt} numberOfLines={3}>
                      {post.excerpt}
                    </Text>
                  ) : null}

                  {showCover ? <PostCoverThumb uri={post.mediaUrl} /> : null}

                  {mine && post.moderation?.note ? (
                    <View style={s.modNote}>
                      <Text style={s.modNoteText}>{post.moderation.note}</Text>
                    </View>
                  ) : null}

                  <View style={s.metaLine}>
                    <View style={s.recipeTag} accessible accessibilityLabel={`${post.likeCount ?? post.score ?? 0} ${post.likeCount == null ? 'điểm hữu ích' : 'lượt thích'}`}>
                      <Heart size={16} color={post.myVote === 1 ? c.terracotta : c.muted} fill={post.myVote === 1 ? c.terracotta : 'none'} />
                      <Text style={s.metaStat}>{post.likeCount ?? post.score ?? 0}</Text>
                    </View>
                    <View style={s.recipeTag} accessible accessibilityLabel={`${post.commentCount ?? 0} bình luận`}>
                      <MessageCircle size={16} color={c.muted} />
                      <Text style={s.metaStat}>{post.commentCount ?? 0}</Text>
                    </View>
                    {post.recipeId ? (
                      <View style={s.recipeTag}>
                        <BookOpen size={12} color={c.terracotta} strokeWidth={2} />
                        <Text style={s.recipeTagText} numberOfLines={1}>{post.recipeTitle || 'Công thức'}</Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
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
  stream: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
    borderRadius: r.xl,
    backgroundColor: c.surfaceElevated,
    overflow: 'hidden',
  },
  articleRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 9,
  },
  articleDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
  },
  byline: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: 13,
    color: c.inkSoft,
    includeFontPadding: false,
  },
  bylineDate: {
    fontFamily: font.regular,
    color: c.muted,
  },
  cardCover: {
    width: '100%',
    height: 176,
    borderRadius: r.md,
    backgroundColor: c.surfaceMuted,
  },
  postTitle: {
    fontFamily: font.semi,
    fontSize: 17,
    lineHeight: 23,
    color: c.ink,
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
  excerpt: {
    fontFamily: font.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: c.inkSoft,
    includeFontPadding: false,
  },
  modNote: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderLeftColor: c.turmeric,
    backgroundColor: c.turmericBg,
    borderRadius: r.xs,
  },
  modNoteText: {
    fontFamily: font.regular,
    fontSize: 12.5,
    color: '#784E0E',
    includeFontPadding: false,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 2,
  },
  metaStat: {
    fontFamily: font.regular,
    fontSize: 12.5,
    color: c.muted,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  recipeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  recipeTagText: {
    flexShrink: 1,
    fontFamily: font.medium,
    fontSize: 12.5,
    color: c.terracotta,
    includeFontPadding: false,
  },
});
