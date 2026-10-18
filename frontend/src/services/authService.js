import api from './api';

export const authService = {
  register:    (data) => api.post('/auth/register', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendOTP:   (data) => api.post('/auth/resend-otp', data),
  login:       (data) => api.post('/auth/login', data),
  refresh:     ()     => api.post('/auth/refresh'),
  logout:      ()     => api.post('/auth/logout'),
};
