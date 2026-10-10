import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  send: ({
    userId,
    message,
    serviceId = null,
    mockPortalMode = null,
  }) =>
    api.post('/chat', {
      user_id: userId,
      message,
      service_id: serviceId,
      mock_portal_mode: mockPortalMode,
    }),
};

export const requirementsAPI = {
  get: (serviceId) => api.get(`/service-requirements/${serviceId}`),
};

export const uploadAPI = {
  upload: (userId, serviceId, file) =>
    api.post('/documents', file, {
      params: { user_id: userId, service_id: serviceId, filename: file.name },
      headers: {
        'Content-Type': 'application/pdf',
      },
    }),
};

export const formAPI = {
  save: (userId, fields) =>
    api.put('/application-form', {
      user_id: userId,
      fields,
    }),
};

export const auditAPI = {
  get: (userId) => api.get(`/audit-log/${userId}`),
};

export const statusAPI = {
  get: (applicationId) =>
    api.get(`/application-status/${applicationId}`),

  update: (applicationId, status) =>
    api.patch(`/application-status/${applicationId}`, null, {
      params: { status },
    }),
};

export const healthAPI = {
  get: () => api.get('/health'),
};

export const sessionAPI = {
  get: (userId) =>
    api.get(`/application-session/${userId}`),

  start: (userId, serviceId) =>
    api.post('/application-session', {
      user_id: userId,
      service_id: serviceId,
    }),

  clear: (userId) =>
    api.delete(`/chat/${userId}`),
};

export default api;
