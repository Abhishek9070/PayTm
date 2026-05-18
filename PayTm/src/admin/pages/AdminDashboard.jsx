import { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import adminApi from "../services/adminApi";

const cardList = [
  { key: "totalUsers", label: "Total users", icon: "👥", color: "from-blue-500 to-cyan-400" },
  { key: "totalTransactions", label: "Total transactions", icon: "💳", color: "from-emerald-500 to-teal-400" },
  { key: "totalDeposits", label: "Total deposits", icon: "⬆️", color: "from-green-500 to-emerald-400" },
  { key: "totalWithdrawals", label: "Total withdrawals", icon: "⬇️", color: "from-rose-500 to-pink-400" },
  { key: "pendingKyc", label: "Pending KYC", icon: "🆔", color: "from-orange-500 to-red-400" },
  { key: "pendingWithdrawals", label: "Pending withdrawals", icon: "⏳", color: "from-yellow-500 to-amber-400" },
  { key: "fraudAlerts", label: "Fraud alerts", icon: "🚨", color: "from-red-600 to-orange-400" },
  { key: "revenue", label: "Revenue", icon: "💰", color: "from-purple-500 to-pink-400" },
  { key: "activeUsers", label: "Active users", icon: "⚡", color: "from-sky-500 to-indigo-400" }
];

export default function AdminDashboard() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await adminApi.get("/dashboard/stats");
        if (!mounted) return;
        setStats(res.data?.data || res.data || {});
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || "Failed to load stats");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-8">
      {/* Welcome */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Welcome, {admin?.fullName}</h1>
        <p className="mt-2 text-slate-300">
          Role: <span className="font-semibold capitalize">{admin?.role?.replace("_", " ")}</span>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-600/20 bg-red-900/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardList.map((c) => (
          <div key={c.key} className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">{c.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {loading ? "Loading..." : (stats?.[c.key] ?? "—")}
                </p>
              </div>
              <div className={`rounded-2xl bg-linear-to-r ${c.color} p-3 text-2xl`}>
                {c.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Admin Info (unchanged) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          <div className="mt-4 space-y-2">
            <button className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10">
              📋 Review Pending KYC
            </button>
            <button className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10">
              💳 Check Transactions
            </button>
            <button className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10">
              📊 View Reports
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Admin Info</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <span className="text-slate-400">Email:</span>
              <span className="ml-2 font-medium text-white">{admin?.email}</span>
            </div>
            <div>
              <span className="text-slate-400">Role:</span>
              <span className="ml-2 font-medium capitalize text-white">
                {admin?.role?.replace("_", " ")}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Permissions:</span>
              <span className="ml-2 font-medium text-white">
                {admin?.permissions?.length || 0} permissions
              </span>
            </div>
            <div>
              <span className="text-slate-400">Status:</span>
              <span className="ml-2 font-medium text-emerald-400">
                {admin?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
