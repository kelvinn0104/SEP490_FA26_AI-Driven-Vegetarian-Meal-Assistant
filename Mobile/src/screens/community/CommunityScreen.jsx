import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, StyleSheet, RefreshControl } from 'react-native';
import { ArrowUpRight, MessageCircle, PenLine, Users } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { communityService } from '../../api/services/communityService';
import { Button } from '../../components/ui/Button';
import { Page, Title, Field, Chip, QueryState, Empty, ui } from '../../components/ui/Kit';
import { c } from '../../styles/theme';
import { listOf, isDemo } from '../../styles/content.mjs';

export function postStatus(post) {
  if (post.moderation?.decision === 'revision' && post.status !== 'published') return 'Cần chỉnh sửa';
  return ({ pending: 'Chờ duyệt', published: 'Đã đăng', removed: 'Đã gỡ', flagged: 'Đang xem xét' })[post.status] || post.status;
}

export function CommunityScreen({ navigation }) {
  const signedIn = useAuthStore(state => !!state.token);
  const [mine, setMine] = useState(false);
  const [postType, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['posts', mine, page, keyword, postType, sort],
    queryFn: ({ signal }) => communityService.getPosts({ mine, page, keyword, postType, sort }, signal),
  });
  const posts = listOf(query.data).filter(post => mine || !isDemo(post));
  return <Page title="Cộng đồng" tab refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} colors={[c.primary]} />}>
    <View style={s.masthead}>
      <View style={s.copy}>
        <Title title="Chuyện bếp" />
        <Button title="Viết bài" icon={PenLine} onPress={() => navigation.navigate(signedIn ? 'CreatePost' : 'Login')} />
      </View>
      <Image source={require('../../../assets/editorial-table.webp')} style={s.image} />
    </View>
    {signedIn && <View style={ui.row}>
      <Chip label="Bảng tin" selected={!mine} onPress={() => { setMine(false); setPage(1); }} />
      <Chip label="Bài của tôi" selected={mine} onPress={() => { setMine(true); setPage(1); }} />
    </View>}
    {!mine && <View style={ui.group}>
      <Field label="Tìm bài viết" value={search} onChangeText={setSearch} onSubmitEditing={() => { setKeyword(search.trim()); setPage(1); }} returnKeyType="search" maxLength={200} />
      <View style={ui.row}>
        <Button title="Tìm" variant="secondary" onPress={() => { setKeyword(search.trim()); setPage(1); }} />
        {!!keyword && <Button title="Xóa tìm kiếm" variant="outline" onPress={() => { setSearch(''); setKeyword(''); setPage(1); }} />}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {[['', 'Tất cả'], ['blog', 'Bài viết'], ['video', 'Video']].map(([value, label]) => <Chip key={value} label={label} selected={postType === value}
          onPress={() => { setType(value); setPage(1); }} />)}
        <Chip label={sort === 'top' ? 'Nổi bật' : 'Mới nhất'} selected={sort === 'top'} onPress={() => { setSort(sort === 'top' ? 'newest' : 'top'); setPage(1); }} />
      </ScrollView>
    </View>}
    <QueryState query={query}>
      {!posts.length && <Empty icon={Users} title={mine ? 'Bạn chưa có bài viết' : 'Chưa có bài phù hợp'} />}
      {posts.map(post => <Pressable key={post.id} style={({ pressed }) => [ui.card, pressed && { backgroundColor: c.primaryLight }]}
        accessibilityRole="button" accessibilityLabel={'Đọc ' + post.title} onPress={() => navigation.navigate('PostDetail', { postId: post.id })}>
        <View style={ui.between}><Text style={[ui.small, ui.fill]}>{post.authorName} · {post.postType === 'video' ? 'Video' : 'Bài viết'}</Text>
          {mine && <Text style={ui.small}>{postStatus(post)}</Text>}</View>
        <Text style={s.postTitle}>{post.title}</Text>
        {!!post.excerpt && <Text style={ui.body} numberOfLines={3}>{post.excerpt}</Text>}
        {!!post.moderation?.note && mine && <Text style={ui.small}>{post.moderation.note}</Text>}
        <View style={ui.between}>
          <View style={ui.row}><MessageCircle size={15} color={c.muted} /><Text style={ui.small}>{post.commentCount} bình luận · {post.score} điểm</Text></View>
          <ArrowUpRight size={18} color={c.primary} />
        </View>
      </Pressable>)}
      {(page > 1 || page < (query.data?.totalPages || 1)) && <View style={ui.row}>
        <Button title="Trang trước" variant="outline" disabled={page <= 1} onPress={() => setPage(page - 1)} />
        <Button title="Trang sau" variant="outline" disabled={page >= (query.data?.totalPages || 1)} onPress={() => setPage(page + 1)} />
      </View>}
    </QueryState>
  </Page>;
}

const s = StyleSheet.create({
  masthead: { flexDirection: 'row', borderRadius: 20, overflow: 'hidden', backgroundColor: c.stone },
  image: { width: '36%', height: '100%' },
  copy: { flex: 1, alignItems: 'flex-start', padding: 16, gap: 12 },
  postTitle: { fontFamily: 'serif', fontSize: 23, color: c.ink, fontWeight: '500' },
});
