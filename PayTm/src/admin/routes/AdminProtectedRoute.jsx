import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";

const DEBUG = true;
const log = (message, data = null) => {
  if (DEBUG) {
    console.log(`[AdminProtectedRoute] ${message}`, data || "");
  }
};

export default function AdminProtectedRoute() {
  console.log("=== AdminProtectedRoute RENDER START ===");
  
  const { admin, loading, token, refreshToken } = useAdminAuth();

  console.log("[AdminProtectedRoute] useAdminAuth returned:", { 
    hasAdmin: !!admin,
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    loading
  });

  
  useEffect(() => {
    log("useEffect: admin changed", { hasAdmin: !!admin, adminId: admin?._id });
  }, [admin]);

  log("AdminProtectedRoute render", { 
    loading, 
    hasAdmin: !!admin,
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    adminId: admin?._id,
    adminName: admin?.fullName,
    adminRole: admin?.role
  });

  
  if (!admin && !loading) {
    log("CRITICAL: Admin is null and not loading. Checking localStorage...");
    const savedAdmin = localStorage.getItem("paytm_admin");
    const savedToken = localStorage.getItem("paytm_admin_token");
    log("LocalStorage state:", {
      hasSavedAdmin: !!savedAdmin,
      hasSavedToken: !!savedToken,
      savedAdminParsed: savedAdmin ? (() => { try { return JSON.parse(savedAdmin); } catch (e) { return "parse-error"; } })() : null
    });
  }

  if (loading) {
    log("Still loading, showing loading screen");
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-sky-400 border-r-transparent"></div>
          <p className="mt-4 text-white">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    log("No admin found, redirecting to login");
    console.log("=== AdminProtectedRoute REDIRECTING TO LOGIN ===");
    return <Navigate to="/admin/login" replace />;
  }

  log("Admin authenticated, rendering routes");
  console.log("=== AdminProtectedRoute RENDERING OUTLET ===");
  return <Outlet />;
}
