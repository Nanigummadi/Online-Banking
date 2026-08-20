import bcrypt from 'bcryptjs';
import { UserEntity, WalletEntity, TransactionEntity } from './types';

// In-Memory Relational Store mimicking MySQL 8 tables with ACID-like transactional semantics
class DatabaseStore {
  public users: Map<string, UserEntity> = new Map();
  public wallets: Map<string, WalletEntity> = new Map();
  public transactions: Map<string, TransactionEntity> = new Map();

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('Admin@123', salt);
    const userPasswordHash = bcrypt.hashSync('User@123', salt);

    const now = new Date().toISOString();

    // 1. Seed Admin
    const adminUser: UserEntity = {
      id: 'usr_admin_001',
      fullName: 'System Administrator',
      email: 'admin@bank.com',
      phone: '+1 (800) 555-0199',
      password: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: now,
    };
    this.users.set(adminUser.id, adminUser);

    const adminWallet: WalletEntity = {
      id: 'wlt_admin_001',
      walletNumber: 'WLT-ADMIN-0001',
      balance: 1000000.0,
      userId: adminUser.id,
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: now,
    };
    this.wallets.set(adminWallet.id, adminWallet);

    // 2. Seed Demo User 1 (Alex Chen)
    const user1: UserEntity = {
      id: 'usr_alex_001',
      fullName: 'Alex Chen',
      email: 'alex.chen@bank.com',
      phone: '+1 (415) 555-0142',
      password: userPasswordHash,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '2026-02-01T10:30:00.000Z',
      updatedAt: now,
    };
    this.users.set(user1.id, user1);

    const wallet1: WalletEntity = {
      id: 'wlt_alex_001',
      walletNumber: 'WLT-89234710',
      balance: 2450.75,
      userId: user1.id,
      createdAt: '2026-02-01T10:30:00.000Z',
      updatedAt: now,
    };
    this.wallets.set(wallet1.id, wallet1);

    // 3. Seed Demo User 2 (Sarah Smith)
    const user2: UserEntity = {
      id: 'usr_sarah_002',
      fullName: 'Sarah Smith',
      email: 'sarah.smith@bank.com',
      phone: '+1 (415) 555-0188',
      password: userPasswordHash,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '2026-02-05T14:15:00.000Z',
      updatedAt: now,
    };
    this.users.set(user2.id, user2);

    const wallet2: WalletEntity = {
      id: 'wlt_sarah_002',
      walletNumber: 'WLT-51098432',
      balance: 1820.0,
      userId: user2.id,
      createdAt: '2026-02-05T14:15:00.000Z',
      updatedAt: now,
    };
    this.wallets.set(wallet2.id, wallet2);

    // 4. Seed Demo User 3 (Marcus Johnson)
    const user3: UserEntity = {
      id: 'usr_marcus_003',
      fullName: 'Marcus Johnson',
      email: 'marcus.j@bank.com',
      phone: '+1 (212) 555-0177',
      password: userPasswordHash,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '2026-02-10T09:00:00.000Z',
      updatedAt: now,
    };
    this.users.set(user3.id, user3);

    const wallet3: WalletEntity = {
      id: 'wlt_marcus_003',
      walletNumber: 'WLT-33829104',
      balance: 750.5,
      userId: user3.id,
      createdAt: '2026-02-10T09:00:00.000Z',
      updatedAt: now,
    };
    this.wallets.set(wallet3.id, wallet3);

    // 5. Seed Historical Transactions
    const tx1: TransactionEntity = {
      id: 'txn_001',
      transactionReference: 'TXN-2026-904128',
      senderWalletId: null,
      receiverWalletId: wallet1.id,
      senderName: 'Direct Deposit / Card Top-up',
      receiverName: user1.fullName,
      senderEmail: null,
      receiverEmail: user1.email,
      amount: 3000.0,
      transactionType: 'ADD_MONEY',
      transactionStatus: 'SUCCESS',
      description: 'Initial wallet funding via Simulated Bank Account',
      createdAt: '2026-02-10T11:00:00.000Z',
    };
    this.transactions.set(tx1.id, tx1);

    const tx2: TransactionEntity = {
      id: 'txn_002',
      transactionReference: 'TXN-2026-918234',
      senderWalletId: wallet1.id,
      receiverWalletId: wallet2.id,
      senderName: user1.fullName,
      receiverName: user2.fullName,
      senderEmail: user1.email,
      receiverEmail: user2.email,
      amount: 450.0,
      transactionType: 'TRANSFER_SENT',
      transactionStatus: 'SUCCESS',
      description: 'Shared dinner and rent split reimbursement',
      createdAt: '2026-02-12T19:45:00.000Z',
    };
    this.transactions.set(tx2.id, tx2);

