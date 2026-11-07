import { createContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { authService } from '@services/auth.service';
import { STORAGE_KEYS } from '@constants';
import { recordApiResponse } from '@utils/apiLog';
import { clearAllPendingBets } from '@utils/pendingBet';
import { clearPermanentImageCache } from '@utils/preloadImages';

const AuthContext = createContext(null);

// ============================================================
// Session-scoped auth:
// We use sessionStorage so that when the app is completely closed
// (swiped away from Recent Apps / tab closed), the session is
// automatically destroyed. On next open, user MUST log in again.
// ============================================================

const getStoredUser = () => {
  try {
    // Purge any lingering legacy localStorage item from older builds
    localStorage.removeItem(STORAGE_KEYS.USER);
    const raw = sessionStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  isAuthenticated: !!getStoredUser(),
  isLoading: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOADING_DONE':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const userRef = useRef(state.user);
  userRef.current = state.user;

  const login = useCallback(async (credentials) => {
    try {
      const { data } = await authService.login(credentials);
      recordApiResponse('login', { status: 200, body: data });
      const user = data?.user;
      if (!user) {
        throw new Error('Login failed');
      }
      clearAllPendingBets();
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
      return { redirect: '/pre', user };
    } catch (err) {
      recordApiResponse('login', {
        status: err?.response?.status || 0,
        body: err?.response?.data || { message: err?.message || 'Unknown error' },
      });
      const message =
        err?.response?.data?.message || 'Invalid username or password';
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    const username = userRef.current?.username;
    if (username) {
      try {
        const { data } = await authService.logout(username);
        recordApiResponse('logout', { status: 200, body: data });
      } catch (err) {
        recordApiResponse('logout', {
          status: err?.response?.status || 0,
          body: err?.response?.data || { message: err?.message || 'Unknown error' },
        });
      }
    }
    clearAllPendingBets();
    clearPermanentImageCache();
    if (typeof window !== 'undefined' && window.Android && typeof window.Android.clearWebViewCache === 'function') {
      try {
        window.Android.clearWebViewCache();
      } catch {}
    }
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.USER);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const setAuth = useCallback((user) => {
    clearAllPendingBets();
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
  }, []);

  const refreshBalance = useCallback(async () => {
    const username = userRef.current?.username;
    if (!username) return null;
    try {
      const { data } = await authService.getBalance(username);
      const newBalance = data?.data?.balance;
      const newReceived = data?.data?.balance_received ?? data?.data?.received_balance;
      const current = userRef.current;
      if (current) {
        let changed = false;
        let updated = { ...current };
        if (newBalance != null && newBalance !== current.balance) {
          updated.balance = newBalance;
          changed = true;
        }
        if (newReceived != null && String(newReceived) !== String(current.balance_received)) {
          updated.balance_received = typeof newReceived === 'number' ? newReceived.toFixed(2) : String(newReceived);
          changed = true;
        }
        if (changed) {
          sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
          dispatch({ type: 'AUTH_SUCCESS', payload: { user: updated } });
        }
      }
      return newBalance;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      clearAllPendingBets();
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.USER);
      dispatch({ type: 'LOGOUT' });
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setAuth, refreshBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
