import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const DEBUG = true;
const log = (message, data = null) => {
  if (DEBUG) {
    console.log(`[AdminProtectedRoute] ${message}`, data || "");
  }
};

export default function AdminProtectedRoute() {
  const { admin, loading } = useAdminAuth();

  log("AdminProtectedRoute render", { 
    loading, 
    hasAdmin: !!admin,
    adminId: admin?._id,
    adminName: admin?.fullName
  });

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
    return <Navigate to="/admin/login" replace />;
  }

  log("Admin authenticated, rendering routes");
  return <Outlet />;
}
