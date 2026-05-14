import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";
import { LoadingButton } from "../components/ui/loading-state.jsx";
import Input from "../components/ui/Input.jsx";
import toast from "react-hot-toast";

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200">{label}</label>
      {children}
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function FileField({ label, fileName, onChange }) {
  return (
    <label className="block cursor-pointer rounded-2xl border border-white/10 bg-slate-950/55 p-4 transition hover:border-sky-400/40 hover:bg-slate-950/75">
      <div className="text-sm font-medium text-white">{label}</div>
      <div className="mt-1 text-xs text-slate-400">{fileName || "No file selected"}</div>
      <input className="sr-only" type="file" accept="image/*" onChange={onChange} />
    </label>
  );
}

const initialForm = {
  documentType: "aadhaar",
  fullName: "",
  phoneNumber: "",
  address: "",
  gender: "",
  aadhaarNumber: "",
  panNumber: ""
};

export default function Kyc() {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(authUser);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [documentImage, setDocumentImage] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await api.get("/auth/profile");
        const nextProfile = response?.data?.user ?? null;

        if (!active || !nextProfile) {
          return;
        }

        setProfile(nextProfile);
        updateUser(nextProfile);

        setForm({
          documentType: nextProfile?.kyc?.documentType || "aadhaar",
          fullName: nextProfile?.kyc?.fullName || nextProfile?.fullName || "",
          phoneNumber: nextProfile?.kyc?.phoneNumber || nextProfile?.phoneNumber || "",
          address: nextProfile?.kyc?.address || "",
          gender: nextProfile?.kyc?.gender || "",
          aadhaarNumber: nextProfile?.kyc?.aadhaarNumber || "",
          panNumber: nextProfile?.kyc?.panNumber || ""
        });
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
  }, []);

  const profileImage = profile?.profileImage?.url || profile?.kyc?.profileImage?.url || null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleDocumentTypeChange = (documentType) => {
    setError("");
    setForm((current) => ({
      ...current,
      documentType,
      aadhaarNumber: documentType === "aadhaar" ? current.aadhaarNumber : "",
      panNumber: documentType === "pan" ? current.panNumber : ""
    }));
    setDocumentImage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.fullName.trim() || !form.phoneNumber.trim() || !form.address.trim() || !form.gender.trim()) {
      setError("Fill full name, phone number, address, and gender.");
      return;
    }

    if (form.documentType === "aadhaar" && !form.aadhaarNumber.trim()) {
      setError("Aadhaar number is required for Aadhaar verification.");
      return;
    }

    if (form.documentType === "pan" && !form.panNumber.trim()) {
      setError("PAN number is required for PAN verification.");
      return;
    }

    if (!documentImage) {
      setError("Upload the selected document image.");
      return;
    }

    const formData = new FormData();
    formData.append("documentType", form.documentType);
    formData.append("fullName", form.fullName);
    formData.append("phoneNumber", form.phoneNumber);
    formData.append("address", form.address);
    formData.append("gender", form.gender);
    formData.append("aadhaarNumber", form.aadhaarNumber);
    formData.append("panNumber", form.panNumber);
    formData.append("documentImage", documentImage);

    setSubmitting(true);

    try {
      const response = await api.post("/kyc/submit", formData);

      const submittedUser = response?.data?.data?.user;
      if (submittedUser) {
        const nextProfile = {
          ...(profile || authUser || {}),
          kyc: submittedUser.kyc,
          isVerified: submittedUser.isVerified
        };

        setProfile(nextProfile);
        updateUser(nextProfile);
      }

      toast.success(response?.data?.message || "KYC submitted successfully");
    } catch (requestError) {
      const message = requestError?.response?.data?.message || requestError?.message || "Unable to submit KYC.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const documentLabel = form.documentType === "pan" ? "PAN card image" : "Aadhaar card image";

  return (
    <section className="space-y-6 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-300">KYC verification</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Choose Aadhaar or PAN verification</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          Fill the shared identity form once, then submit either your Aadhaar or PAN document for review.
        </p>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-rose-400 hover:text-rose-300"
          >
            ✕
          </button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Profile summary</div>
          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 text-2xl font-semibold text-white">
              {profileImage ? <img src={profileImage} alt="Profile" className="h-full w-full object-cover" /> : (profile?.fullName || "U").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{profile?.fullName || "Loading profile..."}</div>
              <div className="mt-1 text-sm text-slate-300">{profile?.phoneNumber || ""}</div>
              <div className="mt-1 text-sm text-slate-300">{profile?.upiId || "No UPI assigned"}</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            KYC status: <span className="font-medium text-white">{String(profile?.kyc?.status || "not_submitted").replaceAll("_", " ")}</span>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-sky-400/10 p-4 text-sm text-sky-100">
            Aadhaar and PAN use the same form fields. Only the document type and ID number change.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-slate-950/45 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          {loading && (
            <div className="mb-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-200">
              Loading your profile data...
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleDocumentTypeChange("aadhaar")}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                form.documentType === "aadhaar"
                  ? "border-sky-400/60 bg-sky-400/10 text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Aadhaar verification
            </button>
            <button
              type="button"
              onClick={() => handleDocumentTypeChange("pan")}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                form.documentType === "pan"
                  ? "border-amber-400/60 bg-amber-400/10 text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              PAN verification
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name" />
            </Field>
            <Field label="Phone number">
              <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="9876543210" maxLength={10} />
            </Field>
            <Field label="Address" hint="Current residential address">
              <Input name="address" value={form.address} onChange={handleChange} placeholder="Enter your address" />
            </Field>
            <Field label="Gender">
              <Input name="gender" value={form.gender} onChange={handleChange} placeholder="Male / Female / Other" />
            </Field>
            {form.documentType === "aadhaar" ? (
              <Field label="Aadhaar number">
                <Input name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleChange} placeholder="12-digit Aadhaar number" maxLength={12} />
              </Field>
            ) : (
              <Field label="PAN number">
                <Input name="panNumber" value={form.panNumber} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10} />
              </Field>
            )}
          </div>

          <div className="mt-6">
            <FileField
              label={documentLabel}
              fileName={documentImage?.name}
              onChange={(event) => setDocumentImage(event.target.files?.[0] || null)}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Upload only the document image that matches your chosen verification type.
          </div>

          <div className="mt-6 flex items-center gap-3">
            <LoadingButton
              type="submit"
              loading={submitting}
              disabled={submitting}
              className="rounded-2xl bg-linear-to-r from-amber-300 to-orange-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              Submit KYC
            </LoadingButton>
          </div>
        </form>
      </div>
    </section>
  );
}
