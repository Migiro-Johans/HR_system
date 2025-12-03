import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import EmployeesPage from './pages/Employees/EmployeesPage';
import PayrollPage from './pages/Payroll/PayrollPage';
import LeavePage from './pages/Leave/LeavePage';
import DisbursementsPage from './pages/Disbursements/DisbursementsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />

        {/* Admin and HR only routes */}
        {(user?.role === 'admin' || user?.role === 'hr') && (
          <>
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="disbursements" element={<DisbursementsPage />} />
          </>
        )}

        {/* All roles can access leave */}
        <Route path="leave" element={<LeavePage />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
