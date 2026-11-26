import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { theme } from '../../styles/theme';
import { communityService } from '../../api/services/communityService';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';

export function CreatePostScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!res.canceled && res.assets) {
      setImages((prev) => [...prev, ...res.assets.map((a) => a.uri)]);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung bài viết.');
      return;
    }

    setSubmitting(true);
    try {
      await communityService.createPost({
        title: title.trim(),
        content: content.trim(),
        imageUris: images,
      });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      Alert.alert('Thành công', 'Bài viết đã được gửi duyệt/đăng thành công!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Lỗi đăng bài', err.message || 'Không thể đăng bài lúc này.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Tạo Bài Viết Mới"
        onBack={() => navigation.goBack()}
        rightAction={
          <Button
            title="Đăng"
            onPress={handleSubmit}
            loading={submitting}
            style={{ height: 36, paddingHorizontal: 16 }}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          placeholder="Tiêu đề bài viết (tùy chọn)..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          placeholder="Hôm nay bạn nấu món gì? Chia sẻ công thức hoặc trải nghiệm sống xanh của bạn nhé..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.contentInput}
          multiline
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />

        {/* Danh sách ảnh đã chọn */}
        {images.length > 0 && (
          <ScrollView horizontal style={styles.imageScroll} showsHorizontalScrollIndicator={false}>
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imgPreviewWrapper}>
                <Image source={{ uri }} style={styles.imgPreview} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(idx)}>
                  <X size={14} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Nút thêm ảnh */}
        <TouchableOpacity style={styles.addMediaBtn} onPress={pickImage}>
          <ImageIcon size={20} color={theme.colors.primary} />
          <Text style={styles.addMediaText}>Thêm hình ảnh vào bài viết</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    padding: theme.spacing.md,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    paddingVertical: 10,
    marginBottom: 10,
  },
  contentInput: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    minHeight: 180,
    lineHeight: 22,
  },
  imageScroll: {
    marginVertical: 12,
  },
  imgPreviewWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  imgPreview: {
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.md,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    gap: 8,
  },
  addMediaText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
