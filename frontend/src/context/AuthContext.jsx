import { createContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { authService } from '@services/auth.service';
import { STORAGE_KEYS } from '@constants';

const AuthContext = createContext(null);

// ============================================================
// REAL API AUTH (backend: https://api.funtarget.us/api)
// Login returns { user } — NO token/cookie, so we persist the
// user object in localStorage as the session.
// ============================================================

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
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
// ============================================================

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
      const user = data?.user;
      if (!user) {
        throw new Error('Login failed');
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
      return { redirect: '/', user };
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Invalid username or password';
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const setAuth = useCallback((user) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
  }, []);

  // Fetch the latest balance from the backend and sync it into the
  // stored user object. Stable identity (no state.user dep) so callers
  // never re-run effects; only dispatches when balance actually changed.
  const refreshBalance = useCallback(async () => {
    const username = userRef.current?.username;
    if (!username) return null;
    try {
      const { data } = await authService.getBalance(username);
      const newBalance = data?.data?.balance;
      const current = userRef.current;
      if (newBalance != null && current && newBalance !== current.balance) {
        const updated = { ...current, balance: newBalance };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: updated } });
      }
      return newBalance;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
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
