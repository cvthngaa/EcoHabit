import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, MapPin, ListOrdered, Gift, Settings, LogOut, Bell } from 'lucide-react';
import clsx from 'clsx';
import { useGetProfile } from '../../features/auth/services/use-get-profile';
import { useAuth } from '../../features/auth/store/auth.store';
import { logout } from '../../features/auth/services/helpers';

const navigation = [
  { name: 'Dashboard', to: '/partner', icon: LayoutDashboard },
  { name: 'Hồ sơ doanh nghiệp', to: '/partner/profile', icon: Store },
  { name: 'Điểm thu gom', to: '/partner/locations', icon: MapPin },
  { name: 'Lịch sử thu gom', to: '/partner/transactions', icon: ListOrdered },
  { name: 'Quà tặng & Voucher', to: '/partner/rewards', icon: Gift },
];

export const PartnerLayout: React.FC = () => {
  const { data: profile } = useGetProfile();
  const { setIsLoggedIn } = useAuth();

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
            EcoPartner
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/partner'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
            to="/partner/settings"
            className={({ isActive }) =>
              clsx(
                'flex items-center w-full px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <Settings className="w-5 h-5 mr-3" />
            Cài đặt
          </NavLink>
          <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 mt-1 text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-0">
          <h2 className="text-lg font-semibold text-slate-800">Cổng Đối Tác</h2>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-700">{profile?.organizationName || 'Tên doanh nghiệp'}</p>
                <p className="text-xs text-slate-500">Đối tác Thu gom</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                <Store className="w-5 h-5 text-emerald-600" />
              </div>
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
