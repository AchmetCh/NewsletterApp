import api from './axios';

export const userAPI = {
  getAll: () => api.get('/api/users'),
  create: (userData) => api.post('/api/users', userData),
  delete: (userId) => api.delete(`/api/users/${userId}`)
};
