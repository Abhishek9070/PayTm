import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";
import { LoadingButton } from "../components/ui/loading-state.jsx";
import toast from "react-hot-toast";

function FileField({ label, fileName, onChange }) {
  return (
    <label className="block cursor-pointer rounded-2xl border border-white/10 bg-slate-950/55 p-4 transition hover:border-sky-400/40 hover:bg-slate-950/75">
      <div className="text-sm font-medium text-white">{label}</div>
      <div className="mt-1 text-xs text-slate-400">{fileName || "No file selected"}</div>
      <input className="sr-only" type="file" accept="image/*" onChange={onChange} />
    </label>
  );
}

function labelFromStatus(status) {
  return String(status || "not_submitted").replaceAll("_", " ");
}

export default function Profile() {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(authUser);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/auth/profile");
        const nextProfile = response?.data?.user ?? null;

        if (active && nextProfile) {
          setProfile(nextProfile);
          updateUser(nextProfile);
        }
      } catch (requestError) {
        if (!active) return;

        const message = requestError?.response?.data?.message || requestError?.message || "Unable to load profile.";
        setError(message);
        toast.error(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [updateUser]);

  const status = labelFromStatus(profile?.kyc?.status);
  const profileImage = profile?.profileImage?.url || profile?.kyc?.profileImage?.url || null;
  const qrValue = profile?.upiId
    ? `upi://pay?pa=${profile.upiId}&pn=${encodeURIComponent(profile.fullName || "PayTm User")}&cu=INR`
    : "";

  const handlePhotoSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!photoFile) {
      setError("Choose a profile photo to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", photoFile);

    setSubmitting(true);

    try {
      const response = await api.post("/users/profile-photo", formData);

      const uploadedUser = response?.data?.data?.user;
      const nextProfile = {
        ...(profile || authUser || {}),
        profileImage: uploadedUser?.profileImage || null
      };

      setProfile(nextProfile);
      updateUser(nextProfile);
      setPhotoFile(null);
      toast.success(response?.data?.message || "Profile photo uploaded successfully");
    } catch (requestError) {
      const message = requestError?.response?.data?.message || requestError?.message || "Unable to upload profile photo.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Profile</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Your account identity</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          Upload your profile photo here. KYC verification is now a separate step.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Account details</div>
                <div className="mt-3 text-2xl font-semibold text-white">{profile?.fullName || "Loading profile..."}</div>
                <div className="mt-2 text-sm text-slate-300">{profile?.phoneNumber || ""}</div>
                <div className="mt-2 text-sm text-slate-300">{profile?.email || "No email added"}</div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.2em] text-slate-300">
                    KYC {status}
                  </span>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 uppercase tracking-[0.2em] text-cyan-200">
                    {profile?.isVerified ? "Verified" : "Not verified"}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Profile photo</div>
                <div className="mt-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 text-3xl font-semibold text-white">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    (profile?.fullName || "U").slice(0, 1).toUpperCase()
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">UPI ID</div>
                <div className="mt-2 break-all text-lg font-semibold text-white">{profile?.upiId || "Not assigned"}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">KYC</div>
                <div className="mt-2 text-sm text-slate-300">Go to the verification page to submit Aadhaar or PAN details.</div>
                <Link
                  to="/kyc"
                  className="mt-4 inline-flex rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/15"
                >
                  Verify KYC
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-slate-400">UPI QR</div>
                <div className="mt-2 text-lg font-semibold text-white">Pay using your personal QR</div>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
                UPI ready
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center rounded-3xl border border-white/10 bg-white p-6">
              {qrValue ? (
                <QRCodeCanvas value={qrValue} size={220} includeMargin />
              ) : (
                <div className="py-16 text-sm text-slate-500">QR will appear after profile loads.</div>
              )}
            </div>

            <div className="mt-4 text-sm leading-7 text-slate-300">
              This QR encodes your UPI payment link and can be shared for receiving money.
            </div>
          </div>
        </div>

        <form onSubmit={handlePhotoSubmit} className="rounded-3xl border border-white/10 bg-slate-950/45 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Profile photo</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Upload a profile picture</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              This upload is separate from KYC and will update the photo shown on your profile and menu.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <FileField
              label="Profile photo"
              fileName={photoFile?.name}
              onChange={(event) => setPhotoFile(event.target.files?.[0] || null)}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Use a clear face photo. Images are uploaded to Cloudinary and stored separately from KYC documents.
          </div>

          <div className="mt-6 flex items-center gap-3">
            <LoadingButton
              type="submit"
              loading={submitting}
              disabled={submitting}
              className="rounded-2xl bg-linear-to-r from-sky-400 to-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              Upload photo
            </LoadingButton>
          </div>
        </form>
      </div>
    </section>
  );
}
