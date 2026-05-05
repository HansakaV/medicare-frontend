import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut,
  ChevronRight,
  Pill,
  Sun,
  Moon
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from './Button';
import anime from 'animejs';

const ThemeToggle = () => {
  const [isDark, setIsDark] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const targets = isDark ? '.sun-icon' : '.moon-icon';
    anime({
      targets,
      rotate: [0, 360],
      scale: [1, 1.2, 1],
      duration: 500,
      easing: 'easeInOutBack'
    });
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-between w-full px-4 py-2 mt-2 bg-slate-100 dark:bg-slate-800 rounded-xl transition-all group overflow-hidden relative"
    >
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {isDark ? 'Dark Mode' : 'Light Mode'}
      </span>
      <div className="relative w-8 h-8 flex items-center justify-center">
        {isDark ? (
          <Moon className="moon-icon h-5 w-5 text-blue-400 fill-blue-400/20" />
        ) : (
          <Sun className="sun-icon h-5 w-5 text-orange-500 fill-orange-500/20" />
        )}
      </div>
    </button>
  );
};

const NavCharacter = ({ type, active }: { type: string, active: boolean }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const color = active ? '#10b981' : (isDark ? '#94a3b8' : '#64748b'); 

  React.useEffect(() => {
    anime({
      targets: `.nav-eye-${type}`,
      scaleY: [1, 0, 1],
      duration: 200,
      delay: () => anime.random(2000, 8000),
      loop: true,
      easing: 'easeInOutSine'
    });
  }, [type]);

  return (
    <div className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill={color} opacity={active ? "0.1" : "0.05"} />
        {type === 'dashboard' && (
          <path d="M30 50 L50 30 L70 50 L70 70 L30 70 Z" fill={color} />
        )}
        {type === 'patients' && (
          <g>
            <circle cx="50" cy="40" r="15" fill={color} />
            <path d="M30 75 Q50 60 70 75" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
          </g>
        )}
        {type === 'queue' && (
          <g>
            <circle cx="50" cy="50" r="20" fill="none" stroke={color} strokeWidth="8" />
            <path d="M50 35 L50 50 L60 55" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
          </g>
        )}
        {type === 'inventory' && (
          <rect x="30" y="30" width="40" height="40" rx="8" fill={color} />
        )}
        {type === 'billing' && (
          <rect x="25" y="35" width="50" height="30" rx="4" fill={color} />
        )}
        {type === 'sms' && (
          <path d="M25 35 H75 V65 H25 Z M25 35 L50 50 L75 35" fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" />
        )}
        {/* Eyes for all characters */}
        <circle className={`nav-eye-${type}`} cx="43" cy="48" r="3" fill={active ? "white" : color} opacity={active ? 1 : 0.4} />
        <circle className={`nav-eye-${type}`} cx="57" cy="48" r="3" fill={active ? "white" : color} opacity={active ? 1 : 0.4} />
      </svg>
    </div>
  );
};

const SidebarLink = ({ to, type, label }: { to: string; type: string; label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all group',
          isActive 
            ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
        )
      }
    >
      {({ isActive }) => (
        <>
          <NavCharacter type={type} active={isActive} />
          <span className="text-sm">{label}</span>
          <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
      )}
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
      case 'dashboard': return 'Dashboard Overview';
      case 'patients': return 'Patient Management';
      case 'queue': return 'Today\'s Queue';
      case 'inventory': return 'Medicine Inventory';
      case 'billing': return 'Billing & Orders';
      case 'sms': return 'SMS Notifications';
      default: return 'Medicare Center';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-none">
              <Pill className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Medicare<span className="text-emerald-600">Pro</span></h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarLink to="/dashboard" type="dashboard" label="Dashboard" />
          <SidebarLink to="/patients" type="patients" label="Patients" />
          <SidebarLink to="/queue" type="queue" label="Queue" />
          <SidebarLink to="/inventory" type="inventory" label="Inventory" />
          <SidebarLink to="/billing" type="billing" label="Billing" />
          <SidebarLink to="/sms" type="sms" label="SMS Panel" />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 mt-auto space-y-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
          >
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{getPageTitle()}</h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold border-2 border-emerald-200 dark:border-emerald-800">
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
