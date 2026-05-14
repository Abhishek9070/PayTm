import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { LoadingButton, StackSkeleton } from "../components/ui/loading-state.jsx";
import toast from "react-hot-toast";

function TransactionRow({ tx }) {
  const when = new Date(tx.createdAt).toLocaleString();

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/6 bg-slate-900/30 p-4">
      <div>
        <div className="text-sm text-slate-300">
          <span className="font-medium text-white">{tx.type.toUpperCase()}</span>
          {tx.direction ? ` • ${tx.direction}` : ""}
        </div>
        <div className="mt-1 text-sm text-slate-400">{tx.counterparty?.fullName ?? tx.counterparty?.phoneNumber ?? "—"}</div>
      </div>

      <div className="text-right">
        <div className="text-lg font-semibold text-white">₹{tx.amount}</div>
        <div className="mt-1 text-xs text-slate-400">{when}</div>
        <div className="mt-1 text-xs text-slate-300">{tx.status}</div>
      </div>
    </div>
  );
}

export default function History() {
  const { user } = useAuth();
  const refreshCounter = useSelector(state => state.ui.transactionRefreshCounter);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const query = useMemo(() => ({ page, limit, type, status, startDate, endDate, refreshCounter }), [page, limit, type, status, startDate, endDate, refreshCounter]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const params = { page, limit };
        if (type) params.type = type;
        if (status) params.status = status;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const { data } = await api.get("/transactions/history", { params });

        if (cancelled) return;

        setTransactions(data?.data?.transactions || []);
        setTotalPages(data?.data?.pagination?.totalPages || 1);
      } catch (err) {
        if (cancelled) return;
        const message = err?.response?.data?.message || err.message || "Failed to load transactions";
        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [query]);

  const resetFilters = () => {
    setType("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Transactions</h1>
        <div className="text-sm text-slate-400">{user?.fullName ?? user?.phoneNumber}</div>
      </header>

      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="rounded-md bg-slate-800 px-3 py-2 text-sm text-white">
            <option value="">All types</option>
            <option value="transfer">Transfer</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="send">Send</option>
            <option value="receive">Receive</option>
          </select>

          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-md bg-slate-800 px-3 py-2 text-sm text-white">
            <option value="">All status</option>
            <option value="success">Success/Approved</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed/Rejected</option>
          </select>

          <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="rounded-md bg-slate-800 px-3 py-2 text-sm text-white" />
          <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="rounded-md bg-slate-800 px-3 py-2 text-sm text-white" />
          <button onClick={resetFilters} className="rounded-md bg-sky-500 px-3 py-2 text-sm text-white">Reset</button>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-400">Page</div>
          <div className="text-sm font-medium text-white">{page} / {totalPages}</div>
        </div>
      </section>

      <section className="space-y-3">
        {loading ? <StackSkeleton rows={4} /> : null}
        {error && <div className="text-sm text-rose-400">{error}</div>}

        {!loading && transactions.length === 0 && <div className="text-sm text-slate-400">No transactions found.</div>}

        <div className="grid gap-3">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      </section>

      <footer className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LoadingButton loading={loading} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded bg-slate-800 px-3 py-2 text-sm text-white">
            Previous
          </LoadingButton>
          <LoadingButton loading={loading} disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded bg-slate-800 px-3 py-2 text-sm text-white">
            Next
          </LoadingButton>
        </div>

        <div className="text-sm text-slate-400">Showing {transactions.length} items</div>
      </footer>
    </div>
  );
}
