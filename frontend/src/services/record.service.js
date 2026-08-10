import api from './api';

export const recordService = {
  insertRecord: (payload) => api.post('/record/insertRecord', payload),
};
