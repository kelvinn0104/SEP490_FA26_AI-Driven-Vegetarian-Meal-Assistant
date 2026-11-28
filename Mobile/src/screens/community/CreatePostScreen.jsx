import React, { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BookOpen, Clock3, Film, ImagePlus, Link2, Send, X } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../../api/services/communityService';
import { recipeService } from '../../api/services/recipeService';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Avatar, Empty, Field, Notice, Page, QueryState, RowLink, SearchBar, SegmentedControl, ui,
} from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { PostMedia } from './PostMedia';
import { c, font, r } from '../../styles/theme';
import { fold, isDemo, listOf } from '../../styles/content.mjs';

export function CreatePostScreen({ navigation, route }) {
  const id = route.params?.postId;
  const existing = useQuery({
    queryKey: ['post', id],
    queryFn: ({ signal }) => communityService.getPostById(id, signal),
    enabled: !!id,
  });
  const [submitting, setSubmitting] = useState(false);

  return (
    <Page title={id ? 'Chỉnh sửa bài' : 'Tạo bài viết'} back={() => { if (!submitting) navigation.goBack(); }} keyboard>
      {id ? (
        <QueryState query={existing} skeletonCount={2}>
          {existing.data?.canEdit ? (
            <Composer key={id} post={existing.data} navigation={navigation} setSubmitting={setSubmitting} />
          ) : (
            <Empty title="Bạn không có quyền chỉnh sửa bài viết này" />
          )}
        </QueryState>
      ) : (
        <Composer tool={route.params?.tool} navigation={navigation} setSubmitting={setSubmitting} />
      )}
    </Page>
  );
}

