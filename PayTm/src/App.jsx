
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import Login from "./routes/login.jsx";
import Register from "./routes/register.jsx";
import Dashboard from "./routes/dashboard.jsx";
import Wallet from "./routes/wallet.jsx";
import History from "./routes/history.jsx";
import SendMoney from "./routes/sendMoney.jsx";
import WithdrawalPage from "./routes/withdrawal.jsx";
import Deposit from "./routes/deposite.jsx";

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="transactions" element={<History />} />
            <Route path="send" element={<SendMoney />} />
            <Route path="withdrawal" element={<WithdrawalPage />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;
