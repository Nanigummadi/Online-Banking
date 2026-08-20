import React, { useState } from 'react';
import { 
  Send, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  Wallet,
  Building,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Transaction } from '../types';

interface TransferPageProps {
  onTransferCompleted: (txn: Transaction) => void;
}

export const TransferPage: React.FC<TransferPageProps> = ({ onTransferCompleted }) => {
  const { user, wallet, refreshUserData } = useAuth();
  const [receiverIdentifier, setReceiverIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successTxn, setSuccessTxn] = useState<Transaction | null>(null);
  const [step, setStep] = useState<'INPUT' | 'CONFIRM'>('INPUT');

  const currentBalance = wallet ? wallet.balance : 0;
  const parsedAmount = parseFloat(amount) || 0;

  const demoRecipients = [
    { name: 'Sarah Smith', identifier: 'sarah.smith@bank.com', walletNumber: 'WLT-51098432' },
    { name: 'Marcus Johnson', identifier: 'marcus.j@bank.com', walletNumber: 'WLT-33829104' },
    { name: 'Alex Chen', identifier: 'alex.chen@bank.com', walletNumber: 'WLT-89234710' },
  ].filter((r) => r.identifier !== user?.email);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!receiverIdentifier.trim()) {
      setErrorMessage('Please enter recipient wallet number, email, or phone.');
      return;
    }

    if (parsedAmount <= 0) {
      setErrorMessage('Transfer amount must be strictly greater than $0.00');
      return;
    }

    if (parsedAmount > currentBalance) {
      setErrorMessage(`Insufficient wallet balance. You have $${currentBalance.toFixed(2)} available.`);
      return;
    }

    if (
      receiverIdentifier.trim().toLowerCase() === user?.email.toLowerCase() ||
      receiverIdentifier.trim() === wallet?.walletNumber
    ) {
      setErrorMessage('Self-transfer is forbidden. You cannot send money to yourself.');
      return;
    }

    setStep('CONFIRM');
  };

  const handleExecuteTransfer = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.transferMoney({
        receiverIdentifier: receiverIdentifier.trim(),
        amount: parsedAmount,
        description: description || `Transfer from ${user?.fullName}`,
      });

      if (res.success && res.data) {
        setSuccessTxn(res.data.transaction);
        await refreshUserData();
        onTransferCompleted(res.data.transaction);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Transfer failed.');
      setStep('INPUT');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessTxn(null);
    setErrorMessage(null);
    setStep('INPUT');
    setReceiverIdentifier('');
    setAmount('');
    setDescription('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 text-slate-800">
      {/* Top Banner */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transfers & Payments</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Send instant funds to any verified wallet, email, or phone number
            </p>
          </div>
        </div>
      </div>

      {/* Main Transfer Form Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
        {successTxn ? (
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Transfer Executed Successfully!</h3>
              <p className="text-sm text-slate-600 mt-1">
                Transferred <span className="font-bold text-emerald-600 font-sans">${successTxn.amount.toFixed(2)} USD</span> to {successTxn.receiverName}.
              </p>
              <p className="text-xs font-mono text-slate-500 mt-3 bg-slate-50 px-3 py-1.5 rounded-lg inline-block border border-slate-200">
                Txn Ref: {successTxn.transactionReference}
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center space-x-3">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition"
              >
                Send Another Transfer
              </button>
            </div>
          </div>
        ) : step === 'CONFIRM' ? (
          /* Confirmation Screen */
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Review & Confirm Transaction</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Please verify recipient information before authorization
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Recipient Identifier</span>
                <span className="font-semibold text-slate-900">{receiverIdentifier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Transfer Amount</span>
                <span className="font-sans font-bold text-slate-900 text-lg">
                  ${parsedAmount.toFixed(2)} USD
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Processing Fee</span>
                <span className="font-semibold text-emerald-600">$0.00 (Zero Fee)</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-slate-500">Wallet Balance After Transfer</span>
                <span className="font-sans font-medium text-slate-700">
                  ${(currentBalance - parsedAmount).toFixed(2)} USD
                </span>
              </div>
              {description && (
                <div className="border-t border-slate-200 pt-3">
                  <span className="text-slate-500 block mb-1">Transfer Memo:</span>
                  <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    "{description}"
                  </p>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setStep('INPUT')}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 disabled:opacity-50 transition flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authorizing Transfer...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize & Send Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleReview} className="space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Recipient Input */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Receiver Email / Wallet ID
              </label>
              <input
                type="text"
                value={receiverIdentifier}
                onChange={(e) => setReceiverIdentifier(e.target.value)}
                required
                placeholder="e.g. sarah.smith@bank.com or WLT-51098432"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            {/* Quick Demo Beneficiaries */}
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-2">
                Quick Beneficiaries
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {demoRecipients.map((rec) => (
                  <button
                    key={rec.identifier}
                    type="button"
                    onClick={() => setReceiverIdentifier(rec.identifier)}
                    className={`p-3 rounded-xl text-left border transition ${
                      receiverIdentifier === rec.identifier
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 truncate">{rec.name}</p>
                    <p className="text-[11px] font-mono text-indigo-600 font-semibold mt-0.5">{rec.walletNumber}</p>
                    <p className="text-[11px] text-slate-400 truncate">{rec.identifier}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Transfer Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </label>
                <span className="text-xs text-slate-500 font-medium">
                  Available:{' '}
                  <strong className="text-slate-900 font-bold">${currentBalance.toFixed(2)}</strong>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-2 text-slate-400 font-semibold text-base">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={currentBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-sans"
                />
              </div>
            </div>

            {/* Description Memo */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Payment Memo / Note (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Rent share, coffee, invoice settlement"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Verification Guarantee Info */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2.5 text-xs text-slate-500">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Transfers are atomic and protected against duplicate submissions.</span>
            </div>

            <button
              id="btn-transfer-review"
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center space-x-2 mt-2"
            >
              <span>Review Transfer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
