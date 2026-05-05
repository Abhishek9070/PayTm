import { Link } from "react-router-dom";

const stats = [
  { label: "Status", value: "Dashboard ready" },
  { label: "Access", value: "No OTP required" },
  { label: "Navigation", value: "Login and signup in navbar" }
];

const quickLinks = [
  { label: "Wallet", to: "/wallet" },
  { label: "Deposit", to: "/deposit" },
  { label: "Send money", to: "/send" },
  { label: "Transactions", to: "/transactions" }
];

function Dashboard() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur sm:p-8">
      <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Main dashboard</p>
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Welcome to your PayTm workspace</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
        The app now opens directly on the dashboard while the OTP flow is paused. Use the top navbar for login or signup.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</div>
            <div className="mt-2 text-lg font-medium text-white">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h3 className="text-lg font-semibold text-white">Quick actions</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-sky-400/50 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h3 className="text-lg font-semibold text-white">Current note</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            OTP sending is disabled for now. Once the verification service is ready again, we can reconnect the login flow without changing the dashboard layout.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
