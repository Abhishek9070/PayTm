
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppLayout from "./layouts/AppLayout.jsx";
import Login from "./routes/login.jsx";
import Register from "./routes/register.jsx";
import Dashboard from "./routes/dashboard.jsx";
import Wallet from "./routes/wallet.jsx";
import History from "./routes/history.jsx";
import SendMoney from "./routes/sendMoney.jsx";
import WithdrawalPage from "./routes/withdrawal.jsx";
import Deposit from "./routes/deposite.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Profile from "./routes/profile.jsx";
import Kyc from "./routes/kyc.jsx";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '14px',
            background: '#0f172a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.12)'
          },
          success: {
            style: {
              background: '#052e16',
              border: '1px solid rgba(74,222,128,0.35)'
            }
          },
          error: {
            style: {
              background: '#450a0a',
              border: '1px solid rgba(248,113,113,0.35)'
            }
          }
        }}
      />
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="deposit" element={<Deposit />} />
              <Route path="transactions" element={<History />} />
              <Route path="send" element={<SendMoney />} />
              <Route path="withdrawal" element={<WithdrawalPage />} />
              <Route path="profile" element={<Profile />} />
              <Route path="kyc" element={<Kyc />} />
            </Route>
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
