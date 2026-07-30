import { createContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '@services/auth.service';
import { setAuthToken } from '@services/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
};

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
    case 'TOKEN_REFRESHED':
      return {
        ...state,
        accessToken: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
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
    setAuthToken(accessToken);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, accessToken } });
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authService.login(credentials);
    const { user, accessToken } = data;
    setAuth(user, accessToken);
    return data;
  }, [setAuth]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
    } finally {
      setAuthToken(null);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const { data } = await authService.refresh();
      const { accessToken } = data;
      setAuthToken(accessToken);
      dispatch({ type: 'TOKEN_REFRESHED', payload: accessToken });
      return accessToken;
    } catch {
      dispatch({ type: 'LOGOUT' });
      return null;
    }
  }, []);

  useEffect(() => {
    const tryAutoLogin = async () => {
      try {
        const { data } = await authService.refresh();
        const { accessToken } = data;
        const userResponse = await authService.getMe();
        setAuth(userResponse.data.data.user, accessToken);
      } catch {
        dispatch({ type: 'LOADING_DONE' });
      }
    };
    tryAutoLogin();
  }, [setAuth]);

  useEffect(() => {
    const handleForceLogout = () => {
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
