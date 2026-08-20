import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UserDashboard } from './pages/UserDashboard';
import { WalletPage } from './pages/WalletPage';
import { TransferPage } from './pages/TransferPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminWalletsPage } from './pages/AdminWalletsPage';
import { AdminTransactionsPage } from './pages/AdminTransactionsPage';
import { AddMoneyModal } from './components/common/AddMoneyModal';
import { TransferModal } from './components/common/TransferModal';
import { TransactionDetailsModal } from './components/common/TransactionDetailsModal';
import { ApiExplorerModal } from './components/common/ApiExplorerModal';
import { SpringDocsModal } from './components/common/SpringDocsModal';
import { Transaction } from './types';

function MainAppContent() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals state
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isApiExplorerOpen, setIsApiExplorerOpen] = useState(false);
  const [isSpringDocsOpen, setIsSpringDocsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-500">
        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-medium tracking-widest text-slate-500 uppercase">
          Initializing Digital Banking System...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'REGISTER') {
      return <RegisterPage onNavigateToLogin={() => setAuthView('LOGIN')} />;
    }
    return <LoginPage onNavigateToRegister={() => setAuthView('REGISTER')} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800 font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenApiExplorer={() => setIsApiExplorerOpen(true)}
        onOpenSpringDocs={() => setIsSpringDocsOpen(true)}
        onOpenAddMoney={() => setIsAddMoneyOpen(true)}
        onOpenTransfer={() => setIsTransferOpen(true)}
      />

      {/* Main Layout (Sidebar + Page Content) */}
      <div className="flex-1 flex w-full">
        <Sidebar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
          {currentTab === 'dashboard' && (
            <UserDashboard
              onOpenAddMoney={() => setIsAddMoneyOpen(true)}
              onOpenTransfer={() => setIsTransferOpen(true)}
              onSelectTransaction={(txn) => setSelectedTransaction(txn)}
              onNavigateToTransactions={() => setCurrentTab('transactions')}
            />
          )}

          {currentTab === 'wallet' && (
            <WalletPage
              onOpenAddMoney={() => setIsAddMoneyOpen(true)}
              onOpenTransfer={() => setIsTransferOpen(true)}
              onNavigateToTransactions={() => setCurrentTab('transactions')}
            />
          )}

          {currentTab === 'transfer' && (
            <TransferPage
              onTransferCompleted={(txn) => {
                setSelectedTransaction(txn);
              }}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsPage
              onSelectTransaction={(txn) => setSelectedTransaction(txn)}
            />
          )}

          {currentTab === 'profile' && <ProfilePage />}

          {currentTab === 'admin-dashboard' && (
            <AdminDashboard
              onSelectTransaction={(txn) => setSelectedTransaction(txn)}
              onNavigateToUsers={() => setCurrentTab('admin-users')}
            />
          )}

          {currentTab === 'admin-users' && <AdminUsersPage />}

          {currentTab === 'admin-wallets' && <AdminWalletsPage />}

          {currentTab === 'admin-transactions' && (
            <AdminTransactionsPage
              onSelectTransaction={(txn) => setSelectedTransaction(txn)}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        onSuccess={() => setIsAddMoneyOpen(false)}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={() => setIsTransferOpen(false)}
      />

      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      <ApiExplorerModal
        isOpen={isApiExplorerOpen}
        onClose={() => setIsApiExplorerOpen(false)}
      />

      <SpringDocsModal
        isOpen={isSpringDocsOpen}
        onClose={() => setIsSpringDocsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
