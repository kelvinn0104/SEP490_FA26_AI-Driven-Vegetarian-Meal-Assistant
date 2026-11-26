import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theme } from '../../styles/theme';
import { communityService } from '../../api/services/communityService';
import { imgUrl } from '../../api/client';
import { Heart, MessageSquare, Plus, Share2, User } from 'lucide-react-native';

export function CommunityScreen({ navigation }) {
  const queryClient = useQueryClient();

  const {
    data: posts,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['communityPosts'],
    queryFn: () => communityService.getPosts(1, 20),
    staleTime: 1000 * 60 * 5,
  });

  const likeMutation = useMutation({
    mutationFn: (postId) => communityService.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Cộng Đồng Thuần Chay</Text>
          <Text style={styles.headerSub}>Chia sẻ món ăn và cảm hứng sống xanh</Text>
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Plus size={18} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.createBtnText}>Đăng bài</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải bảng tin cộng đồng...</Text>
        </View>
      ) : (
        <FlatList
          data={posts || []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
          }
          renderItem={({ item }) => {
            const author = item.authorName || item.user?.displayName || 'Thành viên Veggie';
            const imageUrl = item.imageUrl || (item.images && item.images[0]);

            return (
              <View style={styles.postCard}>
                {/* Author Info */}
                <View style={styles.authorRow}>
                  <View style={styles.avatar}>
                    <User size={18} color="#ffffff" />
                  </View>
                  <View>
                    <Text style={styles.authorName}>{author}</Text>
                    <Text style={styles.postTime}>{item.createdAt || 'Gần đây'}</Text>
                  </View>
                </View>

                {/* Content */}
                {item.title ? <Text style={styles.postTitle}>{item.title}</Text> : null}
                <Text style={styles.postContent}>{item.content}</Text>

                {/* Image */}
                {imageUrl && (
                  <Image source={{ uri: imgUrl(imageUrl) }} style={styles.postImage} resizeMode="cover" />
                )}

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => likeMutation.mutate(item.id)}
                  >
                    <Heart
                      size={18}
                      color={item.isLiked ? theme.colors.error : theme.colors.textSecondary}
                      fill={item.isLiked ? theme.colors.error : 'transparent'}
                    />
                    <Text style={styles.actionText}>{item.likeCount || 0}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn}>
                    <MessageSquare size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.actionText}>{item.commentCount || 0}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>
                Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ nhé!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.full,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 30,
  },
  postCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  postTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  postContent: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: 10,
    backgroundColor: theme.colors.borderLight,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 10,
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
});
