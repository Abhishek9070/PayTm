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
				theme: { color: "#0ea5a4" }
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
				<h1 className="text-2xl font-semibold text-white">Deposit (Razorpay)</h1>
			</header>

			<form className="max-w-md space-y-4" onSubmit={handleCreateOrder}>
				<div>
					<label className="mb-2 block text-sm font-medium text-slate-200">Amount (₹)</label>
					<input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-white" />
				</div>

				{error && <div className="rounded-md bg-rose-900/40 p-3 text-sm text-rose-300">{error}</div>}
				{success && <div className="rounded-md bg-emerald-900/40 p-3 text-sm text-emerald-200">{success}</div>}

				<div className="flex items-center gap-2">
					<button disabled={loading} className="rounded bg-sky-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{loading ? "Preparing..." : "Pay with Razorpay"}</button>
				</div>
			</form>
		</div>
	);
}

