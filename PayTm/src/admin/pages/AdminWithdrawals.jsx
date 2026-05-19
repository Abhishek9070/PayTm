import { useEffect, useState } from "react";
import adminApi from "../services/adminApi";
import api from "../../api/axios";

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWithdrawals = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/withdrawals/pending");
      setWithdrawals(res.data?.data || res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const approve = async (withdrawalId) => {
    try {
      await api.patch(`/withdrawals/${withdrawalId}/approve`);
      await loadWithdrawals();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to approve withdrawal");
    }
  };

  const reject = async (withdrawalId) => {
    const reason = window.prompt("Reason for rejection?");
    if (reason === null) return;

    try {
      await api.patch(`/withdrawals/${withdrawalId}/reject`, { reason });
      await loadWithdrawals();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to reject withdrawal");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Withdrawals</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Pending withdrawal approvals</h1>
        <p className="mt-2 text-sm text-slate-300">Review and process pending withdrawal requests.</p>
      </div>

      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div> : null}

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 text-sm text-slate-300">Loading withdrawals...</div>
        ) : withdrawals.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 text-sm text-slate-300">No pending withdrawals.</div>
        ) : (
          withdrawals.map((withdrawal) => (
            <div key={withdrawal._id} className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">₹{Number(withdrawal.amount || 0).toLocaleString()}</h2>
                  <p className="text-sm text-slate-300">User: {withdrawal.userId?.fullName || "Unknown"}</p>
                  <p className="text-sm text-slate-400">Phone: {withdrawal.userId?.phoneNumber || "-"}</p>
                  <p className="text-sm text-slate-400">UPI: {withdrawal.upiId || "-"}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => approve(withdrawal._id)}
                    className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => reject(withdrawal._id)}
                    className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/15"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}