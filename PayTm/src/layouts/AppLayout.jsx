import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const essentialNav = [
  { label: "Dashboard", to: "/dashboard", icon: "📊" },
  { label: "Send Money", to: "/send", icon: "💸" },
  { label: "Profile", to: "/profile", icon: "👤" }
];

function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAuthenticated = Boolean(user);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!profileMenuRef.current) {
        return;
      }

      if (!profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const statusLabel = user?.kyc?.status
    ? user.kyc.status.replaceAll("_", " ")
    : "not submitted";
  const profilePhoto = user?.profileImage?.url || user?.kyc?.profileImage?.url || null;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-sky-400">PayTm</p>
          </Link>

          {/* Center Navigation - Only Essential Items */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-1">
              {essentialNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    isActive(item.to)
                      ? "border border-sky-400/60 bg-sky-400/10 text-white"
                      : "border border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          ) : null}

          {/* Right Side - Auth & Profile */}
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
              <div
                ref={profileMenuRef}
                className="relative flex items-center"
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-2 text-left text-sm font-medium text-white transition hover:bg-slate-800/95"
                >
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-linear-to-r from-sky-400 to-cyan-300 text-xs font-semibold text-slate-950">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      (user?.fullName || "U").slice(0, 1).toUpperCase()
                    )}
                  </span>
                  <span className="hidden sm:block">
                    <span className="block text-sm font-semibold text-white">{user?.fullName || "Profile"}</span>
                    <span className="block text-xs text-slate-400">{statusLabel}</span>
                  </span>
                </button>

                {profileOpen ? (
                  <div
                    className="absolute right-0 mt-0 w-80 rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/80"
                    style={{ top: "100%", marginTop: "8px", zIndex: 9999 }}
                  >
                    <div className="border-b border-white/10 p-4">
                      <div className="text-sm font-semibold text-white">{user?.fullName}</div>
                      <div className="mt-1 text-xs text-slate-400">{user?.phoneNumber}</div>
                      <div className="mt-1 text-xs text-slate-400">UPI: {user?.upiId || "Not assigned"}</div>
                      <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                        KYC {statusLabel}
                      </div>
                    </div>

                    <div className="space-y-2 p-3">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                      >
                        View profile
                      </Link>
                      <Link
                        to="/kyc"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200 transition hover:bg-amber-400/15"
                      >
                        Verify KYC
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-left text-sm text-rose-200 transition hover:bg-rose-400/15"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="min-h-[calc(100vh-73px)] w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;