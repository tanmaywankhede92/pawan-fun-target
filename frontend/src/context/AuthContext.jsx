import { createContext, useReducer, useEffect, useCallback } from 'react';
import { setAuthToken } from '@services/api';
import { STORAGE_KEYS } from '@constants';

const AuthContext = createContext(null);

// ============================================================
// FRONTEND-ONLY DUMMY AUTH (backend integration paused)
// Login: akshay / 12345
// ============================================================
const MOCK_CREDENTIALS = { username: 'akshay', password: '12345' };
const MOCK_USER = {
  id: 265,
  name: 'akshay',
  username: 'akshay',
  role: 'USER',
  balance: 100000,
};
const MOCK_TOKEN = 'mock-token';
const MOCK_REDIRECT = '/game';

const getStoredToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
};

const initialState = {
  user: getStoredToken() === MOCK_TOKEN ? MOCK_USER : null,
  accessToken: getStoredToken() === MOCK_TOKEN ? MOCK_TOKEN : null,
  isAuthenticated: getStoredToken() === MOCK_TOKEN,
  isLoading: false,
};
// ============================================================

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        accessToken: null,
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

  const setAuth = useCallback((user, accessToken) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    setAuthToken(accessToken);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, accessToken } });
  }, []);

  const login = useCallback(
    async (credentials) => {
      const isValid =
        credentials &&
        credentials.username === MOCK_CREDENTIALS.username &&
        credentials.password === MOCK_CREDENTIALS.password;
      if (!isValid) {
        throw new Error('Invalid credentials');
      }
      setAuth(MOCK_USER, MOCK_TOKEN);
      return { redirect: MOCK_REDIRECT, user: MOCK_USER, accessToken: MOCK_TOKEN };
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const refreshToken = useCallback(async () => {
    return getStoredToken() || null;
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      setAuthToken(null);
      dispatch({ type: 'LOGOUT' });
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshToken, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
