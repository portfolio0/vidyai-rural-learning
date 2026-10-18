import api from './api';

export const quizService = {
  getQuizzes:   (params)        => api.get('/quiz', { params }),
  getQuiz:      (id)            => api.get(`/quiz/${id}`),
  submitQuiz:   (id, data)      => api.post(`/quiz/${id}/submit`, data),
  generateAI:   (data)          => api.post('/ai/quiz-generate', data),
};
