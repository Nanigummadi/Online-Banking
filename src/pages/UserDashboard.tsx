import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Send, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RotateCw, 
  TrendingUp, 
  ShieldCheck, 
  CreditCard,
  Building,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { BalanceCard } from '../components/common/BalanceCard';
import { StatCard } from '../components/common/StatCard';
import { TransactionTable } from '../components/common/TransactionTable';

interface UserDashboardProps {
  onOpenAddMoney: () => void;
  onOpenTransfer: () => void;
  onSelectTransaction: (txn: Transaction) => void;
  onNavigateToTransactions: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onOpenAddMoney,
  onOpenTransfer,
  onSelectTransaction,
  onNavigateToTransactions,
}) => {
  const { user, wallet, walletStats, refreshUserData } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRecentTransactions = async () => {
    try {
      setIsLoadingTxns(true);
      const res = await api.getTransactions();
      if (res.success && res.data) {
        setRecentTransactions(res.data.transactions.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard transactions:', err);
    } finally {
      setIsLoadingTxns(false);
    }
  };

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshUserData(), fetchRecentTransactions()]);
    setIsRefreshing(false);
  };

  const totalAdded = walletStats?.totalAdded ?? 0;
  const totalSent = walletStats?.totalSent ?? 0;
  const totalReceived = walletStats?.totalReceived ?? 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.fullName}
            </h1>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Wallet ID: <span className="font-mono text-slate-700 font-semibold">{wallet?.walletNumber}</span> • Status:{' '}
            <span className="text-emerald-600 font-semibold">{user?.status}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
            title="Refresh Account Data"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <button
            onClick={onOpenAddMoney}
            className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-2 transition"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>Deposit</span>
          </button>
          <button
            onClick={onOpenTransfer}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center space-x-2 transition"
          >
            <Send className="w-4 h-4" />
            <span>Send Money</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Balance Card (Left) & Metrics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital Wallet Card */}
        <div className="lg:col-span-1">
          <BalanceCard
            wallet={wallet}
            userName={user?.fullName || 'Valued Client'}
            onOpenAddMoney={onOpenAddMoney}
            onOpenTransfer={onOpenTransfer}
          />
        </div>

        {/* 3 Metric Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Deposited"
            value={totalAdded}
            icon={PlusCircle}
            subtext="Simulated Bank Top-ups"
            variant="emerald"
          />
          <StatCard
            label="Total Sent"
            value={totalSent}
            icon={ArrowUpRight}
            subtext="Transfers Out"
            variant="rose"
          />
          <StatCard
            label="Total Received"
            value={totalReceived}
            icon={ArrowDownLeft}
            subtext="Transfers In"
            variant="teal"
          />
        </div>
      </div>

      {/* Quick Security & Architecture Guarantee Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">ACID Transactional Guarantees Active</p>
            <p className="text-slate-500 text-xs">
              Transfers execute with repeatable-read isolation. In case of unexpected server failures, balances roll back atomically.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-50 text-indigo-700 border border-slate-200 whitespace-nowrap self-start sm:self-auto font-medium">
          Spring Boot 3 @Transactional
        </span>
      </div>

      {/* Recent Activity Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activity</h2>
          <button
            onClick={onNavigateToTransactions}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            View All History →
          </button>
        </div>

        <TransactionTable
          transactions={recentTransactions}
          isLoading={isLoadingTxns}
          onSelectTransaction={onSelectTransaction}
          title="Recent Ledger Entries"
        />
      </div>
    </div>
  );
};
