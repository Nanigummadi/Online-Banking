import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Send, 
  Receipt, 
  User as UserIcon, 
  Users, 
  ShieldAlert, 
  Coins, 
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, isAdmin } = useAuth();

  const userNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wallet', label: 'Wallet & Cards', icon: Wallet },
    { id: 'transfer', label: 'Transfers', icon: Send },
    { id: 'transactions', label: 'History', icon: Receipt },
    { id: 'profile', label: 'Account Profile', icon: UserIcon },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Admin Metrics', icon: Activity },
    { id: 'admin-users', label: 'User Directory', icon: Users },
    { id: 'admin-wallets', label: 'System Wallets', icon: Coins },
    { id: 'admin-transactions', label: 'Audit Log', icon: ShieldAlert },
  ];

  return (
    <aside id="app-sidebar" className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-5rem)] p-4 text-slate-700">
      <div className="space-y-6">
        {/* User Portal Navigation */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Main Menu</span>
          </div>
          <nav className="space-y-1">
            {userNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin Portal Section */}
        {isAdmin && (
          <div>
            <div className="px-3 mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-600">
              <span>Admin Portal</span>
              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-mono font-bold">
                ROOT
              </span>
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-50 text-amber-800 font-semibold shadow-xs'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Admin Quick View Promo Card in Sidebar */}
      <div className="p-2 mt-auto">
        <div className="bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden shadow-sm">
          <div className="relative z-10 text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
            {isAdmin ? 'System Architecture' : 'Security Assurance'}
          </div>
          <div className="relative z-10 text-xs font-medium text-slate-200 mt-1">
            {isAdmin ? 'Spring Boot 3 @Transactional' : 'ACID Guaranteed Transfers'}
          </div>
          <div className="relative z-10 text-[11px] text-slate-400 mt-1">
            Stateless JWT & BCrypt Encryption
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-slate-800/80 rounded-full flex items-center justify-center opacity-60">
            <ShieldCheck className="w-10 h-10 text-indigo-400" />
          </div>
        </div>
      </div>
    </aside>
  );
};
