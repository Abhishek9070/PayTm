import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminApi from "../services/adminApi";
import api from "../../api/axios";

export default function AdminKyc() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPending = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await adminApi.get("/kyc/pending");
      setPending(res.data?.data?.pending || res.data?.pending || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load KYC requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const approve = async (id) => {
    try {
      await api.patch(`/kyc/${id}/review`, { status: "approved" });
      await loadPending();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to approve KYC");
    }
  };

  const reject = async (id) => {
    const rejectionReason = window.prompt("Reason for rejection?");
    if (!rejectionReason) return;

    try {
      await api.patch(`/kyc/${id}/review`, { status: "rejected", rejectionReason });
      await loadPending();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to reject KYC");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">KYC reviews</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Pending KYC submissions</h1>
        <p className="mt-2 text-sm text-slate-300">Approve or reject submitted identity documents.</p>
      </div>

      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div> : null}

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 text-sm text-slate-300">Loading KYC requests...</div>
        ) : pending.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 text-sm text-slate-300">No pending KYC submissions.</div>
        ) : (
          pending.map((item) => (
            <div key={item._id} className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{item.fullName}</h2>
                  <p className="text-sm text-slate-300">{item.phoneNumber} • {item.email || "No email"}</p>
                  <p className="mt-2 text-sm text-slate-400">Status: {item.kyc?.status || "pending"}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Link to={`/admin/kyc/${item._id}`} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">View</Link>
                  <button
                    type="button"
                    onClick={() => approve(item._id)}
                    className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => reject(item._id)}
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