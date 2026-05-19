import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminSettings() {
  const { admin, logout } = useAdminAuth();

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Settings</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Admin account settings</h1>
        <p className="mt-2 text-sm text-slate-300">Current admin identity and access guidance.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Signed in as</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <div>Name: <span className="text-white">{admin?.fullName || "-"}</span></div>
            <div>Phone: <span className="text-white">{admin?.phoneNumber || "-"}</span></div>
            <div>Email: <span className="text-white">{admin?.email || "-"}</span></div>
            <div>Role: <span className="text-white capitalize">{admin?.role?.replace("_", " ") || "-"}</span></div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Provisioning rules</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <p>Public signup creates normal users only.</p>
            <p>Admin accounts are created from the backend seed script or by promoting an existing user.</p>
            <p>Use the owner-controlled admin login page for admin access.</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/15"
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  );
}