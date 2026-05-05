import { useState } from "react";
import api from "../api/axios";

function ErrorBox({ message }) {
	if (!message) return null;
	return <div className="rounded-md bg-rose-900/40 p-3 text-sm text-rose-300">{message}</div>;
}

export default function SendMoney() {
	const [receiver, setReceiver] = useState("");
	const [amount, setAmount] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	const isPhone = (v) => /^\d{10}$/.test(String(v).trim());
	const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(String(v).trim());

	async function resolveReceiverId(input) {
		const value = String(input).trim();
		if (isObjectId(value)) return value;
		if (isPhone(value)) {
			const resp = await api.get("/users/lookup", { params: { phone: value } });
			return resp.data?.data?._id;
		}
		return null;
	}

	async function handleSend(e) {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		if (!receiver) return setError("Enter receiver id or 10-digit phone number");
		const parsedAmount = Number(amount);
		if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return setError("Enter a valid amount greater than 0");

		setLoading(true);

		try {
			const receiverId = await resolveReceiverId(receiver);
			if (!receiverId) throw new Error("Could not resolve receiver. Provide a valid user id or registered phone number.");

			const { data } = await api.post("/transactions/send", { receiverId, amount: parsedAmount });

			setSuccess(data?.message || "Money sent successfully");
			setReceiver("");
			setAmount("");
			setTimeout(() => setSuccess(null), 4000);
		} catch (err) {
			setError(err?.response?.data?.message || err.message || "Failed to send money");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-6">
			<header>
				<h1 className="text-2xl font-semibold text-white">Send Money</h1>
			</header>

			<form onSubmit={handleSend} className="max-w-md space-y-4">
				<div>
					<label className="mb-2 block text-sm font-medium text-slate-200">Receiver (user id or 10-digit phone)</label>
					<input value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="Enter user id or phone" className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-white" />
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium text-slate-200">Amount (₹)</label>
					<input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-white" />
				</div>

				<ErrorBox message={error} />

				{success && <div className="rounded-md bg-emerald-900/40 p-3 text-sm text-emerald-200">{success}</div>}

				<div className="flex items-center gap-2">
					<button disabled={loading} className="rounded bg-sky-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{loading ? "Sending..." : "Send"}</button>
				</div>
			</form>
		</div>
	);
}
