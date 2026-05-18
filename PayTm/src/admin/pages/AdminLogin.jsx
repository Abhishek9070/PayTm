import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import adminApi from "../services/adminApi";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!phoneNumber || !password) {
      setError("Phone number and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await adminApi.post("/auth/login", {
        phoneNumber,
        password
      });

      const authData = response?.data?.data;

      if (authData?.admin && authData?.accessToken) {
        login(authData);
        toast.success("Admin login successful");
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError("Invalid response from server");
      }
    } catch (requestError) {
      const message = requestError?.response?.data?.message || requestError?.message || "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Admin Portal</p>
          <h1 className="mt-3 text-3xl font-bold text-white">PayTm Admin</h1>
          <p className="mt-2 text-sm text-slate-300">Sign in to manage your platform</p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200">Phone number</label>
            <input
              type="tel"
              inputMode="numeric"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setError("");
              }}
              placeholder="10-digit admin phone number"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:bg-slate-700/80 focus:ring-1 focus:ring-sky-400/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:bg-slate-700/80 focus:ring-1 focus:ring-sky-400/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-linear-to-r from-sky-400 to-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Authorized personnel only. All access is logged and monitored.
        </p>
      </div>
    </div>
  );
}
