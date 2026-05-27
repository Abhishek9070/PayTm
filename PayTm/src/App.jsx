import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppLayout from "./layouts/AppLayout.jsx";
import Home from "./routes/home.jsx";
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
import EditProfile from "./routes/editProfile.jsx";
import Kyc from "./routes/kyc.jsx";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext.jsx";
import { AdminNotificationProvider } from "./admin/context/AdminNotificationContext.jsx";
import AdminProtectedRoute from "./admin/routes/AdminProtectedRoute.jsx";
import AdminLayout from "./admin/layouts/AdminLayout.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AdminAnalytics from "./admin/pages/AdminAnalytics.jsx";
import AdminUsers from "./admin/pages/AdminUsers.jsx";
import AdminTransactions from "./admin/pages/AdminTransactions.jsx";
import AdminKyc from "./admin/pages/AdminKyc.jsx";
import AdminKycDetail from "./admin/pages/AdminKycDetail.jsx";
import AdminWithdrawals from "./admin/pages/AdminWithdrawals.jsx";
import AdminReports from "./admin/pages/AdminReports.jsx";
import AdminSettings from "./admin/pages/AdminSettings.jsx";

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AdminNotificationProvider>
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
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/transactions" element={<AdminTransactions />} />
                <Route path="/admin/kyc" element={<AdminKyc />} />
                <Route path="/admin/kyc/:id" element={<AdminKycDetail />} />
                <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* User Routes */}
            <Route path="/" element={<Home />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="deposit" element={<Deposit />} />
                <Route path="transactions" element={<History />} />
                <Route path="send" element={<SendMoney />} />
                <Route path="withdrawal" element={<WithdrawalPage />} />
                <Route path="profile" element={<Profile />} />
                <Route path="profile/edit" element={<EditProfile />} />
                <Route path="kyc" element={<Kyc />} />
              </Route>
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AdminNotificationProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
