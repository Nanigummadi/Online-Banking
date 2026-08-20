import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Wallet, 
  Send, 
  FileText, 
  Terminal, 
  BookOpen, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenApiExplorer: () => void;
  onOpenSpringDocs: () => void;
  onOpenAddMoney: () => void;
  onOpenTransfer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenApiExplorer,
  onOpenSpringDocs,
  onOpenAddMoney,
  onOpenTransfer,
}) => {
  const { user, wallet, isAdmin, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header id="app-navbar" className="bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-40">
      <div className="w-full px-6 sm:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Building2 className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-indigo-950">LuminaPay</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Digital Banking
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Spring Boot 3 • MySQL 8 • Enterprise Ledger
              </p>
            </div>
          </div>

          {/* Center/Right Nav Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Actions (User) */}
            {user && !isAdmin && (
              <div className="hidden md:flex items-center space-x-2 mr-2">
                <button
                  id="btn-nav-add-money"
                  onClick={onOpenAddMoney}
                  className="px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 border border-slate-200 transition"
                >
                  <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Deposit</span>
                </button>
                <button
                  id="btn-nav-transfer"
                  onClick={onOpenTransfer}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-100 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transfer</span>
                </button>
              </div>
            )}

            {/* Architecture / Spring Boot Docs Button */}
            <button
              id="btn-spring-docs"
              onClick={onOpenSpringDocs}
              className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center space-x-1.5 border border-slate-200 transition"
              title="View Architecture, ER Diagrams & Java Project Files"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden lg:inline font-medium">Architecture Specs</span>
            </button>

            {/* Postman / REST API Explorer Button */}
            <button
              id="btn-api-explorer"
              onClick={onOpenApiExplorer}
              className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center space-x-1.5 border border-slate-200 transition"
              title="Test Live REST APIs & Download Postman Collection"
            >
              <Terminal className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline font-medium">Postman APIs</span>
            </button>

            {/* User Profile Pill / Menu */}
            {user ? (
              <div className="relative">
                <button
                  id="btn-user-dropdown"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shadow-sm">
                    {user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {user.fullName}
                    </p>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                        isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {user.role === 'ADMIN' ? 'Admin' : 'Verified Account'}
                      </span>
                      {wallet && !isAdmin && (
                        <span className="text-[11px] text-slate-500 font-mono font-semibold">
                          ${wallet.balance.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Status:</span>
                        <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{user.status}</span>
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          window.location.hash = '#/profile';
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Profile & Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenSpringDocs();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Spring Boot & Cloud Specs</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        id="btn-logout"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
