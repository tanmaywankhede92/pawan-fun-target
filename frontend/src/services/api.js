import axios from 'axios';
import config from '@config';
import { calibrateTime } from '@utils/istTime';

const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Sync the frontend clock to the server on every API response.  The HTTP
// Date header carries the server's UTC timestamp; each response tightens
// the calibration so device clock drift never accumulates.
api.interceptors.response.use((response) => {
  calibrateTime(response.headers?.date);
  return response;
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;
