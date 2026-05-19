import { useEffect, useState } from "react";
import adminApi from "../services/adminApi";

const statCards = [
  { key: "users", label: "Users" },
  { key: "verifiedUsers", label: "Verified users" },
  { key: "deposits", label: "Deposits" },
  { key: "withdrawals", label: "Withdrawals" },
  { key: "failedTransactions", label: "Failed transactions" },
  { key: "revenue", label: "Revenue" }
];

export default function AdminReports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await adminApi.get("/dashboard/summary");
        if (!mounted) return;
        setSummary(res.data?.data || res.data || null);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || "Failed to load reports");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Reports</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Admin reporting overview</h1>
        <p className="mt-2 text-sm text-slate-300">A compact operational summary for the platform.</p>
      </div>

      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.key} className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {loading ? "Loading..." : (summary?.totals?.[card.key] ?? summary?.money?.[card.key] ?? summary?.pendingActions?.[card.key] ?? "—")}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold text-white">Pending actions</h2>
        <p className="mt-2 text-sm text-slate-300">
          Deposits: {summary?.pendingActions?.deposits ?? 0} • Withdrawals: {summary?.pendingActions?.withdrawals ?? 0} • Payment orders: {summary?.pendingActions?.paymentOrders ?? 0}
        </p>
        <p className="mt-2 text-sm text-slate-300">Revenue: ₹{Number(summary?.money?.revenue || 0).toLocaleString()}</p>
      </div>
    </section>
  );
}