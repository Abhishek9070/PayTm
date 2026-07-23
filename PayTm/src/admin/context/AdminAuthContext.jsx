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

// Initialize state synchronously from localStorage to avoid race conditions
const initializeAdminState = () => {
  const savedAdmin = localStorage.getItem(STORAGE_KEYS.admin);
  if (savedAdmin) {
    try {
      return JSON.parse(savedAdmin);
    } catch (err) {
      log("ERROR parsing saved admin on init", err.message);
      localStorage.removeItem(STORAGE_KEYS.admin);
    }
  }
  return null;
};

const initializeTokenState = () => {
  const savedToken = localStorage.getItem(STORAGE_KEYS.token);
  if (savedToken) {
    adminApi.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
  }
  return savedToken || null;
};

const initializeRefreshTokenState = () => {
  return localStorage.getItem(STORAGE_KEYS.refreshToken) || null;
};

export function AdminAuthProvider({ children }) {
  // Initialize state SYNCHRONOUSLY from localStorage to prevent race conditions
  // where AdminProtectedRoute reads admin before initialization effect runs
  const [admin, setAdmin] = useState(() => {
    const initialAdmin = initializeAdminState();
    log("Initialized admin state from localStorage", { 
      hasAdmin: !!initialAdmin,
      adminId: initialAdmin?._id,
      adminName: initialAdmin?.fullName 
    });
    return initialAdmin;
  });
  
  const [token, setToken] = useState(() => {
    const initialToken = initializeTokenState();
    log("Initialized token state from localStorage", { hasToken: !!initialToken });
    return initialToken;
  });
  
  const [refreshToken, setRefreshToken] = useState(() => {
    const initialRefreshToken = initializeRefreshTokenState();
    log("Initialized refresh token state from localStorage", { hasRefreshToken: !!initialRefreshToken });
    return initialRefreshToken;
  });
  
  const [loading, setLoading] = useState(false);

  // Forcefully sync admin state after any state updates
  // This ensures admin persists when navigating to protected routes
  useEffect(() => {
    if (admin) {
      log("Effect: admin is set, ensuring it stays synced to localStorage", { adminId: admin._id });
      localStorage.setItem(STORAGE_KEYS.admin, JSON.stringify(admin));
    }
  }, [admin]);

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
