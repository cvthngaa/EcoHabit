import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '../shared/layouts/AdminLayout';
import { Login } from '../features/auth/pages/Login';
import { Register } from '../features/auth/pages/Register';
import { Dashboard } from '../features/dashboard/pages';
import { Locations } from '../features/locations/pages';
import { Profile } from '../features/profile/pages';
import { TransactionsHistory } from '../features/transactions/pages';
import { Settings } from '../features/settings/pages';
import { Rewards } from '../features/rewards/pages';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <AdminLayout />,
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
