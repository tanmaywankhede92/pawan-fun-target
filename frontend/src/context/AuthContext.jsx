import { createContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '@services/auth.service';
import { setAuthToken } from '@services/api';

const AuthContext = createContext(null);

// ============================================================
// BACKEND DISCONNECTED (temporary) — comment out to restore backend
// ============================================================
const MOCK_USER = { id: 1, username: 'Player', balance: 100000 };
const MOCK_TOKEN = 'mock-token';

const initialState = {
  user: MOCK_USER,
  accessToken: MOCK_TOKEN,
  isAuthenticated: true,
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
    case 'TOKEN_REFRESHED':
      return {
        ...state,
        accessToken: action.payload,
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
    setAuthToken(accessToken);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, accessToken } });
  }, []);

  const login = useCallback(async (credentials) => {
    // BACKEND DISCONNECTED (temporary):
    // const { data } = await authService.login(credentials);
    // const { user, accessToken } = data;
    // setAuth(user, accessToken);
    // return data;
    setAuth(MOCK_USER, MOCK_TOKEN);
    return { redirect: '/', user: MOCK_USER, accessToken: MOCK_TOKEN };
  }, [setAuth]);

  const logout = useCallback(async () => {
    // BACKEND DISCONNECTED (temporary):
    // try {
    //   await authService.logout();
    // } catch {
    // } finally {
    //   setAuthToken(null);
    //   dispatch({ type: 'LOGOUT' });
    // }
    setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const refreshToken = useCallback(async () => {
    // BACKEND DISCONNECTED (temporary):
    // try {
    //   const { data } = await authService.refresh();
    //   const { accessToken } = data;
    //   setAuthToken(accessToken);
    //   dispatch({ type: 'TOKEN_REFRESHED', payload: accessToken });
    //   return accessToken;
    // } catch {
    //   dispatch({ type: 'LOGOUT' });
    //   return null;
    // }
    return MOCK_TOKEN;
  }, []);

  useEffect(() => {
    // BACKEND DISCONNECTED (temporary) — already authenticated via initialState:
    // const tryAutoLogin = async () => {
    //   try {
    //     const { data } = await authService.refresh();
    //     const { accessToken } = data;
    //     const userResponse = await authService.getMe();
    //     setAuth(userResponse.data.data.user, accessToken);
    //   } catch {
    //     dispatch({ type: 'LOADING_DONE' });
    //   }
    // };
    // tryAutoLogin();
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
