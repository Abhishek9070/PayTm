import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";
import { LoadingButton } from "../components/ui/loading-state.jsx";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

function EditProfile() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: ""
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        email: user.email || ""
      });
      setIsInitialized(true);
    }
  }, [user]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError("");

    if (!profileData.fullName.trim()) {
      setProfileError("Full name is required.");
      return;
    }

    if (!profileData.email.trim()) {
      setProfileError("Email is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setProfileError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating profile...");

    try {
      const response = await api.patch("/users/profile", {
        fullName: profileData.fullName,
        email: profileData.email
      });

      const updatedUser = response?.data?.data ?? response?.data ?? {};
      login(updatedUser);
      toast.success("Profile updated successfully", { id: toastId });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Unable to update your profile right now.";

      setProfileError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");

    if (!passwordData.oldPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError("New password is required.");
      return;
    }

    if (!passwordData.confirmPassword) {
      setPasswordError("Confirm password is required.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      setPasswordError("New password cannot be the same as current password.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Changing password...");

    try {
      await api.patch("/users/change-password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      toast.success("Password changed successfully", { id: toastId });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Unable to change password right now.";

      setPasswordError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen w-full bg-[#08111f] text-white bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_30%),linear-gradient(135deg,#07111f_0%,#0b1528_55%,#111827_100%)] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#08111f] text-white bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_30%),linear-gradient(135deg,#07111f_0%,#0b1528_55%,#111827_100%)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm tracking-wide text-slate-200 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
            Account Settings
          </div>
          <h1 className="mt-6 text-4xl font-bold text-white sm:text-5xl">Manage your account</h1>
          <p className="mt-3 text-lg text-slate-400">Update your profile information and security settings</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Profile Update Section */}
          <div className="flex flex-col rounded-3xl border border-white/10 bg-transparent p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Profile Information</h2>
              <p className="mt-2 text-slate-400">Update your name and email address</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="flex flex-col space-y-6 grow">
              <div>
                <label htmlFor="fullName" className="mb-3 block text-sm font-semibold text-slate-200 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-5 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-3 block text-sm font-semibold text-slate-200 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-5 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-5 py-3.5 text-sm text-blue-200">
                <p>📱 Phone number is fixed for security and cannot be changed.</p>
              </div>

              {profileError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/15 px-5 py-3.5 text-sm text-red-200">
                  ⚠️ {profileError}
                </div>
              )}

              <div className="mt-auto flex gap-3 pt-2">
                <LoadingButton
                  type="submit"
                  loading={loading}
                  className="flex-1 rounded-xl bg-linear-to-r from-amber-300 via-amber-400 to-orange-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Update Profile
                </LoadingButton>
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex-1 rounded-xl border border-slate-600 bg-slate-800/40 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700/60 hover:border-slate-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Password Change Section */}
          <div className="flex flex-col rounded-3xl border border-white/10 bg-transparent p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Change Password</h2>
              <p className="mt-2 text-slate-400">Keep your account secure with a strong password</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="flex flex-col space-y-6 grow">
              <div>
                <label htmlFor="oldPassword" className="mb-3 block text-sm font-semibold text-slate-200 uppercase tracking-wide">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="oldPassword"
                    name="oldPassword"
                    type={showPasswords.old ? "text" : "password"}
                    autoComplete="current-password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-5 py-3 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPasswords.old ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="mb-3 block text-sm font-semibold text-slate-200 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    autoComplete="new-password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-5 py-3 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPasswords.new ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-3 block text-sm font-semibold text-slate-200 uppercase tracking-wide">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-5 py-3 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPasswords.confirm ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-3.5 text-sm text-amber-200">
                <p>🔒 Password must be at least 6 characters long.</p>
              </div>

              {passwordError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/15 px-5 py-3.5 text-sm text-red-200">
                  ⚠️ {passwordError}
                </div>
              )}

              <LoadingButton
                type="submit"
                loading={loading}
                className="mt-auto w-full rounded-xl bg-linear-to-r from-cyan-400 via-sky-400 to-blue-500 px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Change Password
              </LoadingButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
