import React, { useState } from 'react';
import { 
  X, 
  Send, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Wallet,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { wallet, user, refreshUserData } = useAuth();
  const [receiverIdentifier, setReceiverIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successTxnRef, setSuccessTxnRef] = useState<string | null>(null);
  const [step, setStep] = useState<'FORM' | 'CONFIRM'>('FORM');

  if (!isOpen) return null;

  const currentBalance = wallet ? wallet.balance : 0;
  const parsedAmount = parseFloat(amount) || 0;

  // Demo shortcut recipients
  const demoRecipients = [
    { name: 'Sarah Smith', identifier: 'sarah.smith@bank.com', walletNumber: 'WLT-51098432' },
    { name: 'Marcus Johnson', identifier: 'marcus.j@bank.com', walletNumber: 'WLT-33829104' },
    { name: 'Alex Chen', identifier: 'alex.chen@bank.com', walletNumber: 'WLT-89234710' },
  ].filter((r) => r.identifier !== user?.email);

  const handleProceedToConfirm = (e: React.FormEvent) => {
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

    if (receiverIdentifier.trim().toLowerCase() === user?.email.toLowerCase() || receiverIdentifier.trim() === wallet?.walletNumber) {
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
        description: description || `Direct transfer from ${user?.fullName}`,
      });

      if (res.success && res.data) {
        setSuccessTxnRef(res.data.transaction.transactionReference);
        await refreshUserData();
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Transfer failed. Check recipient details and retry.');
      setStep('FORM');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessTxnRef(null);
    setErrorMessage(null);
    setStep('FORM');
    setReceiverIdentifier('');
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden text-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Send className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Transfer Money</h3>
              <p className="text-xs text-slate-500">Atomic @Transactional Routing</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successTxnRef ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Transfer Completed!</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Sent <span className="font-bold text-emerald-600 font-sans">${parsedAmount.toFixed(2)}</span> to {receiverIdentifier}.
                </p>
                <p className="text-xs font-mono text-slate-400 mt-2 bg-slate-50 p-2 rounded-lg inline-block border border-slate-200">
                  Reference: {successTxnRef}
                </p>
              </div>
            </div>
          ) : step === 'CONFIRM' ? (
            /* Confirmation Step */
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Recipient</span>
                  <span className="font-semibold text-slate-900">{receiverIdentifier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Transfer Amount</span>
                  <span className="font-sans font-bold text-indigo-600 text-sm">
                    ${parsedAmount.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Transfer Fee</span>
                  <span className="font-semibold text-emerald-600">$0.00 (Free)</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500">Remaining Balance</span>
                  <span className="font-sans font-semibold text-slate-700">
                    ${(currentBalance - parsedAmount).toFixed(2)} USD
                  </span>
                </div>
                {description && (
                  <div className="border-t border-slate-200 pt-2">
                    <span className="text-slate-500 block mb-0.5">Payment Note:</span>
                    <p className="text-slate-700 italic">{description}</p>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTransfer}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 disabled:opacity-50 transition flex items-center justify-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Confirm & Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Form Step */
            <form onSubmit={handleProceedToConfirm} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Recipient Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Recipient Wallet, Email, or Phone
                  </label>
                </div>
                <input
                  type="text"
                  value={receiverIdentifier}
                  onChange={(e) => setReceiverIdentifier(e.target.value)}
                  required
                  placeholder="e.g. WLT-51098432 or sarah.smith@bank.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              {/* Quick Demo Contacts */}
              <div>
                <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                  Quick Demo Contacts:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {demoRecipients.map((rec) => (
                    <button
                      key={rec.identifier}
                      type="button"
                      onClick={() => setReceiverIdentifier(rec.identifier)}
                      className={`p-2 rounded-lg text-left border transition ${
                        receiverIdentifier === rec.identifier
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <p className="text-[11px] font-semibold text-slate-900 truncate">{rec.name}</p>
                      <p className="text-[10px] font-mono text-indigo-600">{rec.walletNumber}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Amount (USD)
                  </label>
                  <span className="text-[11px] text-slate-500 font-sans">
                    Available: <strong className="text-slate-900">${currentBalance.toFixed(2)}</strong>
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
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
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-sans text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Memo Note */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Payment Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Dinner split / freelance fee"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center space-x-1.5"
                >
                  <span>Review Transfer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
