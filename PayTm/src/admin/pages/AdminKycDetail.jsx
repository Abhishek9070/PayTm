import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminApi from "../services/adminApi";
import api from "../../api/axios";

export default function AdminKycDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.get(`/users/${id}`);
      setUser(res.data?.data?.user || res.data?.user || null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load KYC details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const approve = async () => {
    try {
      await api.patch(`/kyc/${id}/review`, { status: "approved" });
      navigate('/admin/kyc');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to approve KYC");
    }
  };

  const reject = async () => {
    const rejectionReason = window.prompt("Reason for rejection?");
    if (!rejectionReason) return;

    try {
      await api.patch(`/kyc/${id}/review`, { status: "rejected", rejectionReason });
      navigate('/admin/kyc');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to reject KYC");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">KYC review</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">KYC Details</h1>
        <p className="mt-2 text-sm text-slate-300">Inspect submitted identity documents and approve or reject.</p>
      </div>

      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div> : null}

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 text-sm text-slate-300">Loading...</div>
      ) : !user ? (
        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 text-sm text-slate-300">User not found.</div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{user.fullName}</h2>
              <p className="text-sm text-slate-300">{user.phoneNumber} • {user.email || 'No email'}</p>
              <p className="mt-2 text-sm text-slate-400">Status: {user.kyc?.status || 'unknown'}</p>
              {user.kyc?.rejectionReason ? <p className="mt-2 text-sm text-rose-300">Rejection: {user.kyc.rejectionReason}</p> : null}
            </div>
            <div className="flex gap-2">
              <button onClick={approve} className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950">Approve</button>
              <button onClick={reject} className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-200">Reject</button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Submitted details</h3>
              <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Document type</p>
                  <p className="mt-1 font-medium text-white">{user.kyc?.documentType || '-'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Submitted at</p>
                  <p className="mt-1 font-medium text-white">{user.kyc?.submittedAt ? new Date(user.kyc.submittedAt).toLocaleString() : '-'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Full name</p>
                  <p className="mt-1 font-medium text-white">{user.kyc?.fullName || '-'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Phone number</p>
                  <p className="mt-1 font-medium text-white">{user.kyc?.phoneNumber || '-'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
                  <p className="text-slate-500">Address</p>
                  <p className="mt-1 font-medium text-white">{user.kyc?.address || '-'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Gender</p>
                  <p className="mt-1 font-medium text-white">{user.kyc?.gender || '-'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Aadhaar</p>
                  <p className="mt-1 font-medium text-white">{user.kyc?.aadhaarNumber || '-'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">PAN</p>
                  <p className="mt-1 font-medium text-white">{user.kyc?.panNumber || '-'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Reviewed at</p>
                  <p className="mt-1 font-medium text-white">{user.kyc?.reviewedAt ? new Date(user.kyc.reviewedAt).toLocaleString() : '-'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Submitted document</h3>
            {user.kyc?.documentImage?.url ? (
                <a href={user.kyc.documentImage.url} target="_blank" rel="noreferrer">
                  <img src={user.kyc.documentImage.url} alt="kyc document" className="max-w-full rounded-lg border border-white/10" />
                </a>
              ) : (
                <p className="text-sm text-slate-400">No document image available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
