import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Wallet", to: "/wallet" },
  { label: "Transactions", to: "/transactions" },
  { label: "Withdrawal", to: "/withdrawal" },
  { label: "Deposit", to: "/deposit" }
];

function AppLayout() {
  const { user, logout } = useAuth();
  const isAuthenticated = Boolean(user);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-sky-300">PayTm</p>
            <h1 className="mt-1 text-lg font-semibold sm:text-xl">Main Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-2xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                >
                  Signup
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={logout}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)] ">
      
        <aside className="fixed left-0 top-73px w-64 h-[calc(100vh-73px)] overflow-y-auto rounded-none border-r border-white/10 bg-white/5 p-3 backdrop-blur ">
          <p className="px-2 text-xs uppercase tracking-[0.2em] text-slate-400">Navigation</p>
          <nav className="mt-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block rounded-2xl border border-transparent px-4 py-3 text-sm text-slate-200 transition hover:border-sky-400/50 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 ml-1 flex flex-col items-center py-6 px-4" style={{ marginLeft: 'calc(256px + 4px)' }}>
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;