import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { LoadingButton, Skeleton } from "../components/ui/loading-state.jsx";
import toast from "react-hot-toast";

function loadRazorpayScript() {
	return new Promise((resolve, reject) => {
		if (window.Razorpay) return resolve(true);
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.onload = () => resolve(true);
		script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
		document.body.appendChild(script);
	});
}

export default function Deposit() {
	const { user } = useAuth();
	const [amount, setAmount] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [balance, setBalance] = useState(null);

	// Load balance on mount
	useEffect(() => {
		const fetchBalance = async () => {
			try {
				const response = await api.get("/wallet/balance");
				setBalance(response?.data?.data?.balance ?? 0);
			} catch (err) {
				console.error("Failed to fetch balance:", err);
				setBalance(0);
			}
		};
		fetchBalance();
	}, []);

	const handleCreateOrder = async (e) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		const parsed = Number(amount);
		if (!Number.isFinite(parsed) || parsed <= 0) {
			setError("Enter a valid amount greater than 0");
			return;
		}

		setLoading(true);
		const orderToastId = toast.loading("Creating payment order...");

		try {
			console.log("Requesting order for amount:", parsed);
			const { data } = await api.post("/razorpay/create-order", { amount: parsed });
			console.log("Order response:", data);
			
			const payload = data?.data || {};
			const order = payload.order;
			const keyId = payload.keyId;

			if (!order || !keyId) {
				throw new Error("Invalid order response - missing order or keyId");
			}

			console.log("Order created, loading Razorpay script...");
			await loadRazorpayScript();
			console.log("Razorpay script loaded");
			toast.success("Payment checkout ready", { id: orderToastId });

			const options = {
				key: keyId,
				amount: order.amount,
				currency: order.currency,
				name: "PayTm Demo",
				description: "Wallet deposit",
				order_id: order.id,
				handler: async function (response) {
					console.log("Payment response received:", response);
					try {
						const verifyResp = await api.post("/razorpay/verify-payment", response);
						console.log("Verify response:", verifyResp);
						setSuccess(verifyResp?.data?.message || "Payment verified and wallet credited");
						toast.success(verifyResp?.data?.message || "Payment verified and wallet credited");
						setAmount("");
						// refresh wallet balance
						try {
							const bal = await api.get("/wallet/balance");
							setBalance(bal?.data?.data?.balance ?? 0);
						} catch (err) {
							console.error("Failed to refresh balance:", err);
						}
						setTimeout(() => setSuccess(null), 4000);
					} catch (err) {
						console.error("Verification error:", err);
						const message = err?.response?.data?.message || err.message || "Verification failed";
						setError(message);
						toast.error(message);
					}
				},
				prefill: {
					name: user?.fullName || "",
					email: user?.email || "",
					contact: user?.phoneNumber || ""
				},
				theme: { color: "#ef4444" }
			};

			console.log("Opening Razorpay with options:", options);
			const rzp = new window.Razorpay(options);
			rzp.open();
			
			rzp.on("payment.failed", function (response) {
				console.error("Payment failed:", response);
				const message = response?.error?.description || "Payment failed";
				setError(message);
				toast.error(message);
			});
		} catch (err) {
			console.error("Error creating order:", err);
			const message = err?.response?.data?.message || err.message || "Failed to create order";
			setError(message);
			toast.error(message, { id: orderToastId });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<header>
				<h1 className="text-2xl font-semibold text-white">Deposit (Razorpay)</h1>
				{balance !== null ? (
					<div className="mt-1 text-sm text-slate-400">Current balance: ₹{balance}</div>
				) : (
					<Skeleton className="mt-2 h-4 w-36" />
				)}
			</header>

			<form className="max-w-md space-y-4" onSubmit={handleCreateOrder}>
				<div>
					<label className="mb-2 block text-sm font-medium text-slate-300">Amount (₹)</label>
					<input 
						type="number" 
						value={amount} 
						onChange={(e) => setAmount(e.target.value)} 
						placeholder="0.00" 
						min="1"
						step="1"
						required
						className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30" 
					/>
				</div>

				{error && <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
				{success && <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">{success}</div>}

				<div className="flex items-center gap-2">
					<LoadingButton 
						type="submit"
						loading={loading} 
						className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Pay with Razorpay
					</LoadingButton>
				</div>
			</form>
		</div>
	);
}

