import React, { useState, useEffect } from 'react';
import { Coins, Search, RotateCw, Wallet as WalletIcon } from 'lucide-react';
import { api } from '../services/api';
import { Wallet } from '../types';

interface WalletWithOwner extends Wallet {
  ownerName: string;
  ownerEmail: string;
  ownerStatus: string;
}

export const AdminWalletsPage: React.FC = () => {
  const [wallets, setWallets] = useState<WalletWithOwner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminWallets();
      if (res.success && res.data) {
        setWallets(res.data.wallets);
      }
    } catch (err) {
      console.error('Failed to fetch admin wallets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const filteredWallets = wallets.filter((w) => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      w.walletNumber.toLowerCase().includes(q) ||
      w.ownerName.toLowerCase().includes(q) ||
      w.ownerEmail.toLowerCase().includes(q)
    );
  });

  const totalCirculating = wallets.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="space-y-8 pb-12 text-slate-800">
      {/* Top Banner */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              System Wallets & Vault Accounts
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
              Vault Registry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total Circulating Liquidity:{' '}
            <strong className="text-emerald-600 font-sans font-bold text-sm">${totalCirculating.toFixed(2)} USD</strong>
          </p>
        </div>

        <button
          onClick={fetchWallets}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition self-start sm:self-auto"
          title="Refresh Wallets"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Wallets Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h3 className="font-bold text-slate-900 text-base">All Provisioned Wallets</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {filteredWallets.length} active
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search wallet #, owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-56"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500">Loading wallets database...</p>
          </div>
        ) : filteredWallets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No wallets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6 font-semibold">Wallet Number</th>
                  <th className="py-3 px-6 font-semibold">Account Holder</th>
                  <th className="py-3 px-6 font-semibold">Email</th>
                  <th className="py-3 px-6 font-semibold text-right">Available Balance (USD)</th>
                  <th className="py-3 px-6 font-semibold text-center">Account Status</th>
                  <th className="py-3 px-6 font-semibold">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredWallets.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <WalletIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-xs">{w.walletNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{w.ownerName}</td>
                    <td className="py-4 px-6 text-slate-500">{w.ownerEmail}</td>
                    <td className="py-4 px-6 text-right font-sans font-bold text-slate-900 text-sm">
                      ${w.balance.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          w.ownerStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {w.ownerStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-xs">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
