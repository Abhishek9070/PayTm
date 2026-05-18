import { createContext, useContext, useEffect, useMemo, useState } from "react";
import adminApi from "../services/adminApi";

const AdminAuthContext = createContext(null);

const STORAGE_KEYS = {
  admin: "paytm_admin",
  token: "paytm_admin_token"
};

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem(STORAGE_KEYS.admin);
    const savedToken = localStorage.getItem(STORAGE_KEYS.token);

    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch {
        localStorage.removeItem(STORAGE_KEYS.admin);
      }
    }

    if (savedToken) {
      setToken(savedToken);
      adminApi.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      adminApi.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem(STORAGE_KEYS.token, token);
      return;
    }

    delete adminApi.defaults.headers.common.Authorization;
    localStorage.removeItem(STORAGE_KEYS.token);
  }, [token]);

  const login = (authData) => {
    const nextAdmin = authData?.admin ?? null;
    const nextToken = authData?.accessToken ?? authData?.token ?? null;

    setAdmin(nextAdmin);
    setToken(nextToken);

    if (nextAdmin) {
      localStorage.setItem(STORAGE_KEYS.admin, JSON.stringify(nextAdmin));
    } else {
      localStorage.removeItem(STORAGE_KEYS.admin);
    }

    if (!nextToken) {
      delete adminApi.defaults.headers.common.Authorization;
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.admin);
    localStorage.removeItem(STORAGE_KEYS.token);
    delete adminApi.defaults.headers.common.Authorization;
  };

  const updateAdmin = (nextAdmin) => {
    setAdmin(nextAdmin ?? null);

    if (nextAdmin) {
      localStorage.setItem(STORAGE_KEYS.admin, JSON.stringify(nextAdmin));
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.admin);
  };

  const value = useMemo(
    () => ({
      admin,
      token,
      loading,
      login,
      logout,
      updateAdmin
    }),
    [admin, token, loading]
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }

  return context;
}

export default AdminAuthContext;
