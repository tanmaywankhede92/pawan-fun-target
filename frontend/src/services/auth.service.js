import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  getBalance: (username) => api.post('/auth/balance', { username }),
  setBalanceReceived: (data) => api.post('/auth/balance_received', data),
  logout: (username) => api.post('/auth/logout', { username }),
};
