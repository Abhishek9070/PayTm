import { useEffect, useState } from "react";
import api from "../api/axios";
import { LoadingButton, StackSkeleton } from "../components/ui/loading-state.jsx";
import toast from "react-hot-toast";

function WithdrawalRow({ w }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/6 bg-slate-900/30 p-4">
      <div>
        <div className="text-sm text-slate-300">Withdrawal</div>
        <div className="mt-1 text-sm text-slate-400">UPI: {w.upiId}</div>
      </div>

      <div className="text-right">
        <div className="text-lg font-semibold text-white">₹{w.amount}</div>
        <div className="mt-1 text-xs text-slate-400">{new Date(w.createdAt).toLocaleString()}</div>
        <div className="mt-1 text-xs text-slate-300">{w.status}</div>
      </div>
    </div>
  );
}

export default function WithdrawalPage() {
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setHistoryLoading(true);
      try {
        const { data } = await api.get("/withdrawals/my");
        if (!cancelled) setHistory(data?.data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || "Failed to load withdrawal history");
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }

    loadHistory();

    return () => { cancelled = true; };
  }, []);

  const isValidUpi = (v) => typeof v === "string" && v.includes("@") && v.length >= 3;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return setError("Enter a valid amount greater than 0");
    if (!isValidUpi(upiId)) return setError("Enter a valid UPI id");

    setLoading(true);
    try {
      const { data } = await api.post("/withdrawals", { amount: parsed, upiId });
      setSuccess(data?.message || "Withdrawal request created");
      toast.success(data?.message || "Withdrawal request created");
      setAmount("");
      setUpiId("");
      setHistory((h) => [data?.data, ...h]);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Failed to create withdrawal request";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Withdraw</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Amount (₹)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-white" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">UPI ID</label>
          <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="example@bank" className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-white" />
        </div>

        {error && <div className="rounded-md bg-rose-900/40 p-3 text-sm text-rose-300">{error}</div>}
        {success && <div className="rounded-md bg-emerald-900/40 p-3 text-sm text-emerald-200">{success}</div>}

        <div className="flex items-center gap-2">
          <LoadingButton loading={loading} className="rounded bg-sky-500 px-4 py-2 text-sm font-medium text-white">
            Request Withdrawal
          </LoadingButton>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-white">Withdrawal History</h2>
        {historyLoading ? <StackSkeleton rows={3} /> : null}
        {!historyLoading && history.length === 0 && <div className="text-sm text-slate-400">No withdrawals found.</div>}
        <div className="grid gap-3">
          {history.map((w) => <WithdrawalRow key={w._id} w={w} />)}
        </div>
      </section>
    </div>
  );
}
