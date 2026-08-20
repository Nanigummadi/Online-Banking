import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Building, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  DollarSign, 
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { wallet, refreshUserData } = useAuth();
  const [amount, setAmount] = useState<string>('250');
  const [paymentMethod, setPaymentMethod] = useState<string>('Debit Card (Simulated)');
  const [description, setDescription] = useState<string>('Simulated Wallet Top-up');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successTxnRef, setSuccessTxnRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickAmounts = ['50', '100', '250', '500', '1000', '2500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessTxnRef(null);

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setErrorMessage('Please enter a valid deposit amount greater than $0.00');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.addMoney({
        amount: parsed,
        paymentMethod,
        description: description || `Wallet funded via ${paymentMethod}`,
      });

      if (res.success && res.data) {
        setSuccessTxnRef(res.data.transaction.transactionReference);
        await refreshUserData();
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to deposit money. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessTxnRef(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden text-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Plus className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Money to Wallet</h3>
              <p className="text-xs text-slate-500">Simulated Instant Deposit</p>
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
                <h4 className="text-lg font-bold text-slate-900">Deposit Successful!</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Added <span className="font-bold text-emerald-600 font-sans">${parseFloat(amount).toFixed(2)}</span> to wallet.
                </p>
                <p className="text-xs font-mono text-slate-400 mt-2 bg-slate-50 p-2 rounded-lg inline-block border border-slate-200">
                  Reference: {successTxnRef}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Deposit Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-sans text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Quick Amount Pills */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition border ${
                      amount === q
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    +${q}
                  </button>
                ))}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Payment Funding Source
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'Debit Card (Simulated)', label: 'Visa / Mastercard (•••• 4242)', icon: CreditCard, badge: 'Instant' },
                    { id: 'Simulated ACH Direct Deposit', label: 'Chase Checking (•••• 8910)', icon: Building, badge: 'Zero Fee' },
                    { id: 'Instant Wire / UPI Simulation', label: 'Instant Bank Wire', icon: Zap, badge: 'Fast' },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="text-xs font-medium">{method.label}</span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200">
                          {method.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Memo Note */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Memo Note (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Monthly personal funding"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>256-bit Simulated Gateway</span>
                </span>
                <span>Fee: <strong className="text-emerald-600 font-bold">$0.00</strong></span>
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
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 disabled:opacity-50 transition flex items-center justify-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Confirm Deposit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
