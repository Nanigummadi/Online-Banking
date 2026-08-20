export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type TransactionType = 'ADD_MONEY' | 'TRANSFER_SENT' | 'TRANSFER_RECEIVED';
export type TransactionStatus = 'SUCCESS' | 'FAILED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  walletNumber?: string;
  walletBalance?: number;
}

export interface Wallet {
  id: string;
  walletNumber: string;
  balance: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  transactionReference: string;
  senderWalletId?: string | null;
  receiverWalletId: string;
  senderName?: string | null;
  receiverName: string;
  senderEmail?: string | null;
  receiverEmail: string;
  amount: number;
  transactionType: TransactionType;
  transactionStatus: TransactionStatus;
  description: string;
  createdAt: string;
  userPerspectiveType?: 'ADD_MONEY' | 'TRANSFER_SENT' | 'TRANSFER_RECEIVED';
  isOutgoing?: boolean;
}

export interface WalletStats {
  totalAdded: number;
  totalSent: number;
  totalReceived: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalWallets: number;
  totalTransactions: number;
  totalCirculatingBalance: number;
  totalVolumeTransferred: number;
  totalDeposited: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export interface AuthResponseData {
  token: string;
  user: User;
  wallet?: Wallet;
}
