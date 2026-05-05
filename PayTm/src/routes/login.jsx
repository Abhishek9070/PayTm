import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    phoneNumber: "",
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

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!formData.phoneNumber.trim() || !formData.password.trim()) {
      setError("Enter your phone number and password to continue.");
      return;
    }

    setSending(true);

    api.post("/auth/login", {
      phoneNumber: formData.phoneNumber,
      password: formData.password
    })
      .then((response) => {
        const authData = response?.data?.data ?? response?.data ?? {};
        login(authData);
        navigate("/dashboard");
      })
      .catch((requestError) => {
        const message =
          requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to log in right now.";

        setError(message);
      })
      .finally(() => {
        setSending(false);
      });
  };

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_28%),linear-gradient(135deg,#07111f_0%,#0b1528_55%,#111827_100%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <section className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm tracking-wide text-slate-200 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
              Password login enabled
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Sign in with your registered phone number and password.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Only registered users can log in now. If you do not have an account yet, use signup first.
            </p>
            <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
              {[
                ["Registered users only", "Unregistered phones are rejected."],
                ["Dashboard first", "Authenticated users land on the main screen."],
                ["Navbar links", "Hidden after login."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-sm font-medium text-white">{title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-300">{text}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-4xl border border-white/10 bg-white/8 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Welcome back</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Log in to continue</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Enter the phone number and password you registered with.
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
                    maxLength={10}
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
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Your password"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
                  />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={sending}
                  className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-sky-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                >
                  {sending ? "Logging in..." : "Continue to dashboard"}
                </button>

                <p className="text-center text-sm text-slate-300">
                  Need an account?{" "}
                  <Link to="/register" className="font-medium text-white transition hover:text-sky-300">
                    Signup
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

export default Login;
