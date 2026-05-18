import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAdminAuth } from "../admin/context/AdminAuthContext.jsx";

function Home() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useAuth();
  const { admin, loading: adminLoading } = useAdminAuth();

  useEffect(() => {
    if (userLoading || adminLoading) return;

    if (admin) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [admin, adminLoading, navigate, user, userLoading]);

  if (userLoading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08111f] text-white">
        <div className="text-sm tracking-[0.25em] text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_28%),linear-gradient(135deg,#07111f_0%,#0b1528_55%,#111827_100%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <section className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm tracking-wide text-slate-200 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
              Secure access portal
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              PayTm account access for users and admins.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Users can sign in or create an account from the public flow. Admin access is separate and can only be provisioned by the site owner.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
              >
                User Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                User Signup
              </Link>
              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-6 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/15"
              >
                Admin Login
              </Link>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-4xl border border-white/10 bg-white/8 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Admin access</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Only owner-created admins can sign in here</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Admin accounts are not created from public signup. Use the Admin Login button above, or go directly to the admin login page.
                </p>
              </div>

              <div className="mt-8 space-y-4 text-sm leading-6 text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  Public signup creates a normal user account only.
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  Admin accounts are provisioned separately by the site owner from the backend.
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  Admins use the dedicated admin panel, not the user dashboard.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Home;