import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../../api/services/communityService';
import { recipeService } from '../../api/services/recipeService';
import { Page, Title, Field, Chip, QueryState, Empty, Notice, RowLink, ui } from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { Readable } from '../../components/ui/Readable';
import { PostMedia } from './PostMedia';
import { listOf, isDemo, fold } from '../../styles/content.mjs';

export function CreatePostScreen({ navigation, route }) {
  const id = route.params?.postId;
  const existing = useQuery({ queryKey: ['post', id], queryFn: ({ signal }) => communityService.getPostById(id, signal), enabled: !!id });
  return <Page title={id ? 'Sửa bài' : 'Viết bài'} back={navigation.goBack} keyboard>
    {id ? <QueryState query={existing}>
      {existing.data?.canEdit ? <Composer key={id} post={existing.data} navigation={navigation} /> : <Empty title="Bạn không có quyền sửa bài này" />}
    </QueryState> : <Composer navigation={navigation} />}
  </Page>;
}

function Composer({ post, navigation }) {
  const client = useQueryClient();
  const [postType, setType] = useState(post?.postType || 'blog');
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [media, setMedia] = useState(post?.mediaUrl || '');
  const [recipe, setRecipe] = useState(post?.recipeId ? { id: post.recipeId, title: post.recipeTitle } : null);
  const [picking, setPicking] = useState(false);
  const [filter, setFilter] = useState('');
  const [preview, setPreview] = useState(false);
  const recipes = useQuery({ queryKey: ['recipes'], queryFn: ({ signal }) => recipeService.getRecipes(signal), enabled: picking });
  const mutation = useMutation({
    mutationFn: () => {
      if (!title.trim() || (postType === 'blog' && !content.trim())) throw new Error('Nhập tiêu đề và nội dung bài.');
      const url = media.trim();
      if ((postType === 'video' || url) && !/^https:\/\/[^\s/@]+(?:[/?#][^\s]*)?$/i.test(url)) throw new Error('Nhập liên kết HTTPS hợp lệ.');
      const body = { title: title.trim(), content: content.trim() || null, mediaUrl: url || null, recipeId: recipe?.id ?? null };
      return post ? communityService.updatePost(post.id, body) : communityService.createPost({ ...body, postType });
    },
    onSuccess: data => {
      if (!data?.id) throw new Error('Chưa xác nhận được bài viết đã gửi. Kiểm tra Bài của tôi.');
      client.setQueryData(['post', data.id], data);
      client.invalidateQueries({ queryKey: ['posts'] });
      navigation.replace('PostDetail', { postId: data.id });
    },
  });

  return <>
    <Title title={post ? 'Cập nhật bài viết' : 'Chia sẻ từ bếp'} detail="Bài gửi sẽ chờ duyệt trước khi xuất hiện trên bảng tin." />
    <Notice error>{mutation.error?.message}</Notice>
    {!post && <View style={ui.row}>
      <Chip label="Bài viết" selected={postType === 'blog'} disabled={mutation.isPending} onPress={() => setType('blog')} />
      <Chip label="Video" selected={postType === 'video'} disabled={mutation.isPending} onPress={() => setType('video')} />
    </View>}
    <View style={ui.card}>
      {preview ? <>
        <Text style={ui.h2}>{title.trim() || 'Chưa có tiêu đề'}</Text>
        {!!content.trim() && <Readable content={content} />}
        {!!media.trim() && <PostMedia key={media} value={media} video={postType === 'video'} />}
      </> : <>
        <Field label="Tiêu đề" maxLength={200} value={title} onChangeText={setTitle} editable={!mutation.isPending} />
        <Field label="Nội dung" multiline maxLength={20000} value={content} onChangeText={setContent} editable={!mutation.isPending} />
        <Field label={postType === 'video' ? 'Liên kết video' : 'Liên kết ảnh (tùy chọn)'} autoCapitalize="none" keyboardType="url"
          placeholder="https://" maxLength={500} value={media} onChangeText={setMedia} editable={!mutation.isPending} />
      </>}
      {!!recipe && <Text style={ui.small}>Công thức: {recipe.title || 'Đã đính kèm'}</Text>}
      {!preview && <View style={ui.row}>
        <Button title={picking ? 'Đóng danh sách' : 'Gắn công thức'} variant="outline" disabled={mutation.isPending} onPress={() => setPicking(!picking)} />
        {!!recipe && <Button title="Bỏ công thức" variant="outline" disabled={mutation.isPending} onPress={() => setRecipe(null)} />}
      </View>}
      {!preview && picking && <>
        <Field label="Tìm công thức đính kèm" value={filter} onChangeText={setFilter} />
        <QueryState query={recipes}>
          {listOf(recipes.data).filter(r => r.status === 'published' && !isDemo(r) && fold(r.title).includes(fold(filter))).slice(0, 6).map(r =>
            <RowLink label={r.title} key={r.id} onPress={() => {
              const id = Number(String(r.id).replace(/^r/i, ''));
              if (Number.isInteger(id) && id > 0 && id <= 2147483647) {
                setRecipe({ id, title: r.title }); setPicking(false);
              }
            }} />)}
        </QueryState>
      </>}
      <Button title={preview ? 'Quay lại chỉnh sửa' : 'Xem trước'} variant="secondary" disabled={mutation.isPending} onPress={() => setPreview(!preview)} />
      <Button title="Gửi duyệt" loading={mutation.isPending} disabled={!title.trim() || (postType === 'blog' ? !content.trim() : !media.trim())} onPress={() => mutation.mutate()} />
    </View>
  </>;
}
