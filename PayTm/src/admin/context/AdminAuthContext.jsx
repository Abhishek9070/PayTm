import { createContext, useContext, useEffect, useMemo, useState } from "react";
import adminApi from "../services/adminApi";

const AdminAuthContext = createContext(null);

const STORAGE_KEYS = {
  admin: "paytm_admin",
  token: "paytm_admin_token",
  refreshToken: "paytm_admin_refresh_token"
};

const DEBUG = true;
const log = (message, data = null) => {
  if (DEBUG) {
    console.log(`[AdminAuthContext] ${message}`, data || "");
  }
};

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem(STORAGE_KEYS.admin);
    const savedToken = localStorage.getItem(STORAGE_KEYS.token);
    const savedRefreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);

    log("Initializing AdminAuthContext", { 
      hasAdmin: !!savedAdmin, 
      hasToken: !!savedToken, 
      hasRefreshToken: !!savedRefreshToken 
    });

    if (savedAdmin) {
      try {
        const parsedAdmin = JSON.parse(savedAdmin);
        log("Parsed admin from storage", { 
          id: parsedAdmin._id, 
          fullName: parsedAdmin.fullName,
          role: parsedAdmin.role 
        });
        setAdmin(parsedAdmin);
      } catch (err) {
        log("ERROR parsing saved admin", err.message);
        localStorage.removeItem(STORAGE_KEYS.admin);
      }
    }

    if (savedToken) {
      log("Setting token from storage");
      setToken(savedToken);
      adminApi.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
    }

    if (savedRefreshToken) {
      log("Setting refresh token from storage");
      setRefreshToken(savedRefreshToken);
    }

    log("AdminAuthContext initialization complete");
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

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  }, [refreshToken]);

  const login = (authData) => {
    log("Login called with authData", { 
      hasAdmin: !!authData?.admin,
      hasAccessToken: !!authData?.accessToken,
      hasRefreshToken: !!authData?.refreshToken
    });

    const nextAdmin = authData?.admin ?? null;
    const nextToken = authData?.accessToken ?? authData?.token ?? null;
    const nextRefreshToken = authData?.refreshToken ?? null;

    log("Extracted values from authData", {
      adminId: nextAdmin?._id,
      adminName: nextAdmin?.fullName,
      tokenLength: nextToken?.length,
      refreshTokenLength: nextRefreshToken?.length
    });

    setAdmin(nextAdmin);
    setToken(nextToken);
    setRefreshToken(nextRefreshToken);

    if (nextAdmin) {
      log("Storing admin to localStorage");
      localStorage.setItem(STORAGE_KEYS.admin, JSON.stringify(nextAdmin));
    } else {
      log("No admin data, removing from localStorage");
      localStorage.removeItem(STORAGE_KEYS.admin);
    }

    if (nextToken) {
      log("Storing token and setting auth header");
      adminApi.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
      localStorage.setItem(STORAGE_KEYS.token, nextToken);
    } else {
      log("No token, removing from localStorage");
      delete adminApi.defaults.headers.common.Authorization;
      localStorage.removeItem(STORAGE_KEYS.token);
    }

    if (nextRefreshToken) {
      log("Storing refresh token");
      localStorage.setItem(STORAGE_KEYS.refreshToken, nextRefreshToken);
    } else {
      log("No refresh token");
      localStorage.removeItem(STORAGE_KEYS.refreshToken);
    }

    log("Login complete", {
      adminSet: !!nextAdmin,
      tokenSet: !!nextToken,
      refreshTokenSet: !!nextRefreshToken
    });
  };

  const logout = () => {
    log("Logout called!");
    setAdmin(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem(STORAGE_KEYS.admin);
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
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
      refreshToken,
      loading,
      login,
      logout,
      updateAdmin
    }),
    [admin, token, refreshToken, loading]
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
