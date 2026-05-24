import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setupInterceptors } from "../api/axios";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  user: "paytm_user",
  token: "paytm_token"
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.user);
    const savedToken = localStorage.getItem(STORAGE_KEYS.token);

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

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
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

    setUser(nextUser);
    setToken(nextToken);

    if (nextUser) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }

    if (!nextToken) {
      delete api.defaults.headers.common.Authorization;
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
      loading,
      login,
      updateUser,
      logout
    }),
    [user, token, loading]
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