import React, { useState, useEffect } from 'react';
import { ShieldAlert, RotateCw } from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';
import { TransactionTable } from '../components/common/TransactionTable';

interface AdminTransactionsPageProps {
  onSelectTransaction: (txn: Transaction) => void;
}

export const AdminTransactionsPage: React.FC<AdminTransactionsPageProps> = ({
  onSelectTransaction,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminTransactions();
      if (res.success && res.data) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error('Failed to load admin transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-8 pb-12 text-slate-800">
      {/* Top Banner */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Global Transaction Audit Log
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete chronological ledger of all customer deposits, peer-to-peer transfers, and settlements
            </p>
          </div>
        </div>

        <button
          onClick={fetchTransactions}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition self-start sm:self-auto"
          title="Refresh Ledger"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        onSelectTransaction={onSelectTransaction}
        showFilters={true}
        title="Global Bank Audit Ledger"
      />
    </div>
  );
};
