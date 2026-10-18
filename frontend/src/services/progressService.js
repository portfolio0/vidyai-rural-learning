import api from './api';

export const progressService = {
  get:          (id)    => api.get(id ? `/progress/${id}` : '/progress'),
  update:       (data)  => api.post('/progress/update', data),
  leaderboard:  (q)     => api.get('/progress/leaderboard/class', { params: q }),
  addXP:        (data)  => api.post('/progress/xp', data),
};
