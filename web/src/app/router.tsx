import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/store/auth.store';
import { AdminLayout } from '../shared/layouts/AdminLayout';
import { PartnerLayout } from '../shared/layouts/PartnerLayout';
import { Login } from '../features/auth/pages/Login';
import { Register } from '../features/auth/pages/Register';
import { ForgotPassword } from '../features/auth/pages/ForgotPassword';
import { Dashboard as PartnerDashboard } from '../features/partner/dashboard/pages';
import { Locations as PartnerLocations } from '../features/partner/locations/pages';
import { Profile as PartnerProfile } from '../features/partner/profile/pages';
import { TransactionsHistory as PartnerTransactions } from '../features/partner/transactions/pages';
import { Settings as PartnerSettings } from '../features/partner/settings/pages';
import { Rewards as PartnerRewards } from '../features/partner/rewards/pages';
import { ScanQrPage as PartnerScanQr } from '../features/partner/scan-qr/pages';
import { AdminDashboard } from '../features/admin/dashboard/pages';
import { AdminUsersPage } from '../features/admin/users/pages';
import { AdminPartnersPage } from '../features/admin/partners/pages';
import { AdminLocationsPage } from '../features/admin/locations/pages';
import { AdminTransactionsPage } from '../features/admin/transactions/pages';
import { AdminRewardsPage } from '../features/admin/rewards/pages';
import { AdminPointsPage } from '../features/admin/points/pages';
import { AdminFraudPage } from '../features/admin/fraud/pages';
import { AdminAiReviewPage } from '../features/admin/ai-review/pages';
import { AdminAuditLogsPage } from '../features/admin/audit-logs/pages';
import { AdminQuizPage } from '../features/admin/quiz/pages';
import { AdminSettingsPage } from '../features/admin/settings/pages';

type Role = 'ADMIN' | 'PARTNER';

const getStoredRole = (): string | null => {
  const user = localStorage.getItem('user');
  if (!user) return null;

  try {
    return JSON.parse(user)?.role ?? null;
  } catch {
    return null;
  }
};

const getHomePath = () => {
  const role = getStoredRole();
  if (role === 'ADMIN') return '/admin';
  if (role === 'PARTNER') return '/partner';
  return '/unauthorized';
};

const ProtectedRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Role[];
}) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length) {
    const role = getStoredRole();
    if (!role || !roles.includes(role as Role)) {
      return <Navigate to={getHomePath()} replace />;
    }
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) {
    return <Navigate to={getHomePath()} replace />;
  }
  return <>{children}</>;
};

const RootRedirect = () => {
  const { isLoggedIn } = useAuth();
  return <Navigate to={isLoggedIn ? getHomePath() : '/login'} replace />;
};

const UnauthorizedPage = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">Không có quyền truy cập web portal</h1>
      <p className="mt-2 text-sm text-slate-600">
        Tài khoản này không thuộc role ADMIN hoặc PARTNER. Hãy đăng nhập bằng tài khoản quản trị hoặc đối tác.
      </p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <PublicRoute><Login /></PublicRoute>,
  },
  {
    path: '/register',
    element: <PublicRoute><Register /></PublicRoute>,
  },
  {
    path: '/forgot-password',
    element: <PublicRoute><ForgotPassword /></PublicRoute>,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/partner',
    element: <ProtectedRoute roles={['PARTNER']}><PartnerLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <PartnerDashboard /> },
      { path: 'locations', element: <PartnerLocations /> },
      { path: 'profile', element: <PartnerProfile /> },
      { path: 'transactions', element: <PartnerTransactions /> },
      { path: 'rewards', element: <PartnerRewards /> },
      { path: 'settings', element: <PartnerSettings /> },
      { path: 'scan-qr', element: <PartnerScanQr /> },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'partners', element: <AdminPartnersPage /> },
      { path: 'locations', element: <AdminLocationsPage /> },
      { path: 'transactions', element: <AdminTransactionsPage /> },
      { path: 'rewards', element: <AdminRewardsPage /> },
      { path: 'points', element: <AdminPointsPage /> },
      { path: 'fraud', element: <AdminFraudPage /> },
      { path: 'ai-review', element: <AdminAiReviewPage /> },
      { path: 'audit-logs', element: <AdminAuditLogsPage /> },
      { path: 'quiz', element: <AdminQuizPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },
]);
