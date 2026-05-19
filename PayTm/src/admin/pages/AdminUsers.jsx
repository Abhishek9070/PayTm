import { useEffect, useState } from "react";
import adminApi from "../services/adminApi";

const badgeStyles = {
  verified: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  pending: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  blocked: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  frozen: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  default: "border-white/10 bg-white/5 text-slate-200"
};

function getKycBadge(status) {
  switch (status) {
    case "approved":
      return badgeStyles.verified;
    case "pending":
      return badgeStyles.pending;
    case "rejected":
      return badgeStyles.blocked;
    default:
      return badgeStyles.default;
  }
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const loadUsers = async (search = "") => {
    setLoading(true);
    setError("");

    try {
      const res = await adminApi.get("/users", {
        params: search ? { q: search, limit: 100 } : { limit: 100 }
      });

      setUsers(res.data?.data?.users || res.data?.users || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAction = async (id, action) => {
    const endpointMap = {
      freeze: `/users/${id}/freeze`,
      unfreeze: `/users/${id}/unfreeze`,
      block: `/users/${id}/block`
    };

    try {
      await adminApi.patch(endpointMap[action]);
      await loadUsers(query);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Action failed");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Admin users</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">User management</h1>
        <p className="mt-2 text-sm text-slate-300">Search users, inspect KYC state, and freeze or block accounts.</p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, email, UPI"
            className="flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={() => loadUsers(query)}
            className="rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
          >
            Search
          </button>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div> : null}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 backdrop-blur">
        {loading ? (
          <div className="p-6 text-sm text-slate-300">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-sm text-slate-300">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">KYC</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user._id} className="align-top text-slate-200">
                    <td className="px-4 py-4 font-medium text-white">{user.fullName}</td>
                    <td className="px-4 py-4">{user.phoneNumber}</td>
                    <td className="px-4 py-4">{user.email || "-"}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getKycBadge(user.kyc?.status)}`}>
                        {user.kyc?.status || "not submitted"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2 text-xs">
                        {user.isBlocked ? (
                          <span className="inline-flex rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-rose-200">Blocked</span>
                        ) : null}
                        {user.isFrozen ? (
                          <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-sky-200">Frozen</span>
                        ) : null}
                        {!user.isBlocked && !user.isFrozen ? (
                          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-200">Active</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleAction(user._id, user.isFrozen ? "unfreeze" : "freeze")}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
                        >
                          {user.isFrozen ? "Unfreeze" : "Freeze"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(user._id, "block")}
                          className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-200 transition hover:bg-rose-400/15"
                        >
                          Block
                        </button>
                      </div>
                    </td>
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