function Composer({ post, tool, navigation, setSubmitting }) {
  const client = useQueryClient();
  const user = useAuthStore(state => state.user);
  const author = user?.displayName || user?.name || 'Bạn';
  const [postType, setType] = useState(post?.postType || 'blog');
  const [content, setContent] = useState(post?.content || '');
  const [media, setMedia] = useState(post?.mediaUrl || '');
  const [attachment, setAttachment] = useState(null);
  const [showLink, setShowLink] = useState(false);
  const [recipe, setRecipe] = useState(post?.recipeId ? { id: post.recipeId, title: post.recipeTitle } : null);
  const [picking, setPicking] = useState(tool === 'recipe');
  const [filter, setFilter] = useState('');
  const [fileError, setFileError] = useState('');
  const [saved, setSaved] = useState(null);
  const uploaded = useRef(null);

  const recipes = useQuery({
    queryKey: ['recipes'],
    queryFn: ({ signal }) => recipeService.getRecipes(signal),
    enabled: picking,
  });
  const choices = listOf(recipes.data)
    .filter(item => item.status === 'published' && !isDemo(item) && fold(item.title).includes(fold(filter)))
    .slice(0, 6);

  const mutation = useMutation({
    mutationFn: async () => {
      const text = content.trim();
      let mediaUrl = media.trim();
      let type = mediaUrl ? postType : 'blog';
      if (mediaUrl && mediaUrl !== post?.mediaUrl) {
        let valid = false;
        try {
          const url = new URL(mediaUrl);
          valid = url.protocol === 'https:' && !url.username && !url.password && !/\s/.test(mediaUrl);
        } catch { /* Invalid URL. */ }
        if (!valid) throw new Error('Nhập liên kết HTTPS hợp lệ cho ảnh hoặc video.');
      }

      if (attachment) {
        if (uploaded.current?.asset !== attachment) {
          uploaded.current = { asset: attachment, result: await communityService.uploadPostMedia(attachment) };
        }
        mediaUrl = uploaded.current.result.url;
        type = uploaded.current.result.kind === 'video' ? 'video' : 'blog';
      }
      if (!text && !mediaUrl) throw new Error('Viết nội dung hoặc đính kèm ảnh, video.');
      const firstLine = text.split('\n')[0].slice(0, 200);
      const oldFirstLine = post?.content?.trim().split('\n')[0].slice(0, 200);
      const body = {
        title: (post?.title && post.title !== oldFirstLine ? post.title : firstLine) ||
          (type === 'video' ? 'Video chia sẻ' : 'Ảnh chia sẻ'),
        content: text || null,
        mediaUrl: mediaUrl || null,
        recipeId: recipe?.id ?? null,
        postType: type,
      };
      const result = await (post ? communityService.updatePost(post.id, body) : communityService.createPost(body));
      if (!result?.id) throw new Error('Chưa xác nhận được bài viết đã gửi. Kiểm tra mục Bài của tôi.');
      return result;
    },
    onMutate: () => setSubmitting(true),
    onSettled: () => setSubmitting(false),
    onSuccess: result => {
      client.setQueryData(['post', result.id], result);
      client.invalidateQueries({ queryKey: ['posts'] });
      setSaved(result);
    },
  });
  const busy = mutation.isPending;

  async function pickAttachment() {
    setFileError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'], allowsEditing: false, quality: 1,
      });
      const asset = result.assets?.[0];
      if (result.canceled || !asset) return;
      const video = asset.type === 'video';
      const max = (video ? 50 : 8) * 1024 ** 2;
      if (asset.fileSize === 0 || asset.fileSize > max) {
        setFileError(video ? 'Video tối đa 50 MB.' : 'Ảnh tối đa 8 MB.');
        return;
      }
      setAttachment(asset);
      setMedia('');
      setShowLink(false);
      uploaded.current = null;
    } catch {
      setFileError('Chưa mở được thư viện ảnh và video. Thử lại nhé.');
    }
  }

  if (saved) {
    const published = saved.status === 'published';
    return (
      <View style={[ui.card, s.success]} accessibilityLiveRegion="polite">
        <View style={s.statusIcon}><Clock3 size={26} color={c.primary} /></View>
        <Text accessibilityRole="header" style={ui.h2}>{published ? 'Đã đăng bài' : 'Đã gửi duyệt'}</Text>
        <Text style={[ui.body, s.center]}>{published ? 'Bài đã xuất hiện trên bảng tin.' : 'Bài sẽ xuất hiện trên bảng tin sau khi được duyệt.'}</Text>
        <Button title="Bài của tôi" onPress={() => navigation.popTo('MainTabs', {
          screen: 'CommunityTab', params: { showMyPostsAt: Date.now() },
        })} />
        <Button title="Xem bài" variant="outline" onPress={() => navigation.replace('PostDetail', { postId: saved.id })} />
      </View>
    );
  }

  return (
    <>
      <View style={ui.card}>
        <View style={ui.row}>
          <Avatar name={author} size={42} tone="paper" />
          <View style={ui.fill}>
            <Text style={ui.label}>{author}</Text>
            <Text style={ui.small}>Hiển thị sau khi duyệt</Text>
          </View>
        </View>
        {tool === 'file' && !attachment && !media.trim() && !showLink ? (
          <Button title="Chọn ảnh hoặc video từ máy" icon={ImagePlus} variant="outline" disabled={busy} onPress={pickAttachment} />
        ) : null}
        <TextInput
          accessibilityLabel="Nội dung bài viết"
          placeholder="Bạn muốn chia sẻ gì?"
          placeholderTextColor={c.muted}
          multiline
          maxLength={20000}
          value={content}
          onChangeText={setContent}
          editable={!busy}
          style={s.input}
        />
        {attachment || (media.trim() && !showLink) ? (
          <View style={s.attachment}>
            {attachment ? (
              attachment.type === 'video' ? <View style={ui.row}>
                <Film size={20} color={c.primary} /><Text numberOfLines={1} style={[ui.label, ui.fill]}>{attachment.fileName || 'Video đã chọn'}</Text>
              </View> : <Image accessibilityLabel="Xem trước ảnh" source={{ uri: attachment.uri }} style={s.preview} />
            ) : <PostMedia key={media} value={media} video={postType === 'video'} height={156} />}
            <Pressable accessibilityRole="button" accessibilityLabel="Bỏ tệp đính kèm" disabled={busy}
              style={s.close} onPress={() => { setAttachment(null); setMedia(''); uploaded.current = null; }}>
              <X size={18} color={c.ink} />
            </Pressable>
          </View>
        ) : null}
        {showLink ? (
          <>
            <Field label="Liên kết ảnh hoặc video" autoCapitalize="none" keyboardType="url" placeholder="https://…"
              maxLength={500} value={media} onChangeText={setMedia} editable={!busy} />
            <SegmentedControl options={[[ 'blog', 'Ảnh' ], [ 'video', 'Video' ]]} value={postType} onChange={setType} disabled={busy} />
          </>
        ) : null}
        {recipe ? (
          <View style={s.attachedChip}>
            <BookOpen size={18} color={c.primary} />
            <Text style={[ui.label, ui.fill]} numberOfLines={2}>{recipe.title || 'Công thức đã gắn'}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Bỏ công thức" disabled={busy} style={s.iconButton} onPress={() => setRecipe(null)}>
              <X size={17} color={c.ink} />
            </Pressable>
          </View>
        ) : null}
        <View style={s.tools}>
          <Button title="Ảnh / video" icon={ImagePlus} variant="ghost" size="sm" style={s.toolButton} disabled={busy} onPress={pickAttachment} />
          <Button title="Liên kết" icon={Link2} variant="ghost" size="sm" style={s.toolButton} disabled={busy || !!attachment} onPress={() => setShowLink(!showLink)} />
          <Button title="Công thức" icon={BookOpen} variant="ghost" size="sm" style={s.toolButton} disabled={busy} onPress={() => setPicking(!picking)} />
        </View>
        {picking ? (
          <View style={s.pickerBox}>
            <SearchBar label="Tìm công thức đính kèm" placeholder="Tìm công thức đã duyệt…" value={filter} onChangeText={setFilter} />
            <QueryState query={recipes}>
              {choices.length ? choices.map((item, idx) => (
                <RowLink key={item.id} border={idx < choices.length - 1} label={item.title} onPress={() => {
                  if (busy) return;
                  const numericId = Number(String(item.id).replace(/^r/i, ''));
                  if (Number.isInteger(numericId) && numericId > 0 && numericId <= 2147483647) {
                    setRecipe({ id: numericId, title: item.title });
                    setPicking(false);
                  }
                }} />
              )) : <Text style={ui.small}>Chưa có công thức phù hợp.</Text>}
            </QueryState>
          </View>
        ) : null}
      </View>
      <Notice error>{fileError || mutation.error?.message}</Notice>
      <Button title={post ? 'Lưu và gửi duyệt lại' : 'Gửi duyệt'} icon={Send} loading={busy}
        disabled={busy || (!content.trim() && !media.trim() && !attachment)}
        onPress={() => mutation.mutate()} />
    </>
  );
}

const s = StyleSheet.create({
  input: { minHeight: 112, fontFamily: font.regular, fontSize: 16, lineHeight: 24, textAlignVertical: 'top', color: c.ink, paddingVertical: 8 },
  attachment: { padding: 8, paddingRight: 48, backgroundColor: c.surfaceMuted, borderRadius: r.md },
  preview: { width: '100%', height: 156, borderRadius: r.sm, resizeMode: 'contain' },
  iconButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  close: { position: 'absolute', right: 4, top: 4, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  attachedChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 12, borderRadius: r.md, backgroundColor: c.primarySoft },
  pickerBox: { gap: 8, padding: 12, borderRadius: r.md, backgroundColor: c.background },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: c.line },
  toolButton: { minHeight: 44, paddingHorizontal: 5, flexGrow: 1 },
  success: { alignItems: 'stretch', padding: 20 },
  statusIcon: { backgroundColor: c.primaryLight, alignSelf: 'flex-start', padding: 12, borderRadius: r.pill },
  center: { marginBottom: 4 },
});
