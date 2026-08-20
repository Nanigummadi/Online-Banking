export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type TransactionType = 'ADD_MONEY' | 'TRANSFER_SENT' | 'TRANSFER_RECEIVED';
export type TransactionStatus = 'SUCCESS' | 'FAILED';

export interface UserEntity {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string; // BCrypt hash
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WalletEntity {
  id: string;
  walletNumber: string;
  balance: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionEntity {
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
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}
