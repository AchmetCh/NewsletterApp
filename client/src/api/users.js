import api from './axios';

export const userAPI = {
  getAll: () => api.get('/api/users'),
  create: (userData) => api.post('/api/users', userData),
  update: (userId, userData) => api.put(`/api/users/${userId}`, userData),
  delete: (userId) => api.delete(`/api/users/${userId}`),
  suspend: (userId) => api.patch(`/api/users/${userId}/suspend`)
};
