import api from './api';

export const recordService = {
  insertRecord: (payload) => api.post('/record/insertRecord', payload),
  getLastBet: (payload) => api.post('/record/last_bet', payload),
  winAmount: (payload) => api.post('/record/win_amount', payload),
  take: (payload) => api.post('/record/take', payload),
};
