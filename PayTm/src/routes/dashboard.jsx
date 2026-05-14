import { Link } from "react-router-dom";

const quickAccessCards = [
  { label: "Wallet", to: "/wallet", icon: "💰", color: "from-blue-500 to-cyan-400", description: "View and manage your balance" },
  { label: "Send Money", to: "/send", icon: "💸", color: "from-emerald-500 to-teal-400", description: "Transfer money to contacts" },
  { label: "Deposit", to: "/deposit", icon: "📥", color: "from-purple-500 to-pink-400", description: "Add funds to your account" },
  { label: "Withdrawal", to: "/withdrawal", icon: "📤", color: "from-orange-500 to-red-400", description: "Withdraw money" },
  { label: "Transaction History", to: "/transactions", icon: "📊", color: "from-indigo-500 to-blue-400", description: "View all your transactions" },
  { label: "Profile", to: "/profile", icon: "👤", color: "from-sky-500 to-cyan-400", description: "Manage your profile" }
];

function Dashboard() {
  return (
    <section className="space-y-8 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Dashboard</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Welcome back to PayTm</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          Quick access to all your financial tools and services. Use the top navigation or select any option below.
        </p>
      </div>

      {/* Quick Access Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickAccessCards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur transition hover:border-white/20 hover:bg-slate-950/80"
          >
            <div className={`inline-flex rounded-2xl bg-linear-to-r ${card.color} p-3 text-2xl`}>
              {card.icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-sky-300 transition">{card.label}</h3>
            <p className="mt-2 text-sm text-slate-300 group-hover:text-slate-200 transition">{card.description}</p>
            <div className="mt-4 flex items-center text-xs font-medium text-sky-400 group-hover:text-sky-300 transition">
              Access →
            </div>
          </Link>
        ))}
      </div>

      {/* Info Section */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur">
        <h3 className="text-lg font-semibold text-white">💡 Pro Tip</h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          You can access essential features (Dashboard, Send Money, Profile) directly from the top navigation bar. Everything else is available as quick access cards here.
        </p>
      </div>
    </section>
  );
}

export default Dashboard;
