import React, { useState } from 'react';
import { Wallet, Eye, EyeOff, Copy, Check, ArrowUpRight, Plus, CreditCard, ShieldCheck } from 'lucide-react';
import { Wallet as WalletType } from '../../types';

interface BalanceCardProps {
  wallet: WalletType | null;
  userName: string;
  onOpenAddMoney: () => void;
  onOpenTransfer: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  wallet,
  userName,
  onOpenAddMoney,
  onOpenTransfer,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const balance = wallet ? wallet.balance : 0;
  const walletNumber = wallet ? wallet.walletNumber : 'WLT-00000000';

  const handleCopyWalletNumber = () => {
    navigator.clipboard.writeText(walletNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 shadow-md shadow-indigo-100 border border-indigo-700/50">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full -mr-16 -mt-16 opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400 rounded-full -ml-8 -mb-8 opacity-20 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        {/* Top Row: Brand & EMV Chip / Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-indigo-200" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-indigo-200">
                LuminaPay Digital Card
              </span>
              <span className="block text-[10px] text-indigo-300">FDIC Insured Simulation</span>
            </div>
          </div>

          {/* EMV Gold Chip */}
          <div className="w-9 h-7 rounded bg-amber-300/90 border border-amber-400 flex items-center justify-center shadow-inner">
            <div className="w-6 h-4 border border-amber-600/40 rounded-sm grid grid-cols-2 gap-0.5 opacity-70">
              <div className="border-r border-amber-600/40"></div>
              <div></div>
            </div>
          </div>
        </div>

        {/* Middle: Available Balance */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-medium text-indigo-200 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span>Available Balance</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-indigo-300 hover:text-white transition ml-1"
              title={showBalance ? 'Hide Balance' : 'Show Balance'}
            >
              {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-bold font-sans tracking-tight text-white">
              {showBalance ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••••'}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/15 text-indigo-100 border border-white/20">
              USD
            </span>
          </div>
        </div>

        {/* Bottom Row: Wallet Number, Cardholder, and Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono tracking-wider text-indigo-200">
                {walletNumber}
              </span>
              <button
                onClick={handleCopyWalletNumber}
                className="text-indigo-300 hover:text-white transition"
                title="Copy Wallet ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider mt-0.5">
              {userName}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-card-deposit"
              onClick={onOpenAddMoney}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>
            <button
              id="btn-card-send"
              onClick={onOpenTransfer}
              className="px-4 py-2 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-700" />
              <span>Transfer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
