import { apiRequest, unwrap } from '../client';

export const communityService = {
  /**
   * Lấy danh sách bài viết / video cộng đồng (phân trang & bộ lọc)
   */
  getPosts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.postType) query.append('postType', params.postType); // 'blog' | 'video'
    if (params.sort) query.append('sort', params.sort); // 'newest' | 'top'
    if (params.page) query.append('page', params.page);
    if (params.pageSize) query.append('pageSize', params.pageSize);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const raw = await apiRequest(`/community/posts${qs}`);
    return unwrap(raw);
  },

  /**
   * Lấy danh sách bài viết của chính người dùng đăng nhập
   */
  getMyPosts: async (page = 1, pageSize = 20) => {
    const raw = await apiRequest(`/community/posts/mine?page=${page}&pageSize=${pageSize}`);
    return unwrap(raw);
  },

  /**
   * Lấy chi tiết bài viết kèm bình luận
   */
  getPostById: async (id) => {
    const raw = await apiRequest(`/community/posts/${id}`);
    return unwrap(raw);
  },

  /**
   * Tạo bài viết mới (trạng thái ban đầu là pending chờ duyệt)
   * @param {{ postType: 'blog'|'video', title: string, content?: string, mediaUrl?: string, recipeId?: number }} data
   */
  createPost: async (data) => {
    const raw = await apiRequest('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap(raw);
  },

  /**
   * Xóa bài viết của mình
   */
  deletePost: async (id) => {
    return await apiRequest(`/community/posts/${id}`, { method: 'DELETE' });
  },

  /**
   * Thêm bình luận vào bài viết
   */
  addComment: async (postId, content) => {
    const raw = await apiRequest(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return unwrap(raw);
  },

  /**
   * Xóa bình luận
   */
  deleteComment: async (commentId) => {
    return await apiRequest(`/community/comments/${commentId}`, { method: 'DELETE' });
  },

  /**
   * Vote / Like bài viết (+1, -1 hoặc 0 để hủy)
   */
  votePost: async (postId, value = 1) => {
    const raw = await apiRequest(`/community/posts/${postId}/vote`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
    return unwrap(raw);
  },

  /**
   * Báo cáo nội dung vi phạm
   */
  report: async ({ targetType, targetId, category, reason }) => {
    const raw = await apiRequest('/community/reports', {
      method: 'POST',
      body: JSON.stringify({ targetType, targetId, category, reason }),
    });
    return unwrap(raw);
  },
};

export default communityService;
