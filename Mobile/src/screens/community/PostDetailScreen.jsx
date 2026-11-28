import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  ArrowUpRight,
  BookOpen,
  Flag,
  Heart,
  MessageCircle,
  PenLine,
  Send,
  Trash2,
} from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityService as api } from '../../api/services/communityService';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Avatar,
  Chip,
  Empty,
  Field,
  Notice,
  Page,
  QueryState,
  SectionHeader,
  ui,
} from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/Header';
import { Readable } from '../../components/ui/Readable';
import { c, font, r } from '../../styles/theme';
import { formatPostDate, isDemo, listOf } from '../../styles/content.mjs';
import { PostMedia } from './PostMedia';
import { postStatus } from './CommunityScreen';

export function PostDetailScreen({ route, navigation }) {
  const id = route.params?.postId;
  const signedIn = useAuthStore(state => !!state.token);
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [comment, setComment] = useState('');
  const [report, setReport] = useState(null);
  const [editing, setEditing] = useState(null);
  const [category, setCategory] = useState('other');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');

  const query = useQuery({
    queryKey: ['post', id],
    queryFn: ({ signal }) => api.getPostById(id, signal),
    enabled: !!id,
  });

  const post = query.data;
  const published = post?.status === 'published';

  const comments = useQuery({
    queryKey: ['comments', id, page],
    queryFn: ({ signal }) => api.getComments(id, page, signal),
    enabled: published,
  });

  const action = useMutation({
    mutationFn: async ({ type, entryId }) => {
      if (type === 'like') return api.setLike(post, post.myVote !== 1);
      if (type === 'comment' || type === 'edit-comment') {
        const result = type === 'comment' ? await api.addComment(id, comment.trim())
          : await api.updateComment(editing.id, editing.content.trim());
        if (!result?.id) throw new Error('Chưa xác nhận được bình luận.');
        return result;
      }
      if (type === 'delete' || type === 'delete-comment') {
        const removed = type === 'delete' ? await api.deletePost(id) : await api.deleteComment(entryId);
        if (removed !== true) throw new Error('Chưa xác nhận được nội dung đã xóa.');
        return;
      }
      const result = await api.report({ targetId: report.id, targetType: report.type, category, reason: reason.trim() || null });
      if (!result?.id) throw new Error('Chưa xác nhận được báo cáo.');
      return result;
    },
    onSuccess: async (result, { type }) => {
      if (type === 'like') {
        client.setQueryData(['post', id], data => ({ ...data, ...result }));
      }
      if (['comment', 'edit-comment', 'delete-comment'].includes(type)) {
        if (type === 'comment') {
          setComment('');
        } else if (type === 'edit-comment') {
          setEditing(null);
        } else if (commentItems.length === 1 && page > 1) {
          setPage(page - 1);
        }
        await Promise.all([
          client.invalidateQueries({ queryKey: ['comments', id] }),
          client.invalidateQueries({ queryKey: ['post', id] }),
        ]);
        setFeedback({ comment: 'Đã gửi bình luận.', 'edit-comment': 'Đã sửa bình luận.', 'delete-comment': 'Đã xóa bình luận.' }[type]);
      }
      if (type === 'report') {
        setReport(null);
        setReason('');
        setFeedback('Đã ghi nhận báo cáo để kiểm duyệt.');
      }
      client.invalidateQueries({ queryKey: ['posts'] });
      if (type === 'delete') navigation.popToTop();
    },
  });

  const run = (type, extra = {}) => {
    if (!signedIn) return navigation.navigate('Login');
    if (!action.isPending) {
      setFeedback('');
      action.mutate({ type, ...extra });
    }
  };

  function openReport(type, targetId) {
    if (!signedIn) return navigation.navigate('Login');
    action.reset();
    setFeedback('');
    setCategory('other');
    setReason('');
    setReport({ type, id: targetId });
  }

  const back = () =>
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs', { screen: 'CommunityTab' });

  const commentItems = listOf(comments.data);
  const totalComments = Math.max(Number(post?.commentCount) || 0, commentItems.length);
  const validPost = post && (post.canEdit || !isDemo(post));

  const reportForm = report && (
    <View style={[ui.card, { borderColor: c.errorBorder }]}>
      <SectionHeader
        title={report.type === 'comment' ? 'Báo cáo bình luận' : 'Báo cáo bài viết'}
        actionLabel="Đóng"
        onAction={() => { if (!action.isPending) setReport(null); }}
      />
      <View style={[ui.row, { flexWrap: 'wrap' }]}>
        {[
          ['spam', 'Spam'],
          ['offensive', 'Xúc phạm'],
          ['inappropriate', 'Không phù hợp'],
          ['nutrition_misinformation', 'Sai lệch dinh dưỡng'],
          ['other', 'Khác'],
        ].map(([key, label]) => (
          <Chip
            key={key}
            label={label}
            selected={category === key}
            onPress={() => setCategory(key)}
          />
        ))}
      </View>
      <Field
        label="Mô tả thêm (tùy chọn)"
        multiline
        maxLength={1000}
        value={reason}
        onChangeText={setReason}
      />
      <Button
        title="Gửi báo cáo"
        variant="danger"
        loading={action.isPending && action.variables?.type === 'report'}
        onPress={() => run('report')}
      />
    </View>

  );

  return (
    <Page
      title="Bài viết"
      back={back}
      keyboard
      action={
        validPost ? (
          <View style={ui.row}>
            {post.canEdit ? (
              <IconButton
                label="Chỉnh sửa bài viết"
                icon={PenLine}
                tone="plain"
                disabled={action.isPending}
                onPress={() => navigation.navigate('CreatePost', { postId: id })}
              />
            ) : null}
            {post.canDelete ? (
              <IconButton
                label="Xóa bài viết"
                icon={Trash2}
                tone="plain"
                disabled={action.isPending}
                onPress={() =>
                  Alert.alert('Xóa bài viết?', 'Bài viết và toàn bộ bình luận sẽ bị xóa vĩnh viễn.', [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Xóa bài', style: 'destructive', onPress: () => run('delete') },
                  ])
                }
              />
            ) : null}
            {published && !post.canEdit ? (
              <IconButton
                label={report ? 'Đóng báo cáo' : 'Báo cáo bài viết'}
                icon={Flag}
                tone={report ? 'soft' : 'plain'}
                disabled={action.isPending}
                onPress={() => report ? setReport(null) : openReport('post', id)}
              />
            ) : null}
          </View>
        ) : null
      }
    >
      {!id ? (
        <Empty title="Thiếu mã bài viết" />
      ) : (
        <QueryState query={query} skeletonCount={2}>
          {!validPost ? (
            <Empty title="Bài viết chưa khả dụng" detail="Bài viết có thể đang chờ duyệt hoặc đã được gỡ." />
          ) : (
            <>
              <View style={ui.card}>
                <View style={s.authorRow}>
                  <Avatar name={post.authorName} size={36} tone="terracotta" />
                  <View style={ui.fill}>
                    <Text style={ui.label}>{post.authorName || 'Thành viên VeggieAI'}</Text>
                    <Text style={ui.small}>{formatPostDate(post.createdAt)}</Text>
                  </View>
                </View>
                {post.content?.trim().split('\n')[0]?.slice(0, 200) !== post.title ? (
                  <Text accessibilityRole="header" style={ui.h2}>{post.title}</Text>
                ) : null}
              </View>

              {!published ? (
                <Notice warning>
                  {postStatus(post)}
                  {post.moderation?.note ? '\n' + post.moderation.note : ''}
                </Notice>
              ) : null}

              {post.content || post.videoSummary ? (
                <View style={s.articleBody}>
                  <Readable content={post.content || post.videoSummary} />
                </View>
              ) : null}

              <PostMedia key={post.mediaUrl} value={post.mediaUrl} video={post.postType === 'video'} />

              {post.recipeId && post.recipeTitle ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('RecipeDetail', { recipeId: post.recipeId })}
                  style={({ pressed }) => [s.recipeAttach, pressed && { opacity: 0.82 }]}
                >
                  <BookOpen size={19} color={c.terracotta} strokeWidth={1.9} />
                  <View style={ui.fill}>
                    <Text style={s.recipeAttachTitle} numberOfLines={2}>
                      {post.recipeTitle}
                    </Text>
                  </View>
                  <ArrowUpRight size={18} color={c.terracotta} />
                </Pressable>
              ) : null}

              <Notice error>{action.error?.message}</Notice>
              <Notice success>{feedback}</Notice>

              {published && (
                <>
                  <View style={s.voteBar}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${post.myVote === 1 ? 'Bỏ thích' : 'Thích'}, ${post.likeCount ?? post.score ?? 0} ${post.likeCount == null ? 'điểm hữu ích' : 'lượt thích'}`}
                      accessibilityState={{ selected: post.myVote === 1 }}
                      disabled={action.isPending}
                      onPress={() => run('like')}
                      style={[s.votePill, post.myVote === 1 && s.votePillActive]}
                    >
                      <Heart size={18} color={c.terracotta} fill={post.myVote === 1 ? c.terracotta : 'none'} />
                      <Text style={s.voteText}>{post.myVote === 1 ? 'Đã thích' : 'Thích'} · {post.likeCount ?? post.score ?? 0}</Text>
                    </Pressable>

                    <View style={[ui.row, { marginLeft: 'auto' }]}>
                      <MessageCircle size={15} color={c.muted} />
                      <Text style={ui.small}>{totalComments} bình luận</Text>
                    </View>
                  </View>

                  {report?.type === 'post' ? reportForm : null}

                  <View style={s.comments}>
                    <SectionHeader title="Bình luận" count={`${totalComments}`} />

                    {signedIn ? (
                      <View style={s.commentComposer}>
                        <TextInput
                          accessibilityLabel="Viết bình luận"
                          autoFocus={!!route.params?.comments}
                          placeholder="Chia sẻ cảm nhận hoặc mẹo nấu của bạn…"
                          placeholderTextColor={c.subtle}
                          multiline
                          maxLength={2000}
                          value={comment}
                          onChangeText={setComment}
                          editable={!action.isPending}
                          selectionColor={c.terracotta}
                          style={s.commentInput}
                        />
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Gửi bình luận"
                          disabled={!comment.trim() || action.isPending}
                          onPress={() => run('comment')}
                          style={[
                            s.commentSend,
                            (!comment.trim() || action.isPending) && { opacity: 0.38 },
                          ]}
                        >
                          <Send size={16} color="#FFFEFA" strokeWidth={2} />
                        </Pressable>
                      </View>
                    ) : (
                      <Button
                        title="Đăng nhập để tham gia thảo luận"
                        variant="outline"
                        onPress={() => navigation.navigate('Login')}
                      />
                    )}

                    <QueryState query={comments}>
                      {!commentItems.length ? (
                        <Text style={[ui.small, { paddingVertical: 6 }]}>
                          Chưa có bình luận nào. Hãy mở lời đầu tiên.
                        </Text>
                      ) : (
                        <View style={{ gap: 12, paddingTop: 4 }}>
                          {commentItems.map((entry, idx) => (
                            <View
                              key={entry.id}
                              style={[s.commentItem, idx === commentItems.length - 1 && { borderBottomWidth: 0 }]}
                            >
                              <Avatar name={entry.authorName} size={30} tone="paper" />
                              <View style={[ui.fill, { gap: 3 }]}>
                                <View style={[ui.between, { flexWrap: 'wrap' }]}>
                                  <Text style={ui.label}>{entry.authorName}</Text>
                                  <Text style={ui.small}>{formatPostDate(entry.createdAt)}</Text>
                                </View>
                                {editing?.id === entry.id ? (
                                  <View style={{ gap: 6 }}>
                                    <Field label="Sửa bình luận" multiline maxLength={2000}
                                      value={editing.content} editable={!action.isPending}
                                      onChangeText={content => setEditing({ ...editing, content })} />
                                    <View style={ui.row}>
                                      <Button title="Hủy" size="sm" variant="ghost" disabled={action.isPending} onPress={() => setEditing(null)} />
                                      <Button title="Lưu" size="sm" disabled={!editing.content.trim() || action.isPending} onPress={() => run('edit-comment')} />
                                    </View>
                                  </View>
                                ) : (
                                  <View style={{ gap: 4 }}>
                                    <Text style={s.commentBody}>{entry.content}</Text>
                                    {signedIn && <View style={[ui.row, { flexWrap: 'wrap' }]}>
                                      {entry.canEdit ? <Button title="Sửa" variant="ghost" size="sm" disabled={action.isPending}
                                        onPress={() => setEditing({ id: entry.id, content: entry.content })} /> : null}
                                      {entry.canDelete ? <Button title="Xóa" variant="ghost" size="sm" disabled={action.isPending}
                                        onPress={() => Alert.alert('Xóa bình luận?', 'Bình luận sẽ được gỡ khỏi bài viết.', [
                                          { text: 'Hủy', style: 'cancel' },
                                          { text: 'Xóa', style: 'destructive', onPress: () => run('delete-comment', { entryId: entry.id }) },
                                        ])} /> : null}
                                      {!entry.canEdit && !entry.canDelete ? <Button title="Báo cáo" variant="ghost" size="sm" disabled={action.isPending}
                                        onPress={() => openReport('comment', entry.id)} /> : null}
                                    </View>}
                                  </View>
                                )}
                                {report?.type === 'comment' && report.id === entry.id ? reportForm : null}
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {(page > 1 || page < (comments.data?.totalPages || 1)) && (
                        <View style={ui.between}>
                          <Button
                            title="Trước"
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onPress={() => setPage(page - 1)}
                          />
                          <Text style={ui.small}>
                            Trang {page} / {comments.data?.totalPages || 1}
                          </Text>
                          <Button
                            title="Sau"
                            variant="outline"
                            size="sm"
                            disabled={page >= (comments.data?.totalPages || 1)}
                            onPress={() => setPage(page + 1)}
                          />
                        </View>
                      )}
                    </QueryState>
                  </View>
                </>
              )}
            </>
          )}
        </QueryState>
      )}
    </Page>
  );
}

const s = StyleSheet.create({
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
  },
  articleBody: {
    paddingVertical: 4,
  },
  recipeAttach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: r.md,
    borderLeftWidth: 3,
    borderLeftColor: c.terracotta,
    backgroundColor: c.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  recipeAttachTitle: {
    fontFamily: font.serifBold,
    fontSize: 16,
    color: c.ink,
    includeFontPadding: false,
  },
  voteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
  },
  votePill: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    borderRadius: r.pill,
    borderWidth: 1,
    borderColor: c.lineStrong,
    backgroundColor: c.surface,
  },
  votePillActive: {
    backgroundColor: c.terracottaSoft,
    borderColor: c.terracottaSoft,
  },
  voteText: {
    fontFamily: font.medium,
    fontSize: 13,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  comments: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.line },
  commentComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 7,
    paddingLeft: 13,
    borderRadius: r.lg,
    borderWidth: 1,
    borderColor: c.lineStrong,
    backgroundColor: c.surfaceElevated,
  },
  commentInput: {
    flex: 1,
    minHeight: 38,
    maxHeight: 110,
    fontFamily: font.regular,
    fontSize: 14.5,
    color: c.ink,
    paddingVertical: 6,
    includeFontPadding: false,
    outlineStyle: 'none',
  },
  commentSend: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  commentBody: {
    fontFamily: font.regular,
    fontSize: 14.5,
    lineHeight: 21,
    color: c.inkSoft,
    includeFontPadding: false,
  },
});
