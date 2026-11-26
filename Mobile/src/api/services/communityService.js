import { apiRequest, unwrap } from '../client';

export const communityService = {
  getPosts: async (page = 1, pageSize = 10, type = null) => {
    const query = new URLSearchParams({ page, pageSize });
    if (type) query.append('type', type);
    const raw = await apiRequest(`/community/posts?${query.toString()}`);
    return unwrap(raw) || [];
  },

  getPostById: async (postId) => {
    const raw = await apiRequest(`/community/posts/${postId}`);
    return unwrap(raw);
  },

  createPost: async ({ title, content, type = 'text', imageUris = [], recipeId = null }) => {
    const formData = new FormData();
    formData.append('Title', title);
    formData.append('Content', content);
    formData.append('Type', type);
    if (recipeId) formData.append('RecipeId', recipeId);

    imageUris.forEach((uri, idx) => {
      formData.append('Images', {
        uri,
        name: `post_img_${idx}.jpg`,
        type: 'image/jpeg',
      });
    });

    const raw = await apiRequest('/community/posts', {
      method: 'POST',
      body: formData,
    });
    return unwrap(raw);
  },

  likePost: async (postId) => {
    return await apiRequest(`/community/posts/${postId}/like`, { method: 'POST' });
  },

  getComments: async (postId) => {
    const raw = await apiRequest(`/community/posts/${postId}/comments`);
    return unwrap(raw) || [];
  },

  addComment: async (postId, content) => {
    const raw = await apiRequest(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return unwrap(raw);
  },
};

export default communityService;
