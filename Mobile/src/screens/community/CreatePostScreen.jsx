import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BookOpen, Link2, Send, X } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../../api/services/communityService';
import { recipeService } from '../../api/services/recipeService';
import {
  Chip,
  Empty,
  Field,
  Notice,
  Page,
  QueryState,
  RowLink,
  SearchBar,
  SegmentedControl,
  ui,
} from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { Readable } from '../../components/ui/Readable';
import { PostMedia } from './PostMedia';
import { c, r } from '../../styles/theme';
import { fold, isDemo, listOf } from '../../styles/content.mjs';

export function CreatePostScreen({ navigation, route }) {
  const id = route.params?.postId;
  const existing = useQuery({
    queryKey: ['post', id],
    queryFn: ({ signal }) => communityService.getPostById(id, signal),
    enabled: !!id,
  });

  return (
    <Page title={id ? 'Chỉnh sửa bài' : 'Viết bài mới'} back={navigation.goBack} keyboard>
      {id ? (
        <QueryState query={existing} skeletonCount={2}>
          {existing.data?.canEdit ? (
            <Composer key={id} post={existing.data} navigation={navigation} />
          ) : (
            <Empty title="Bạn không có quyền chỉnh sửa bài viết này" />
          )}
        </QueryState>
      ) : (
        <Composer navigation={navigation} />
      )}
    </Page>
  );
}

