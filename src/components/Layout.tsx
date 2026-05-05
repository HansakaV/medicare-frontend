import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Clock, 
  Pill, 
  CreditCard, 
  MessageSquare, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from './Button';

const SidebarLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all group',
          isActive 
            ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )
      }
    >
      <Icon className={cn('h-5 w-5', 'group-hover:scale-110 transition-transform')} />
      <span>{label}</span>
      <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </NavLink>
  );
};

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    switch (path) {
      case '': return 'Dashboard Overview';
      case 'patients': return 'Patient Management';
      case 'queue': return 'Today\'s Queue';
      case 'inventory': return 'Medicine Inventory';
      case 'billing': return 'Billing & Orders';
      case 'sms': return 'SMS Notifications';
      default: return 'Medicare Center';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Pill className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Medicare<span className="text-emerald-600">Pro</span></h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink to="/patients" icon={Users} label="Patients" />
          <SidebarLink to="/queue" icon={Clock} label="Queue" />
          <SidebarLink to="/inventory" icon={Pill} label="Inventory" />
          <SidebarLink to="/billing" icon={CreditCard} label="Billing" />
          <SidebarLink to="/sms" icon={MessageSquare} label="SMS Panel" />
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
          >
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">{getPageTitle()}</h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-slate-900">{user?.name}</span>
              <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-emerald-200">
              {user?.name?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
