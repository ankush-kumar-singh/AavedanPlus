import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  send: ({ userId, message, documents = [], mockPortalMode = null }) =>
    api.post('/chat', {
      user_id: userId,
      message,
      documents,
      mock_portal_mode: mockPortalMode,
    }),
};

export const statusAPI = {
  get: (applicationId) => api.get(`/application-status/${applicationId}`),
  update: (applicationId, status) =>
    api.patch(`/application-status/${applicationId}`, null, {
      params: { status },
    }),
};

export const healthAPI = {
  get: () => api.get('/health'),
};

export const sessionAPI = {
  clear: (userId) => api.delete(`/chat/${userId}`),
};

export default api;