    const tx3: TransactionEntity = {
      id: 'txn_003',
      transactionReference: 'TXN-2026-924510',
      senderWalletId: wallet3.id,
      receiverWalletId: wallet1.id,
      senderName: user3.fullName,
      receiverName: user1.fullName,
      senderEmail: user3.email,
      receiverEmail: user1.email,
      amount: 125.75,
      transactionType: 'TRANSFER_RECEIVED',
      transactionStatus: 'SUCCESS',
      description: 'Freelance design contribution',
      createdAt: '2026-02-14T15:20:00.000Z',
    };
    this.transactions.set(tx3.id, tx3);

    const tx4: TransactionEntity = {
      id: 'txn_004',
      transactionReference: 'TXN-2026-938192',
      senderWalletId: wallet1.id,
      receiverWalletId: wallet3.id,
      senderName: user1.fullName,
      receiverName: user3.fullName,
      senderEmail: user1.email,
      receiverEmail: user3.email,
      amount: 225.0,
      transactionType: 'TRANSFER_SENT',
      transactionStatus: 'SUCCESS',
      description: 'Project software license share',
      createdAt: '2026-02-15T14:10:00.000Z',
    };
    this.transactions.set(tx4.id, tx4);
  }

  // Helper generators
  public generateId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
  }

  public generateWalletNumber(): string {
    const random8Digits = Math.floor(10000000 + Math.random() * 90000000);
    return `WLT-${random8Digits}`;
  }

  public generateTransactionRef(): string {
    const year = new Date().getFullYear();
    const random6Digits = Math.floor(100000 + Math.random() * 900000);
    return `TXN-${year}-${random6Digits}`;
  }

  // Repository methods
  public findUserById(id: string): UserEntity | undefined {
    return this.users.get(id);
  }

  public findUserByEmail(email: string): UserEntity | undefined {
    const lowerEmail = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === lowerEmail) {
        return user;
      }
    }
    return undefined;
  }

  public findUserByPhone(phone: string): UserEntity | undefined {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    for (const user of this.users.values()) {
      if (user.phone.replace(/[^0-9+]/g, '') === cleanPhone) {
        return user;
      }
    }
    return undefined;
  }

  public findWalletByUserId(userId: string): WalletEntity | undefined {
    for (const wallet of this.wallets.values()) {
      if (wallet.userId === userId) {
        return wallet;
      }
    }
    return undefined;
  }

  public findWalletByWalletNumber(walletNumber: string): WalletEntity | undefined {
    const cleanNum = walletNumber.trim().toUpperCase();
    for (const wallet of this.wallets.values()) {
      if (wallet.walletNumber.toUpperCase() === cleanNum) {
        return wallet;
      }
    }
    return undefined;
  }

  public findWalletById(walletId: string): WalletEntity | undefined {
    return this.wallets.get(walletId);
  }

  // Atomic Transfer Logic matching Spring's @Transactional
  public executeTransfer(params: {
    senderUserId: string;
    receiverIdentifier: string; // can be wallet number, email, or phone
    amount: number;
    description: string;
  }): { success: boolean; message: string; transaction?: TransactionEntity } {
    const { senderUserId, receiverIdentifier, amount, description } = params;

    // 1. Verify Sender
    const sender = this.findUserById(senderUserId);
    if (!sender) {
      return { success: false, message: 'Sender account not found' };
    }
    if (sender.status !== 'ACTIVE') {
      return { success: false, message: 'Your account is deactivated. Please contact support.' };
    }

    const senderWallet = this.findWalletByUserId(senderUserId);
    if (!senderWallet) {
      return { success: false, message: 'Sender wallet not found' };
    }

    // 2. Validate Amount
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return { success: false, message: 'Transfer amount must be strictly greater than $0.00' };
    }

    // 3. Find Receiver by Wallet Number, Email, or Phone
    let receiverWallet: WalletEntity | undefined;
    let receiverUser: UserEntity | undefined;

    // Try by wallet number first
    if (receiverIdentifier.toUpperCase().startsWith('WLT-') || /^\d{8}$/.test(receiverIdentifier)) {
      receiverWallet = this.findWalletByWalletNumber(receiverIdentifier);
      if (receiverWallet) {
        receiverUser = this.findUserById(receiverWallet.userId);
      }
    }

    // Try by email
    if (!receiverUser) {
      receiverUser = this.findUserByEmail(receiverIdentifier);
      if (receiverUser) {
        receiverWallet = this.findWalletByUserId(receiverUser.id);
      }
    }

    // Try by phone
    if (!receiverUser) {
      receiverUser = this.findUserByPhone(receiverIdentifier);
      if (receiverUser) {
        receiverWallet = this.findWalletByUserId(receiverUser.id);
      }
    }

    if (!receiverUser || !receiverWallet) {
      return {
        success: false,
        message: `Recipient with identifier "${receiverIdentifier}" was not found. Please verify the wallet number, email, or phone.`,
      };
    }

    // 4. Verify Receiver Status
    if (receiverUser.status !== 'ACTIVE') {
      return {
        success: false,
        message: 'Recipient account is currently inactive and cannot receive funds.',
      };
    }

    // 5. Verify Not Self Transfer
    if (sender.id === receiverUser.id || senderWallet.id === receiverWallet.id) {
      return {
        success: false,
        message: 'Self-transfer is not allowed. You cannot transfer money to your own wallet.',
      };
    }

    // 6. Check Balance
    if (senderWallet.balance < amount) {
      return {
        success: false,
        message: `Insufficient wallet balance. Available: $${senderWallet.balance.toFixed(2)}, Required: $${amount.toFixed(2)}`,
      };
    }

    // --- ATOMIC EXECUTION (Simulating Database ACID Transaction Commit) ---
    const now = new Date().toISOString();
    const txnRef = this.generateTransactionRef();

    // Deduct sender balance
    senderWallet.balance = Number((senderWallet.balance - amount).toFixed(2));
    senderWallet.updatedAt = now;

    // Credit receiver balance
    receiverWallet.balance = Number((receiverWallet.balance + amount).toFixed(2));
    receiverWallet.updatedAt = now;

    // Record Transaction
    const transaction: TransactionEntity = {
      id: this.generateId('txn'),
      transactionReference: txnRef,
      senderWalletId: senderWallet.id,
      receiverWalletId: receiverWallet.id,
      senderName: sender.fullName,
      receiverName: receiverUser.fullName,
      senderEmail: sender.email,
      receiverEmail: receiverUser.email,
      amount: Number(amount.toFixed(2)),
      transactionType: 'TRANSFER_SENT',
      transactionStatus: 'SUCCESS',
      description: description?.trim() || `Transfer from ${sender.fullName} to ${receiverUser.fullName}`,
      createdAt: now,
    };

    this.transactions.set(transaction.id, transaction);

    return {
      success: true,
      message: `Successfully transferred $${amount.toFixed(2)} to ${receiverUser.fullName}`,
      transaction,
    };
  }

  // Atomic Add Money
  public executeAddMoney(params: {
    userId: string;
    amount: number;
    paymentMethod: string;
    description?: string;
  }): { success: boolean; message: string; transaction?: TransactionEntity } {
    const { userId, amount, paymentMethod, description } = params;

    const user = this.findUserById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    if (user.status !== 'ACTIVE') {
      return { success: false, message: 'Account is deactivated' };
    }

    const wallet = this.findWalletByUserId(userId);
    if (!wallet) {
      return { success: false, message: 'Wallet not found' };
    }

    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return { success: false, message: 'Amount must be strictly greater than $0.00' };
    }

    if (amount > 50000) {
      return { success: false, message: 'Single deposit limit is $50,000.00' };
    }

    const now = new Date().toISOString();
    const txnRef = this.generateTransactionRef();

    wallet.balance = Number((wallet.balance + amount).toFixed(2));
    wallet.updatedAt = now;

    const transaction: TransactionEntity = {
      id: this.generateId('txn'),
      transactionReference: txnRef,
      senderWalletId: null,
      receiverWalletId: wallet.id,
      senderName: `Simulated ${paymentMethod || 'Debit Card'} Deposit`,
      receiverName: user.fullName,
      senderEmail: null,
      receiverEmail: user.email,
      amount: Number(amount.toFixed(2)),
      transactionType: 'ADD_MONEY',
      transactionStatus: 'SUCCESS',
      description: description?.trim() || `Wallet funded via ${paymentMethod || 'Instant Top-up'}`,
      createdAt: now,
    };

    this.transactions.set(transaction.id, transaction);

    return {
      success: true,
      message: `Successfully added $${amount.toFixed(2)} to your wallet`,
      transaction,
    };
  }
}

export const db = new DatabaseStore();
