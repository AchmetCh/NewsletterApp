import api from './axios';

export const newsletterAPI = {
  getAll: () => api.get('/api/newsletters'),
  getById: (id) => api.get(`/api/newsletters/${id}`),
  create: (data) => api.post('/api/newsletters', data),
  update: (id, data) => api.put(`/api/newsletters/${id}`, data),
  delete: (id) => api.delete(`/api/newsletters/${id}`),
  duplicate: (id) => api.post(`/api/newsletters/${id}/duplicate`)
};
