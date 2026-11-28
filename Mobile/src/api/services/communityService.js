import { apiRequest, writeJson } from '../client';

export const communityService = {
  getPosts: ({ page, mine, keyword, postType, sort }, signal) => {
    const params = new URLSearchParams({ 'page.Page': String(page), 'page.PageSize': '15' });
    if (keyword && !mine) params.set('keyword', keyword);
    if (postType && !mine) params.set('postType', postType);
    if (sort && !mine) params.set('sort', sort);
    return apiRequest('/community/posts' + (mine ? '/mine' : '') + '?' + params, { signal });
  },
  getPostById: (id, signal) => apiRequest('/community/posts/' + id, { signal }),
  createPost: data => writeJson('/community/posts', data),
  uploadPostMedia: async asset => {
    const video = asset.type === 'video';
    const form = new FormData();
    form.append('File', asset.file || {
      uri: asset.uri,
      name: asset.fileName || (video ? 'video.mp4' : 'anh.jpg'),
      type: asset.mimeType || (video ? 'video/mp4' : 'image/jpeg'),
    });
    form.append('Purpose', 'post');
    const result = await apiRequest('/uploads', { method: 'POST', body: form, timeout: 120000 });
    if (!result?.url || !['image', 'video'].includes(result.kind)) {
      throw new Error('Máy chủ chưa trả về tệp đính kèm hợp lệ.');
    }
    return result;
  },
  updatePost: (id, data) => writeJson('/community/posts/' + id, data, 'PUT'),
  deletePost: id => apiRequest('/community/posts/' + id, { method: 'DELETE' }),
  getComments: (id, page, signal) => apiRequest('/community/posts/' + id + '/comments?page.Page=' + page + '&page.PageSize=20', { signal }),
  addComment: (id, content) => writeJson('/community/posts/' + id + '/comments', { content }),
  updateComment: (id, content) => writeJson('/community/comments/' + id, { content }, 'PUT'),
  deleteComment: id => apiRequest('/community/comments/' + id, { method: 'DELETE' }),
  setLike: async (post, liked) => {
    const path = '/community/posts/' + post.id;
    if (post.likeCount == null) {
      const score = await writeJson(path + '/vote', { value: liked ? 1 : 0 }, 'PUT');
      if (!Number.isInteger(score)) throw new Error('Chưa xác nhận được lượt phản hồi.');
      return { score, myVote: liked ? 1 : 0 };
    }
    const response = await writeJson(path + '/like', { liked }, 'PUT');
    if (!Number.isInteger(response?.likeCount) || typeof response.liked !== 'boolean') {
      throw new Error('Chưa xác nhận được lượt thích.');
    }
    return { likeCount: response.likeCount, myVote: response.liked ? 1 : 0 };
  },
  report: data => writeJson('/community/reports', data),
};
