import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/store/auth.store';
import { AdminLayout } from '../shared/layouts/AdminLayout';
import { Login } from '../features/auth/pages/Login';
import { Register } from '../features/auth/pages/Register';
import { ForgotPassword } from '../features/auth/pages/ForgotPassword';
import { Dashboard } from '../features/dashboard/pages';
import { Locations } from '../features/locations/pages';
import { Profile } from '../features/profile/pages';
import { TransactionsHistory } from '../features/transactions/pages';
import { Settings } from '../features/settings/pages';
import { Rewards } from '../features/rewards/pages';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
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
    path: '/',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'locations',
        element: <Locations />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'transactions',
        element: <TransactionsHistory />,
      },
      {
        path: 'rewards',
        element: <Rewards />,
      },
      {
        path: 'settings',
        element: <Settings />,
      }
    ],
  },
]);
