import axios from 'axios';
import config from '@config';
import { calibrateTime } from '@utils/istTime';

const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 3500,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    calibrateTime(response.headers?.date);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // If request failed with Network Error (common on older Android TVs due to outdated TLS root certs)
    // and hasn't retried yet, retry with HTTP automatically:
    if (
      (!error.response || error.message === 'Network Error') &&
      originalRequest &&
      !originalRequest._retryHttp &&
      typeof originalRequest.baseURL === 'string' &&
      originalRequest.baseURL.startsWith('https://')
    ) {
      originalRequest._retryHttp = true;
      originalRequest.baseURL = originalRequest.baseURL.replace('https://', 'http://');
      if (typeof originalRequest.url === 'string' && originalRequest.url.startsWith('https://')) {
        originalRequest.url = originalRequest.url.replace('https://', 'http://');
      }
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;
