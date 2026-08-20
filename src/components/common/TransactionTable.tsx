import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  PlusCircle, 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction } from '../../types';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onSelectTransaction?: (txn: Transaction) => void;
  showFilters?: boolean;
  title?: string;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading = false,
  onSelectTransaction,
  showFilters = false,
  title = 'Recent Activity',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTransactions = transactions.filter((txn) => {
    // Search match
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      txn.transactionReference.toLowerCase().includes(q) ||
      txn.description.toLowerCase().includes(q) ||
      txn.senderName?.toLowerCase().includes(q) ||
      txn.receiverName?.toLowerCase().includes(q);

    // Type filter match
    const effectiveType = txn.userPerspectiveType || txn.transactionType;
    const matchesType = typeFilter === 'ALL' || effectiveType === typeFilter || txn.transactionType === typeFilter;

    // Status filter match
    const matchesStatus = statusFilter === 'ALL' || txn.transactionStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Reference', 'Date', 'Type', 'Sender', 'Receiver', 'Amount', 'Status', 'Description'];
    const rows = filteredTransactions.map((t) => [
      t.transactionReference,
      new Date(t.createdAt).toISOString(),
      t.userPerspectiveType || t.transactionType,
      t.senderName || 'Self / Direct Deposit',
      t.receiverName,
      t.amount.toFixed(2),
      t.transactionStatus,
      `"${t.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-slate-800">
      {/* Header & Optional Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <h3 className="font-bold text-slate-900 text-base">{title}</h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
            {filteredTransactions.length} records
          </span>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reference, recipient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-56"
              />
            </div>

            {/* Type Dropdown */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">All Types</option>
              <option value="ADD_MONEY">Deposits (+)</option>
              <option value="TRANSFER_SENT">Sent (-)</option>
              <option value="TRANSFER_RECEIVED">Received (+)</option>
            </select>

            {/* Export CSV Button */}
            <button
              onClick={exportCSV}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
              title="Download CSV Statement"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">Export CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* Table / List View */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500">Loading ledger records...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <Clock className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No transactions found</p>
          <p className="text-xs text-slate-400">Transactions will appear here after your first deposit or transfer.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-6 font-semibold">Type & Details</th>
                <th className="py-3 px-6 font-semibold">Reference</th>
                <th className="py-3 px-6 font-semibold">Counterparty</th>
                <th className="py-3 px-6 font-semibold">Date & Time</th>
                <th className="py-3 px-6 font-semibold text-right">Amount (USD)</th>
                <th className="py-3 px-6 font-semibold text-center">Status</th>
                <th className="py-3 px-6 font-semibold text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredTransactions.map((txn) => {
                const effectiveType = txn.userPerspectiveType || txn.transactionType;
                const isIncoming =
                  effectiveType === 'ADD_MONEY' ||
                  effectiveType === 'TRANSFER_RECEIVED' ||
                  txn.transactionType === 'ADD_MONEY';

                return (
                  <tr
                    key={txn.id}
                    onClick={() => onSelectTransaction && onSelectTransaction(txn)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    {/* Type & Icon */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            effectiveType === 'ADD_MONEY'
                              ? 'bg-indigo-50 text-indigo-600'
                              : isIncoming
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {effectiveType === 'ADD_MONEY' ? (
                            <PlusCircle className="w-4 h-4" />
                          ) : isIncoming ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {effectiveType === 'ADD_MONEY'
                              ? 'Salary / Deposit'
                              : effectiveType === 'TRANSFER_SENT'
                              ? `Transfer to ${txn.receiverName}`
                              : `Received from ${txn.senderName || 'Contact'}`}
                          </p>
                          <p className="text-xs text-slate-400 truncate max-w-xs">
                            {txn.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Reference */}
                    <td className="py-4 px-6 font-mono text-slate-500 text-xs">
                      {txn.transactionReference}
                    </td>

                    {/* Counterparty */}
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-800">
                        {isIncoming ? txn.senderName || 'Direct Deposit' : txn.receiverName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {isIncoming ? txn.senderEmail || 'Bank Transfer' : txn.receiverEmail}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(txn.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`font-sans font-bold text-sm ${
                          isIncoming ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIncoming ? '+' : '-'}${txn.amount.toFixed(2)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          txn.transactionStatus === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {txn.transactionStatus === 'SUCCESS' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{txn.transactionStatus}</span>
                      </span>
                    </td>

                    {/* Action Receipt */}
                    <td className="py-4 px-6 text-center">
                      <button
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition"
                        title="View Receipt"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
