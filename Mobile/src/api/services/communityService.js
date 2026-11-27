import { apiRequest, writeJson } from '../client';

export const communityService = {
  getPosts: ({ page, mine, keyword, postType, sort }, signal) => {
    const params = new URLSearchParams({ page: String(page), pageSize: '15' });
    if (keyword && !mine) params.set('keyword', keyword);
    if (postType && !mine) params.set('postType', postType);
    if (sort && !mine) params.set('sort', sort);
    return apiRequest('/community/posts' + (mine ? '/mine' : '') + '?' + params, { signal });
  },
  getPostById: (id, signal) => apiRequest('/community/posts/' + id, { signal }),
  createPost: data => writeJson('/community/posts', data),
  updatePost: (id, data) => writeJson('/community/posts/' + id, data, 'PUT'),
  deletePost: id => apiRequest('/community/posts/' + id, { method: 'DELETE' }),
  getComments: (id, page, signal) => apiRequest('/community/posts/' + id + '/comments?page=' + page + '&pageSize=20', { signal }),
  addComment: (id, content) => writeJson('/community/posts/' + id + '/comments', { content }),
  vote: (id, value) => writeJson('/community/posts/' + id + '/vote', { value }, 'PUT'),
  report: data => writeJson('/community/reports', data),
};
