import api from './api';

export const contentService = {
  getCourses:      (params)  => api.get('/content/courses', { params }),
  getCourse:       (id)      => api.get(`/content/courses/${id}`),
  getLesson:       (id)      => api.get(`/content/lessons/${id}`),
  completeLesson:  (id)      => api.post(`/content/lessons/${id}/complete`),
  getReels:        (params)  => api.get('/reels', { params }),
  likeReel:        (id)      => api.post(`/reels/${id}/like`),
};