function Composer({ post, navigation }) {
  const client = useQueryClient();
  const [postType, setType] = useState(post?.postType || 'blog');
  const [title, setTitle] = useState(
    post?.title !== post?.content?.trim().split('\n')[0]?.slice(0, 200) ? post?.title || '' : ''
  );
  const [content, setContent] = useState(post?.content || '');
  const [media, setMedia] = useState(post?.mediaUrl || '');
  const [showTitle, setShowTitle] = useState(!!title);
  const [showMedia, setShowMedia] = useState(!!media || postType === 'video');
  const [recipe, setRecipe] = useState(
    post?.recipeId ? { id: post.recipeId, title: post.recipeTitle } : null
  );
  const [picking, setPicking] = useState(false);
  const [filter, setFilter] = useState('');
  const [mode, setMode] = useState('edit');

  const recipes = useQuery({
    queryKey: ['recipes'],
    queryFn: ({ signal }) => recipeService.getRecipes(signal),
    enabled: picking,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (postType === 'blog' && !content.trim()) {
        throw new Error('Nhập nội dung bài viết.');
      }
      const url = media.trim();
      const existingUpload = url === post?.mediaUrl && url.startsWith('/uploads/');
      if ((postType === 'video' || url) && !existingUpload && !/^https:\/\/[^\s/@]+(?:[/?#][^\s]*)?$/i.test(url)) {
        throw new Error('Nhập liên kết HTTPS hợp lệ cho ảnh hoặc video.');
      }
      const body = {
        title: title.trim() || content.trim().split('\n')[0].slice(0, 200) || 'Video chia sẻ',
        content: content.trim() || null,
        mediaUrl: url || null,
        recipeId: recipe?.id ?? null,
      };
      return post
        ? communityService.updatePost(post.id, body)
        : communityService.createPost({ ...body, postType });
    },
    onSuccess: data => {
      if (!data?.id) throw new Error('Chưa xác nhận được bài viết đã gửi. Kiểm tra mục Bài của tôi.');
      client.setQueryData(['post', data.id], data);
      client.invalidateQueries({ queryKey: ['posts'] });
      navigation.replace('PostDetail', { postId: data.id });
    },
  });

  const preview = mode === 'preview';
  const canSubmit =
    (postType === 'blog' ? !!content.trim() : !!media.trim()) && !mutation.isPending;

  return (
    <>
      <Notice error>{mutation.error?.message}</Notice>

      <SegmentedControl
        options={[
          ['edit', 'Soạn thảo'],
          ['preview', 'Xem trước'],
        ]}
        value={mode}
        disabled={mutation.isPending}
        onChange={setMode}
      />

      {!post && !preview ? (
        <View style={ui.row}>
          <Chip
            label="Bài viết"
            selected={postType === 'blog'}
            disabled={mutation.isPending}
            onPress={() => setType('blog')}
          />
          <Chip
            label="Video"
            selected={postType === 'video'}
            disabled={mutation.isPending}
            onPress={() => { setType('video'); setShowMedia(true); }}
          />
        </View>
      ) : null}

      <View style={ui.card}>
        {preview ? (
          <View style={{ gap: 12 }}>
            {title.trim() ? <Text style={ui.h2}>{title.trim()}</Text> : null}
            {media.trim() ? (
              <PostMedia key={media} value={media} video={postType === 'video'} />
            ) : null}
            {content.trim() ? (
              <Readable content={content} />
            ) : (
              <Text style={ui.body}>Chưa có nội dung bài viết.</Text>
            )}
          </View>
        ) : (
          <>
            <Field
              label={postType === 'video' ? 'Mô tả (tùy chọn)' : 'Nội dung'}
              placeholder="Bạn muốn chia sẻ gì?"
              multiline
              maxLength={20000}
              value={content}
              onChangeText={setContent}
              editable={!mutation.isPending}
            />
            {showTitle ? <Field label="Tiêu đề (tùy chọn)" maxLength={200} value={title}
              onChangeText={setTitle} editable={!mutation.isPending} /> : (
              <Button title="Thêm tiêu đề" variant="ghost" size="sm" onPress={() => setShowTitle(true)} />
            )}
            {showMedia || postType === 'video' ? <Field
              label={postType === 'video' ? 'Liên kết video' : 'Liên kết ảnh'}
              autoCapitalize="none"
              keyboardType="url"
              placeholder="https://..."
              maxLength={500}
              value={media}
              onChangeText={setMedia}
              editable={!mutation.isPending}
            /> : (
              <Button title="Thêm liên kết ảnh" icon={Link2} variant="outline" size="sm" onPress={() => setShowMedia(true)} />
            )}
          </>
        )}

        {/* Recipe Attachment */}
        {recipe ? (
          <View style={s.attachedChip}>
            <BookOpen size={17} color={c.primaryDark} />
            <Text style={[ui.label, ui.fill]} numberOfLines={1}>
              {recipe.title || 'Công thức đã gắn'}
            </Text>
            {!preview ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Bỏ công thức đính kèm" hitSlop={8} onPress={() => setRecipe(null)}>
                <X size={16} color={c.muted} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {!preview ? (
          <Button
            title={picking ? 'Đóng' : recipe ? 'Đổi công thức' : 'Gắn công thức'}
            icon={BookOpen}
            variant="outline"
            size="sm"
            disabled={mutation.isPending}
            onPress={() => setPicking(!picking)}
          />
        ) : null}

        {!preview && picking ? (
          <View style={s.pickerBox}>
            <SearchBar
              label="Tìm công thức đính kèm"
              placeholder="Gõ tên món để gắn vào bài…"
              value={filter}
              onChangeText={setFilter}
            />
            <QueryState query={recipes}>
              {listOf(recipes.data)
                .filter(item => item.status === 'published' && !isDemo(item) && fold(item.title).includes(fold(filter)))
                .slice(0, 6)
                .map((item, idx, arr) => (
                  <RowLink
                    key={item.id}
                    border={idx < arr.length - 1}
                    label={item.title}
                    onPress={() => {
                      const numericId = Number(String(item.id).replace(/^r/i, ''));
                      if (Number.isInteger(numericId) && numericId > 0 && numericId <= 2147483647) {
                        setRecipe({ id: numericId, title: item.title });
                        setPicking(false);
                      }
                    }}
                  />
                ))}
            </QueryState>
          </View>
        ) : null}
      </View>

      <Button
        title={post ? 'Lưu và gửi duyệt lại' : 'Gửi duyệt bài viết'}
        icon={Send}
        loading={mutation.isPending}
        disabled={!canSubmit}
        onPress={() => mutation.mutate()}
      />
    </>
  );
}

const s = StyleSheet.create({
  attachedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: r.md,
    backgroundColor: c.surfaceMuted,
  },
  pickerBox: {
    gap: 8,
    padding: 12,
    borderRadius: r.md,
    backgroundColor: c.background,
  },
});
