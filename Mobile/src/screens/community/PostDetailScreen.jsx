import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { ArrowDown, ArrowUp, BookOpen } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityService as api } from '../../api/services/communityService';
import { useAuthStore } from '../../store/useAuthStore';
import { Page, Title, QueryState, Field, Notice, Empty, Chip, RowLink, ui } from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { Readable } from '../../components/ui/Readable';
import { listOf, isDemo } from '../../styles/content.mjs';
import { PostMedia } from './PostMedia';
import { postStatus } from './CommunityScreen';

export function PostDetailScreen({ route, navigation }) {
  const id = route.params?.postId;
  const signedIn = useAuthStore(state => !!state.token);
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [comment, setComment] = useState('');
  const [report, setReport] = useState(false);
  const [category, setCategory] = useState('other');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const query = useQuery({ queryKey: ['post', id], queryFn: ({ signal }) => api.getPostById(id, signal), enabled: !!id });
  const post = query.data;
  const published = post?.status === 'published';
  const comments = useQuery({
    queryKey: ['comments', id, page], queryFn: ({ signal }) => api.getComments(id, page, signal), enabled: published,
  });
  const action = useMutation({
    mutationFn: ({ type, value }) => {
      if (type === 'vote') return api.vote(id, value);
      if (type === 'comment') return api.addComment(id, comment.trim());
      if (type === 'delete') return api.deletePost(id);
      return api.report({ targetId: id, targetType: 'post', category, reason: reason.trim() || null });
    },
    onSuccess: async (result, { type, value }) => {
      if (type === 'vote') client.setQueryData(['post', id], data => ({ ...data, score: result, myVote: value }));
      if (type === 'comment') {
        setComment('');
        await Promise.all([client.invalidateQueries({ queryKey: ['comments', id] }), client.invalidateQueries({ queryKey: ['post', id] })]);
        setFeedback('Đã gửi bình luận.');
      }
      if (type === 'report') {
        setReport(false); setReason(''); setFeedback('Đã gửi báo cáo.');
      }
      client.invalidateQueries({ queryKey: ['posts'] });
      if (type === 'delete') navigation.popToTop();
    },
  });
  const run = (type, extra = {}) => {
    if (!signedIn) return navigation.navigate('Login');
    if (!action.isPending) { setFeedback(''); action.mutate({ type, ...extra }); }
  };
  const back = () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs', { screen: 'CommunityTab' });

  return <Page title="Đọc bài" back={back} keyboard>
    {!id ? <Empty title="Thiếu mã bài viết" /> : <QueryState query={query}>
      {!post || (!post.canEdit && isDemo(post)) ? <Empty title="Bài viết chưa khả dụng" /> : <>
        <Title eyebrow={post.postType === 'video' ? 'Video cộng đồng' : 'Từ cộng đồng'} title={post.title} detail={post.authorName} />
        {!published && <Notice>{postStatus(post)}{post.moderation?.note ? '\n' + post.moderation.note : ''}</Notice>}
        <PostMedia key={post.mediaUrl} value={post.mediaUrl} video={post.postType === 'video'} />
        {!!(post.content || post.videoSummary) && <View style={ui.card}><Readable content={post.content || post.videoSummary} /></View>}
        {!!post.recipeId && <RowLink label={post.recipeTitle || 'Xem công thức đính kèm'} icon={BookOpen} onPress={() => navigation.navigate('RecipeDetail', { recipeId: post.recipeId })} />}
        <Notice error>{action.error?.message}</Notice>
        <Notice>{feedback}</Notice>
        {(post.canEdit || post.canDelete) && <View style={ui.row}>
          {post.canEdit && <Button title="Sửa bài" variant="secondary" disabled={action.isPending} onPress={() => navigation.navigate('CreatePost', { postId: id })} />}
          {post.canDelete && <Button title="Xóa bài" variant="outline" disabled={action.isPending} onPress={() => Alert.alert('Xóa bài viết?', 'Bài và bình luận của bài sẽ bị xóa.', [
            { text: 'Hủy', style: 'cancel' }, { text: 'Xóa bài', style: 'destructive', onPress: () => run('delete') },
          ])} />}
        </View>}
        {published && <>
          <View style={ui.row}>
            <Button title={post.myVote === 1 ? 'Đã đánh giá hữu ích' : 'Hữu ích'} icon={ArrowUp} variant="secondary" disabled={action.isPending}
              onPress={() => run('vote', { value: post.myVote === 1 ? 0 : 1 })} />
            <Button title={post.myVote === -1 ? 'Bỏ đánh giá' : 'Chưa hữu ích'} icon={ArrowDown} variant="outline" disabled={action.isPending}
              onPress={() => run('vote', { value: post.myVote === -1 ? 0 : -1 })} />
            <Text style={ui.small}>{post.score} điểm</Text>
          </View>
          {!post.canEdit && <Button title={report ? 'Đóng báo cáo' : 'Báo cáo bài'} variant="outline" disabled={action.isPending} onPress={() => signedIn ? setReport(!report) : navigation.navigate('Login')} />}
          {report && <View style={ui.card}>
            <Text style={ui.h2}>Lý do báo cáo</Text>
            <View style={ui.row}>{[['spam', 'Spam'], ['offensive', 'Xúc phạm'], ['inappropriate', 'Không phù hợp'], ['nutrition_misinformation', 'Sai lệch dinh dưỡng'], ['other', 'Khác']].map(([key, label]) =>
              <Chip key={key} label={label} selected={category === key} onPress={() => setCategory(key)} />)}</View>
            <Field label="Ghi chú (tùy chọn)" multiline maxLength={1000} value={reason} onChangeText={setReason} />
            <Button title="Gửi báo cáo" loading={action.isPending} onPress={() => run('report')} />
          </View>}
          <View style={ui.card}>
            <Text style={ui.h2}>Bình luận · {post.commentCount ?? listOf(comments.data).length}</Text>
            {signedIn ? <>
              <Field label="Viết bình luận" multiline maxLength={2000} value={comment} onChangeText={setComment} editable={!action.isPending} />
              <Button title="Gửi bình luận" disabled={!comment.trim() || action.isPending} onPress={() => run('comment')} />
            </> : <Button title="Đăng nhập để bình luận" variant="outline" onPress={() => navigation.navigate('Login')} />}
            <QueryState query={comments}>
              {!listOf(comments.data).length && <Text style={ui.small}>Chưa có bình luận.</Text>}
              {listOf(comments.data).map(entry => <View key={entry.id} style={ui.group}>
                <Text style={ui.label}>{entry.authorName}</Text>
                <Text style={ui.body}>{entry.content}</Text>
              </View>)}
              {(page > 1 || page < (comments.data?.totalPages || 1)) && <View style={ui.row}>
                <Button title="Trước" variant="outline" disabled={page === 1} onPress={() => setPage(page - 1)} />
                <Button title="Sau" variant="outline" disabled={page >= (comments.data?.totalPages || 1)} onPress={() => setPage(page + 1)} />
              </View>}
            </QueryState>
          </View>
        </>}
      </>}
    </QueryState>}
  </Page>;
}
