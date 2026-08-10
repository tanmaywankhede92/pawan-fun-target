import api from './api';

export const resultService = {
  getPreviousResults: () => api.get('/results/previousResult'),
};
