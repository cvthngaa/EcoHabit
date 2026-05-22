import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Bot,
  ClipboardList,
  FileClock,
  Gift,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquareWarning,
  Settings,
  ShieldAlert,
  Store,
  Trophy,
  Users,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../features/auth/store/auth.store';
import { logout } from '../../features/auth/services/helpers';

const navigation = [
  { name: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { name: 'Người dùng', to: '/admin/users', icon: Users },
  { name: 'Đối tác', to: '/admin/partners', icon: Store },
  { name: 'Điểm thu gom', to: '/admin/locations', icon: MapPin },
  { name: 'Giao dịch', to: '/admin/transactions', icon: ClipboardList },
  { name: 'Quà tặng & Voucher', to: '/admin/rewards', icon: Gift },
  { name: 'Quy tắc điểm', to: '/admin/points', icon: Trophy },
  { name: 'Gian lận', to: '/admin/fraud', icon: ShieldAlert },
  { name: 'Kiểm duyệt AI', to: '/admin/ai-review', icon: Bot },
  { name: 'Audit logs', to: '/admin/audit-logs', icon: FileClock },
  { name: 'Forum', to: '/admin/forum', icon: MessageSquareWarning },
  { name: 'Quiz', to: '/admin/quiz', icon: BarChart3 },
];

export const AdminLayout: React.FC = () => {
  const { setIsLoggedIn } = useAuth();

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">EcoAdmin</h1>
            <p className="text-xs text-slate-500">Quản trị hệ thống</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 text-sm',
                  isActive
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )
              }
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              clsx(
                'flex items-center w-full px-3 py-2 rounded-lg transition-colors text-sm',
                isActive
                  ? 'bg-slate-900 text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )
            }
          >
            <Settings className="w-5 h-5 mr-3" />
            Cài đặt
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 mt-1 text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer text-sm"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-0">
          <h2 className="text-lg font-semibold text-slate-800">Cổng Quản Trị</h2>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <Activity className="w-4 h-4" />
              Hệ thống hoạt động
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
              <ShieldAlert className="w-5 h-5 text-slate-700" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
