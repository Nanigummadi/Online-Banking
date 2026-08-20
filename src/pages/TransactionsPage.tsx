import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  RotateCw, 
  Download, 
  FileSpreadsheet, 
  ShieldCheck, 
  Filter 
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';
import { TransactionTable } from '../components/common/TransactionTable';

interface TransactionsPageProps {
  onSelectTransaction: (txn: Transaction) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const res = await api.getTransactions();
      if (res.success && res.data) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTransactions();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-8 pb-12 text-slate-800">
      {/* Top Header */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Transaction History
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete immutable ledger of all deposits, outbound transfers, and received funds
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition self-start sm:self-auto"
          title="Refresh Ledger"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Main Filterable Table */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        onSelectTransaction={onSelectTransaction}
        showFilters={true}
        title="Complete Account Statement"
      />
    </div>
  );
};
