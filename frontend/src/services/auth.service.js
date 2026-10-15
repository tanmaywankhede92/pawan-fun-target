import api from './api';
import config from '@config';
import { deviceUuid } from '@utils/deviceUuid';

const getDeviceType = () => {
  try {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    if (typeof window !== 'undefined' && window.Android && typeof window.Android.isAndroidTV === 'function') {
      return 'TV';
    }
    if (/Android|iPhone|iPad|Mobile/i.test(ua)) return 'M';
    return 'W';
  } catch {
    return 'W';
  }
};

const normalizeLoginPayload = (credentials = {}) => {
  const normalized = { ...credentials };
  const resolvedDeviceUuid = credentials.deviceUuid || credentials.device_uuid || deviceUuid;

  normalized.device = credentials.device || getDeviceType();
  normalized.deviceUuid = resolvedDeviceUuid;
  normalized.device_uuid = credentials.device_uuid || credentials.deviceUuid || resolvedDeviceUuid;

  return normalized;
};

export const authService = {
  login: (credentials) => api.post('/auth/login', normalizeLoginPayload(credentials)),
  getBalance: (username) => api.post('/auth/balance', { username }),
  setBalanceReceived: (data) => api.post('/auth/balance_received', data),
  transferBalance: (payload) => api.post('/auth/user_balance_transfer', payload),
  logout: (username) => {
    // 1. If tab is closing or hidden, use keepalive fetch so browser doesn't drop the packet
    const url = `${config.apiBaseUrl}/auth/logout`;
    const payload = JSON.stringify({ username });

    if (typeof fetch !== 'undefined') {
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
        keepalive: true,
      }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        return { data, status: res.status };
      }).catch(() => {
        return api.post('/auth/logout', { username });
      });
    }

    return api.post('/auth/logout', { username });
  },
};

