import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const adminNavItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: "📊" },
  { label: "Users", to: "/admin/users", icon: "👥" },
  { label: "Transactions", to: "/admin/transactions", icon: "💳" },
  { label: "Analytics", to: "/admin/analytics", icon: "📈" },
  { label: "KYC Reviews", to: "/admin/kyc", icon: "🆔" },
  { label: "Withdrawals", to: "/admin/withdrawals", icon: "💰" },
  { label: "Reports", to: "/admin/reports", icon: "📈" },
  { label: "Settings", to: "/admin/settings", icon: "⚙️" }
];

function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10"
            >
              ☰
            </button>
            <Link to="/admin/dashboard" className="text-lg font-bold text-sky-400">
              PayTm Admin
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold">{admin?.fullName}</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest">{admin?.role}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-r from-sky-400 to-cyan-300 text-sm font-semibold text-slate-950">
              {(admin?.fullName || "A").slice(0, 1).toUpperCase()}
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-400/15"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 border-r border-white/10 bg-slate-950/50 backdrop-blur">
            <nav className="space-y-2 p-4">
              {adminNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg border border-transparent px-4 py-3 text-sm transition hover:border-sky-400/50 hover:bg-white/5"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
