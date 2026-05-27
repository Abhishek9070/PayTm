import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setupInterceptors } from "../api/axios";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  user: "paytm_user",
  token: "paytm_token",
  refreshToken: "paytm_refresh_token"
};


const isTokenExpired = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const decoded = JSON.parse(atob(parts[1]));
    const expirationTime = decoded.exp * 1000; 
    return Date.now() >= expirationTime;
  } catch {
    return true;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.user);
    const savedToken = localStorage.getItem(STORAGE_KEYS.token);
    const savedRefreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(STORAGE_KEYS.user);
      }
    }

    if (savedToken) {
      // Check if token is already expired
      if (isTokenExpired(savedToken)) {
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
      } else {
        setToken(savedToken);
        api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
      }
    }

    if (savedRefreshToken) {
      setRefreshToken(savedRefreshToken);
    }

    setLoading(false);
  }, []);

  // Update authorization header when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem(STORAGE_KEYS.token, token);
      return;
    }

    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem(STORAGE_KEYS.token);
  }, [token]);

  // Handle refresh token storage
  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  }, [refreshToken]);

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    delete api.defaults.headers.common.Authorization;
  };

  // Setup interceptors on mount
  useEffect(() => {
    setupInterceptors(logout);
  }, []);

  // Check token expiration periodically (every minute)
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      if (isTokenExpired(token)) {
        logout();
      }
    };

    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [token]);

  const login = (authData) => {
    const nextUser = authData?.user ?? null;
    const nextToken = authData?.accessToken ?? authData?.token ?? null;
    const nextRefreshToken = authData?.refreshToken ?? null;

    setUser(nextUser);
    setToken(nextToken);
    setRefreshToken(nextRefreshToken);

    if (nextUser) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }

    if (!nextToken) {
      delete api.defaults.headers.common.Authorization;
    }

    if (nextRefreshToken) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, nextRefreshToken);
    } else {
      localStorage.removeItem(STORAGE_KEYS.refreshToken);
    }
  };

  const updateUser = (nextUser) => {
    setUser(nextUser ?? null);

    if (nextUser) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.user);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      refreshToken,
      loading,
      login,
      updateUser,
      logout
    }),
    [user, token, refreshToken, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthContext;