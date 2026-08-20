import React from 'react';
import { 
  Wallet as WalletIcon, 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Lock, 
  ShieldCheck, 
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BalanceCard } from '../components/common/BalanceCard';
import { StatCard } from '../components/common/StatCard';

interface WalletPageProps {
  onOpenAddMoney: () => void;
  onOpenTransfer: () => void;
  onNavigateToTransactions: () => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({
  onOpenAddMoney,
  onOpenTransfer,
  onNavigateToTransactions,
}) => {
  const { user, wallet, walletStats } = useAuth();

  return (
    <div className="space-y-8 pb-12 text-slate-800">
      {/* Top Banner */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Wallet & Cards</h1>
          <p className="text-sm text-slate-500 mt-1">
            Wallet Number: <span className="font-mono text-indigo-600 font-bold">{wallet?.walletNumber}</span> • FDIC Insured Simulation
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenAddMoney}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center space-x-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Deposit Funds</span>
          </button>
        </div>
      </div>

      {/* Grid: Big Balance Card + Wallet Limits & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <BalanceCard
            wallet={wallet}
            userName={user?.fullName || 'Valued Client'}
            onOpenAddMoney={onOpenAddMoney}
            onOpenTransfer={onOpenTransfer}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              label="Lifetime Deposited"
              value={walletStats?.totalAdded ?? 0}
              icon={Plus}
              subtext="Total Simulated Inflows"
              variant="emerald"
            />
            <StatCard
              label="Lifetime Sent"
              value={walletStats?.totalSent ?? 0}
              icon={ArrowUpRight}
              subtext="Total Outbound Transfers"
              variant="rose"
            />
          </div>

          {/* Wallet Security Specs */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Account Limits & Controls
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-xs">Daily Transfer Limit</span>
                <span className="font-sans font-bold text-slate-900 text-base mt-1 block">$50,000.00</span>
                <span className="text-[11px] text-emerald-600 font-medium">Standard Tier</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-xs">Instant Transfer Fee</span>
                <span className="font-sans font-bold text-emerald-600 text-base mt-1 block">$0.00 (Free)</span>
                <span className="text-[11px] text-slate-400">Zero Commission</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-xs">Transfer Processing</span>
                <span className="font-sans font-bold text-slate-900 text-base mt-1 block">Sub-Second</span>
                <span className="text-[11px] text-indigo-600 font-medium">Atomic @Transactional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
