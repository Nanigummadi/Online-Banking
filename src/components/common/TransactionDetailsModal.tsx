import React from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Printer, 
  ShieldCheck, 
  Copy, 
  Check 
} from 'lucide-react';
import { Transaction } from '../../types';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !transaction) return null;

  const isSuccess = transaction.transactionStatus === 'SUCCESS';
  const isIncoming =
    transaction.transactionType === 'ADD_MONEY' ||
    transaction.transactionType === 'TRANSFER_RECEIVED' ||
    transaction.userPerspectiveType === 'TRANSFER_RECEIVED' ||
    transaction.userPerspectiveType === 'ADD_MONEY';

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transaction.transactionReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden text-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Official Transaction Receipt
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Receipt Content */}
        <div className="p-6 space-y-6" id="printable-receipt">
          {/* Status & Amount Hero */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 border border-slate-200 mx-auto">
              {isSuccess ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {transaction.transactionType.replace('_', ' ')}
              </p>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <span
                  className={`text-3xl font-bold font-sans ${
                    isIncoming ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {isIncoming ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-400">USD</span>
              </div>
            </div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {transaction.transactionStatus} • Confirmed by Core Engine
            </div>
          </div>

          {/* Detailed Key-Value Rows */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Transaction Reference</span>
              <div className="flex items-center space-x-1.5 font-mono font-semibold text-slate-800">
                <span>{transaction.transactionReference}</span>
                <button
                  onClick={handleCopyRef}
                  className="text-slate-400 hover:text-indigo-600 transition"
                  title="Copy Reference"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Date & Time</span>
              <span className="font-mono text-slate-700">
                {new Date(transaction.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
              <span className="text-slate-500">Sender</span>
              <span className="font-medium text-slate-800 text-right">
                {transaction.senderName || 'Direct Deposit (Simulated Bank)'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Recipient</span>
              <span className="font-medium text-slate-800 text-right">
                {transaction.receiverName}
              </span>
            </div>

            {transaction.description && (
              <div className="border-t border-slate-200 pt-2">
                <span className="text-slate-500 block mb-0.5">Payment Note / Memo:</span>
                <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                  "{transaction.description}"
                </p>
              </div>
            )}

            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>Security Hash Verification</span>
              <span className="font-mono text-emerald-600 font-medium flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SHA-256 Validated</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 border border-slate-200 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
