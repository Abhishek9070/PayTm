import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";
import { Skeleton } from "../components/ui/loading-state.jsx";
import toast from "react-hot-toast";

const balanceCards = [
  {
    key: "availableBalance",
    label: "Available Balance",
    gradient: "from-emerald-400 to-cyan-400"
  },
  {
    key: "lockedBalance",
    label: "Locked Balance",
    gradient: "from-amber-400 to-orange-400"
  },
  {
    key: "totalBalance",
    label: "Total Balance",
    gradient: "from-sky-400 to-blue-500"
  }
];

function Wallet() {
  const { user, loading: authLoading } = useAuth();
  const refreshCounter = useSelector(state => state.ui.transactionRefreshCounter);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchWalletBalance = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get("/wallet/balance");
        const walletData = response?.data?.data ?? {};

        if (isMounted) {
          setWallet(walletData);
        }
      } catch (requestError) {
        if (isMounted) {
          const message =
            requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to fetch wallet balance.";

          setError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!authLoading) {
      fetchWalletBalance();
    }

    return () => {
      isMounted = false;
    };
  }, [authLoading, refreshCounter, user]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Wallet</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Balance Overview</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          Live wallet balance fetched from the backend and kept in sync with the authenticated session.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {loading
          ? balanceCards.map((card) => (
              <div key={card.key} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <Skeleton className={`h-1 w-16 rounded-full bg-linear-to-r ${card.gradient}`} />
                <Skeleton className="mt-4 h-4 w-28" />
                <Skeleton className="mt-3 h-9 w-40" />
              </div>
            ))
          : balanceCards.map((card) => {
              const value = Number(wallet?.[card.key] ?? 0);

              return (
                <div
                  key={card.key}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <div className={`h-1 w-16 rounded-full bg-linear-to-r ${card.gradient}`} />
                  <p className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-400">
                    {card.label}
                  </p>
                  <div className="mt-3 text-3xl font-semibold text-white">
                    {`₹${value.toFixed(2)}`}
                  </div>
                </div>
              );
            })}
      </div>
    </section>
  );
}

export default Wallet;