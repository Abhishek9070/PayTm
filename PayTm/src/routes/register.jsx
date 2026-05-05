import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";
import { LoadingButton } from "../components/ui/loading-state.jsx";
import toast from "react-hot-toast";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: ""
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.fullName.trim()) {
      setError("Enter your full name to continue.");
      return;
    }

    if (!formData.phoneNumber.trim() || !formData.password.trim()) {
      setError("Enter your phone number and password to create an account.");
      return;
    }

    setSending(true);

    const toastId = toast.loading("Creating account...");

    try {
      const response = await api.post("/auth/register", {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password
      });

      const authData = response?.data?.data ?? response?.data ?? {};
      login(authData);
      toast.success("Account created successfully", { id: toastId });
      navigate("/dashboard");
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Unable to create your account right now.";

      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_30%),linear-gradient(135deg,#07111f_0%,#0b1528_55%,#111827_100%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <section className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm tracking-wide text-slate-200 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
              Password signup
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Create a registered account and move straight into the dashboard.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Signup now stores a password so the login screen can verify real users.
            </p>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-4xl border border-white/10 bg-white/8 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-300">Create account</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Signup to continue</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Add your name, phone number, email, and password.
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-200">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-slate-200">
                    Phone number
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
                  />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                <LoadingButton
                  type="submit"
                  loading={sending}
                  className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-amber-300 to-orange-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Create account
                </LoadingButton>

                <p className="text-center text-sm text-slate-300">
                  Already have access?{" "}
                  <Link to="/login" className="font-medium text-white transition hover:text-amber-300">
                    Login
                  </Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Register;
