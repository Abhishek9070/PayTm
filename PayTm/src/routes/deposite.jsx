import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

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

	const handleCreateOrder = async (e) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		const parsed = Number(amount);
		if (!Number.isFinite(parsed) || parsed <= 0) return setError("Enter a valid amount greater than 0");

		setLoading(true);

		try {
			const { data } = await api.post("/razorpay/create-order", { amount: parsed });
			const payload = data?.data || {};
			const order = payload.order;
			const keyId = payload.keyId;

			if (!order || !keyId) {
				throw new Error("Invalid order response from server");
			}

			await loadRazorpayScript();

			const options = {
				key: keyId,
				amount: order.amount,
				currency: order.currency,
				name: "PayTm Demo",
				description: "Wallet deposit",
				order_id: order.id,
				handler: async function (response) {
					try {
						const verifyResp = await api.post("/razorpay/verify-payment", response);
							setSuccess(verifyResp?.data?.message || "Payment verified and wallet credited");
							setAmount("");
							// refresh wallet balance
							try {
								const bal = await api.get("/wallet/balance");
								setBalance(bal?.data?.data ?? null);
							} catch (err) {
								// ignore balance refresh errors
							}
						setTimeout(() => setSuccess(null), 4000);
					} catch (err) {
						setError(err?.response?.data?.message || err.message || "Verification failed");
					}
				},
				prefill: {
					name: user?.fullName,
					email: user?.email,
					contact: user?.phoneNumber
				},
					theme: { color: "#ef4444" }
			};

			const rzp = new window.Razorpay(options);
			rzp.open();
			rzp.on("payment.failed", function (response) {
				setError(response?.error?.description || "Payment failed");
			});
		} catch (err) {
			setError(err?.response?.data?.message || err.message || "Failed to create order");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<header>
				<h1 className="text-2xl font-semibold text-slate-900">Deposit (Razorpay)</h1>
				{balance !== null && (
					<div className="mt-1 text-sm text-slate-600">Current balance: ₹{balance}</div>
				)}
			</header>

			<form className="max-w-md space-y-4" onSubmit={handleCreateOrder}>
				<div>
					<label className="mb-2 block text-sm font-medium text-slate-700">Amount (₹)</label>
					<input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900" />
				</div>

				{error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
				{success && <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

				<div className="flex items-center gap-2">
					<button disabled={loading} className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{loading ? "Preparing..." : "Pay with Razorpay"}</button>
				</div>
			</form>
		</div>
	);
}

