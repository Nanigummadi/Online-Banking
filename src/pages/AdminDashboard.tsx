import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Coins, 
  Activity, 
  ArrowUpRight, 
  RotateCw, 
  ShieldAlert, 
  DollarSign, 
  PlusCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { AdminStats, Transaction } from '../types';
import { StatCard } from '../components/common/StatCard';
import { TransactionTable } from '../components/common/TransactionTable';

interface AdminDashboardProps {
  onSelectTransaction: (txn: Transaction) => void;
  onNavigateToUsers: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectTransaction,
  onNavigateToUsers,
}) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminDashboard();
      if (res.success && res.data) {
        setStats(res.data.stats);
        setRecentTransactions(res.data.recentTransactions);
      }
    } catch (err) {
      console.error('Failed to load admin statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAdminData();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-8 pb-12 text-slate-800">
      {/* Top Banner */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Bank Administration & System Overview
            </h1>
            <span className="text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
              ADMIN ROOT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global monitoring of bank accounts, circulating liquidity, and transactional audits
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
            title="Refresh System Metrics"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <button
            onClick={onNavigateToUsers}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center space-x-2 transition"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </button>
        </div>
      </div>

      {/* 6 Executive Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          label="Total Registered Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          subtext="Active customer base"
          variant="blue"
        />
        <StatCard
          label="Active Accounts"
          value={stats?.activeUsers ?? 0}
          icon={UserCheck}
          subtext="Verified & eligible"
          variant="emerald"
        />
        <StatCard
          label="Deactivated Accounts"
          value={stats?.inactiveUsers ?? 0}
          icon={UserX}
          subtext="Security hold / disabled"
          variant="rose"
        />
        <StatCard
          label="Total System Wallets"
          value={stats?.totalWallets ?? 0}
          icon={Coins}
          subtext="1:1 user-wallet mapping"
          variant="purple"
        />
        <StatCard
          label="Circulating Liquidity"
          value={stats?.totalCirculatingBalance ?? 0}
          icon={DollarSign}
          subtext="Total customer deposits"
          variant="amber"
        />
        <StatCard
          label="Total Transferred Volume"
          value={stats?.totalVolumeTransferred ?? 0}
          icon={Activity}
          subtext="All peer-to-peer transfers"
          variant="teal"
        />
      </div>

      {/* Live System Transactions Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">System-Wide Audit Stream</h2>
          <span className="text-xs text-slate-400 font-mono">Real-Time Ledger</span>
        </div>

        <TransactionTable
          transactions={recentTransactions}
          isLoading={isLoading}
          onSelectTransaction={onSelectTransaction}
          title="Global Transactions (All Users)"
        />
      </div>
    </div>
  );
};
