import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAdminAuth } from "../context/AdminAuthContext";
import adminApi from "../services/adminApi";

export default function AdminSettings() {
  const { admin, logout, updateAdmin } = useAdminAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName: admin?.fullName || "",
      email: admin?.email || "",
      phoneNumber: admin?.phoneNumber || ""
    }));
  }, [admin]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await adminApi.patch("/auth/profile", form);
      const updatedAdmin = response.data?.data?.admin;

      if (updatedAdmin) {
        updateAdmin(updatedAdmin);
      }

      setForm((current) => ({ ...current, currentPassword: "", newPassword: "" }));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Settings</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Admin account settings</h1>
        <p className="mt-2 text-sm text-slate-300">Update your contact details and password.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <form onSubmit={saveProfile} className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Profile details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["fullName", "Full name", "text"],
              ["email", "Email", "email"],
              ["phoneNumber", "Phone number", "tel"]
            ].map(([name, label, type]) => (
              <label key={name} className="text-sm text-slate-300">
                {label}
                <input
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={updateField}
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400/60"
                />
              </label>
            ))}
          </div>

          <h2 className="mt-8 text-lg font-semibold text-white">Change password</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">
              Current password
              <input name="currentPassword" type="password" value={form.currentPassword} onChange={updateField} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400/60" />
            </label>
            <label className="text-sm text-slate-300">
              New password
              <input name="newPassword" type="password" minLength={8} value={form.newPassword} onChange={updateField} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400/60" />
            </label>
          </div>

          <button type="submit" disabled={saving} className="mt-6 rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>

        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Access</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <div>Role: <span className="text-white capitalize">{admin?.role?.replace("_", " ") || "-"}</span></div>
            <div>Permissions: <span className="text-white">{admin?.permissions?.length || 0}</span></div>
          </div>
          <button type="button" onClick={() => { logout(); window.location.href = "/"; }} className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/15">
            Logout
          </button>
        </div>
      </div>
    </section>
  );
}