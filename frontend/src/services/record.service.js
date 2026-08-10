import api from './api';

export const recordService = {
  insertRecord: (payload) => api.post('/record/insertRecord', payload),
  getLastBet: (payload) => api.post('/record/last_bet', payload),
};
