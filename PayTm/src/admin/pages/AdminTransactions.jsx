import { useEffect, useState } from "react";
import adminApi from "../services/adminApi";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await adminApi.get("/transactions", { params: { limit: 100 } });
        if (!mounted) return;
        setTransactions(res.data?.data?.transactions || res.data?.transactions || []);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || "Failed to load transactions");
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
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Admin transactions</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Transaction oversight</h1>
        <p className="mt-2 text-sm text-slate-300">Review recent platform transactions and suspicious activity.</p>
      </div>

      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div> : null}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 backdrop-blur">
        {loading ? (
          <div className="p-6 text-sm text-slate-300">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-sm text-slate-300">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Receiver</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="text-slate-200">
                    <td className="px-4 py-4 capitalize text-white">{tx.type || "-"}</td>
                    <td className="px-4 py-4">₹{Number(tx.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-4 capitalize">{tx.status || "-"}</td>
                    <td className="px-4 py-4">{tx.sender?.fullName || tx.sender?.phoneNumber || tx.userId?.fullName || "-"}</td>
                    <td className="px-4 py-4">{tx.receiver?.fullName || "-"}</td>
                    <td className="px-4 py-4">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}