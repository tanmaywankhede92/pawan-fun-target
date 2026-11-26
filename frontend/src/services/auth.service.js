import api from './api';
import config from '@config';
import { deviceUuid } from '@utils/deviceUuid';

const getDeviceType = () => {
  try {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    // Native Android APK (both TV and Mobile Phone APK) must report 'TV'
    // to match the backend authorized game terminal device configuration:
    if (typeof window !== 'undefined' && (window.Android || window.Capacitor?.isNativePlatform?.())) {
      return 'TV';
    }
    // Web browsers on desktop or mobile report 'W' (Web)
    return 'W';
  } catch {
    return 'W';
  }
};

const normalizeLoginPayload = (credentials = {}) => {
  const normalized = { ...credentials };
  if (normalized.username) {
    normalized.username = String(normalized.username).trim().toLowerCase().replace(/^gk/i, "");
  }
  const resolvedDeviceUuid = credentials.deviceUuid || credentials.device_uuid || deviceUuid;

  normalized.device = credentials.device || getDeviceType();
  normalized.deviceUuid = resolvedDeviceUuid;
  normalized.device_uuid = credentials.device_uuid || credentials.deviceUuid || resolvedDeviceUuid;

  return normalized;
};

export const authService = {
  login: (credentials) => api.post('/auth/login', normalizeLoginPayload(credentials)),
  getBalance: (username) =>
    api.post('/auth/balance', {
      username: String(username || '').trim().toLowerCase().replace(/^gk/i, ''),
    }),
  setBalanceReceived: (data) => api.post('/auth/balance_received', data),
  transferBalance: (payload = {}) => {
    const cleanPayload = { ...payload };
    if (cleanPayload.username) {
      cleanPayload.username = String(cleanPayload.username).trim().toLowerCase().replace(/^gk/i, '');
    }
    if (cleanPayload.user_transfer) {
      cleanPayload.user_transfer = String(cleanPayload.user_transfer).trim().toLowerCase().replace(/^gk/i, '');
    }
    return api.post('/auth/user_balance_transfer', cleanPayload);
  },
  rejectBalance: (username) =>
    api.post('/auth/balance_reject', {
      username: String(username || '').trim().toLowerCase().replace(/^gk/i, ''),
    }),
  logout: (username) => {
    const cleanUsername = String(username || '').trim().toLowerCase().replace(/^gk/i, '');
    // 1. If tab is closing or hidden, use keepalive fetch so browser doesn't drop the packet
    const url = `${config.apiBaseUrl}/auth/logout`;
    const payload = JSON.stringify({ username: cleanUsername });

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
        return api.post('/auth/logout', { username: cleanUsername });
      });
    }

    return api.post('/auth/logout', { username: cleanUsername });
  },
};

