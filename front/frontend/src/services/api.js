import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// ===== APPLICATION APIs =====
export const applicationAPI = {
  create: (message) => api.post('/application/create', { message }),
  get: (id) => api.get(`/application/${id}`),
  submit: (id) => api.post(`/application/submit/${id}`),
  retry: (id) => api.post(`/application/retry/${id}`),
};

// ===== DOCUMENT APIs =====
export const documentAPI = {
  upload: (formData) => api.post('/documents', formData),
  getAll: (appId) => api.get(`/documents/${appId}`),
};

// ===== CONSENT APIs =====
export const consentAPI = {
  give: (data) => api.post('/consent', data),
};

// ===== AUDIT APIs =====
export const auditAPI = {
  get: (appId) => api.get(`/audit/${appId}`),
};

// ===== CHAT APIs =====
export const chatAPI = {
  send: (message, appId) => api.post('/chat', { message, application_id: appId }),
};

export default api;