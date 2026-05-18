import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from "recharts";
import adminApi from "../services/adminApi";

function formatDate(d) {
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const to = new Date();
        const from = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
        const params = { fromDate: from.toISOString(), toDate: to.toISOString(), limit: 1000 };
        const [txRes, evRes] = await Promise.all([
          adminApi.get("/transactions", { params }),
          adminApi.get("/security-events", { params })
        ]);
        if (!mounted) return;
        setTransactions(txRes.data?.data?.transactions || txRes.data?.transactions || []);
        setEvents(evRes.data?.data?.events || evRes.data?.events || []);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || "Failed to load analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const series = useMemo(() => {
    // build last 30 days map
    const map = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      const key = formatDate(d);
      map[key] = { date: key, volume: 0, deposits: 0, withdrawals: 0, users: new Set(), events: 0 };
    }

    transactions.forEach((t) => {
      const day = formatDate(t.createdAt || t.created_at || t.updatedAt || Date.now());
      if (!map[day]) map[day] = { date: day, volume: 0, deposits: 0, withdrawals: 0, users: new Set(), events: 0 };
      map[day].volume += Number(t.amount || 0);
      if (t.type === "deposit") map[day].deposits += Number(t.amount || 0);
      if (t.type === "withdrawal") map[day].withdrawals += Number(t.amount || 0);
      const uid = t.userId?._id || t.userId || t.sender?._id || t.sender || t.receiver?._id || t.receiver;
      if (uid) map[day].users.add(String(uid));
    });

    events.forEach((e) => {
      const day = formatDate(e.createdAt || e.created_at || Date.now());
      if (!map[day]) map[day] = { date: day, volume: 0, deposits: 0, withdrawals: 0, users: new Set(), events: 0 };
      map[day].events += 1;
    });

    return Object.values(map).map((r) => ({
      date: r.date,
      volume: r.volume,
      deposits: r.deposits,
      withdrawals: r.withdrawals,
      activeUsers: r.users.size,
      events: r.events
    }));
  }, [transactions, events]);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <h3 className="mb-2 text-sm text-slate-300">Transaction Volume (last 30 days)</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="volume" stroke="#60a5fa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <h3 className="mb-2 text-sm text-slate-300">Daily Active Users (approx.)</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="activeUsers" stroke="#7c3aed" fill="#7c3aed33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <h3 className="mb-2 text-sm text-slate-300">Deposits vs Withdrawals</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="deposits" stackId="a" fill="#10b981" />
                <Bar dataKey="withdrawals" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <h3 className="mb-2 text-sm text-slate-300">Fraud / Security Events</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="events" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <p className="text-sm text-slate-400">Note: Charts use raw transactions and security-events endpoints. For more accurate analytics, add server-side aggregated endpoints.</p>
      <p className="text-sm text-slate-400">Install chart dependency: <code>npm install recharts</code></p>
    </div>
  );
}
