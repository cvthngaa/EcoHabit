import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { Dashboard } from '../pages/dashboard';
import { Locations } from '../pages/locations';
import { Profile } from '../pages/profile';
import { TransactionsHistory } from '../pages/transactions';
import { Settings } from '../pages/settings';
import { Rewards } from '../pages/rewards';

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
