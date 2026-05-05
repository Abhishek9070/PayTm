import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  user: "paytm_user",
  token: "paytm_token"
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
      setToken(savedToken);
      api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem(STORAGE_KEYS.token, token);
      return;
    }

    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem(STORAGE_KEYS.token);
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

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
    delete api.defaults.headers.common.Authorization;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
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