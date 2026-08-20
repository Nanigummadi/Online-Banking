import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { generateToken, authenticateJWT, authorizeRoles, AuthenticatedRequest } from './security';
import { UserEntity, WalletEntity, TransactionEntity } from './types';

const router = Router();

// Helper to sanitize user (exclude password)
function sanitizeUser(user: UserEntity) {
  const { password, ...safeUser } = user;
  return safeUser;
}

// ----------------------------------------------------
// 1. AUTHENTICATION CONTROLLER (Public)
// ----------------------------------------------------

// POST /api/auth/register
router.post('/auth/register', (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Full Name, Email, Phone, Password) are required.',
        timestamp: new Date().toISOString(),
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
        timestamp: new Date().toISOString(),
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long and include numbers/symbols.',
        timestamp: new Date().toISOString(),
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
        timestamp: new Date().toISOString(),
      });
    }

    // Check unique email
    if (db.findUserByEmail(email)) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
        timestamp: new Date().toISOString(),
      });
    }

    // Check unique phone
    if (db.findUserByPhone(phone)) {
      return res.status(409).json({
        success: false,
        message: 'A user with this phone number already exists.',
        timestamp: new Date().toISOString(),
      });
    }

    // Hash Password with BCrypt
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const now = new Date().toISOString();

    // Create User
    const newUser: UserEntity = {
      id: db.generateId('usr'),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    db.users.set(newUser.id, newUser);

    // Create Initial Wallet for User (Balance = 0.00)
    const newWallet: WalletEntity = {
      id: db.generateId('wlt'),
      walletNumber: db.generateWalletNumber(),
      balance: 0.0,
      userId: newUser.id,
      createdAt: now,
      updatedAt: now,
    };
    db.wallets.set(newWallet.id, newWallet);

    // Generate JWT Token
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. Digital wallet activated.',
      data: {
        token,
        user: sanitizeUser(newUser),
        wallet: newWallet,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during registration.',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/login
router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        timestamp: new Date().toISOString(),
      });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        timestamp: new Date().toISOString(),
      });
    }

    // Verify BCrypt password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        timestamp: new Date().toISOString(),
      });
    }

    // Verify account status
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
        timestamp: new Date().toISOString(),
      });
    }

    const wallet = db.findWalletByUserId(user.id);
    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: sanitizeUser(user),
        wallet,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during login.',
      timestamp: new Date().toISOString(),
    });
  }
});

// ----------------------------------------------------
// 2. USER CONTROLLER (Protected: USER, ADMIN)
// ----------------------------------------------------

// GET /api/users/me
router.get('/users/me', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const wallet = db.findWalletByUserId(user.id);

  // Compute total added, sent, received
  let totalAdded = 0;
  let totalSent = 0;
  let totalReceived = 0;

  for (const txn of db.transactions.values()) {
    if (wallet && txn.receiverWalletId === wallet.id && txn.transactionType === 'ADD_MONEY' && txn.transactionStatus === 'SUCCESS') {
      totalAdded += txn.amount;
    } else if (wallet && txn.senderWalletId === wallet.id && txn.transactionStatus === 'SUCCESS') {
      totalSent += txn.amount;
    } else if (wallet && txn.receiverWalletId === wallet.id && txn.senderWalletId && txn.transactionStatus === 'SUCCESS') {
      totalReceived += txn.amount;
    }
  }

  return res.json({
    success: true,
    message: 'User profile retrieved successfully.',
    data: {
      user: sanitizeUser(user),
      wallet,
      stats: {
        totalAdded: Number(totalAdded.toFixed(2)),
        totalSent: Number(totalSent.toFixed(2)),
        totalReceived: Number(totalReceived.toFixed(2)),
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// PUT /api/users/me
router.put('/users/me', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { fullName, phone, currentPassword, newPassword } = req.body;

    if (fullName && fullName.trim().length > 0) {
      user.fullName = fullName.trim();
    }

    if (phone && phone.trim().length > 0) {
      // Check phone uniqueness
      const existingPhoneUser = db.findUserByPhone(phone);
      if (existingPhoneUser && existingPhoneUser.id !== user.id) {
        return res.status(409).json({
          success: false,
          message: 'This phone number is already associated with another account.',
          timestamp: new Date().toISOString(),
        });
      }
      user.phone = phone.trim();
    }

    // Password change check
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password.',
          timestamp: new Date().toISOString(),
        });
      }

      const isCurrentValid = bcrypt.compareSync(currentPassword, user.password);
      if (!isCurrentValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match our records.',
          timestamp: new Date().toISOString(),
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.',
          timestamp: new Date().toISOString(),
        });
      }

      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(newPassword, salt);
    }

    user.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: sanitizeUser(user),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile.',
      timestamp: new Date().toISOString(),
    });
  }
});

// ----------------------------------------------------
// 3. WALLET CONTROLLER (Protected: USER, ADMIN)
// ----------------------------------------------------

// GET /api/wallet
router.get('/wallet', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const wallet = db.findWalletByUserId(user.id);

  if (!wallet) {
    return res.status(404).json({
      success: false,
      message: 'Wallet not found for this user.',
      timestamp: new Date().toISOString(),
    });
  }

  // Get user-specific aggregates
  let totalAdded = 0;
  let totalSent = 0;
  let totalReceived = 0;

  for (const txn of db.transactions.values()) {
    if (txn.receiverWalletId === wallet.id && txn.transactionType === 'ADD_MONEY' && txn.transactionStatus === 'SUCCESS') {
      totalAdded += txn.amount;
    } else if (txn.senderWalletId === wallet.id && txn.transactionStatus === 'SUCCESS') {
      totalSent += txn.amount;
    } else if (txn.receiverWalletId === wallet.id && txn.senderWalletId && txn.transactionStatus === 'SUCCESS') {
      totalReceived += txn.amount;
    }
  }

  return res.json({
    success: true,
    message: 'Wallet details retrieved successfully.',
    data: {
      wallet,
      stats: {
        totalAdded: Number(totalAdded.toFixed(2)),
        totalSent: Number(totalSent.toFixed(2)),
        totalReceived: Number(totalReceived.toFixed(2)),
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// POST /api/wallet/add-money
router.post('/wallet/add-money', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { amount, paymentMethod, description } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deposit amount. Amount must be greater than $0.00',
        timestamp: new Date().toISOString(),
      });
    }

    const result = db.executeAddMoney({
      userId: user.id,
      amount: parsedAmount,
      paymentMethod: paymentMethod || 'Debit Card Top-up',
      description,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    }

    const updatedWallet = db.findWalletByUserId(user.id);

    return res.json({
      success: true,
      message: result.message,
      data: {
        wallet: updatedWallet,
        transaction: result.transaction,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error processing wallet deposit.',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/wallet/transfer (ATOMIC MONEY TRANSFER)
router.post('/wallet/transfer', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const sender = req.user!;
    const { receiverIdentifier, amount, description } = req.body;

    if (!receiverIdentifier || receiverIdentifier.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Receiver wallet number, email, or phone is required.',
        timestamp: new Date().toISOString(),
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Transfer amount must be strictly greater than $0.00',
        timestamp: new Date().toISOString(),
      });
    }

    // Execute atomic transactional transfer
    const result = db.executeTransfer({
      senderUserId: sender.id,
      receiverIdentifier: receiverIdentifier.trim(),
      amount: parsedAmount,
      description,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    }

    const updatedWallet = db.findWalletByUserId(sender.id);

    return res.json({
      success: true,
      message: result.message,
      data: {
        wallet: updatedWallet,
        transaction: result.transaction,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Transfer failed due to a system error.',
      timestamp: new Date().toISOString(),
    });
  }
});

// ----------------------------------------------------
// 4. TRANSACTION CONTROLLER (Protected)
// ----------------------------------------------------

// GET /api/transactions
router.get('/transactions', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const wallet = db.findWalletByUserId(user.id);

  if (!wallet) {
    return res.json({
      success: true,
      data: { transactions: [], total: 0 },
      timestamp: new Date().toISOString(),
    });
  }

  const { type, status, search } = req.query;

  // Filter transactions involving this user's wallet
  let txns: TransactionEntity[] = [];
  for (const txn of db.transactions.values()) {
    const isSender = txn.senderWalletId === wallet.id;
    const isReceiver = txn.receiverWalletId === wallet.id;

    if (isSender || isReceiver) {
      // Determine user-perspective transaction type
      let userPerspectiveType = txn.transactionType;
      if (txn.transactionType !== 'ADD_MONEY') {
        userPerspectiveType = isSender ? 'TRANSFER_SENT' : 'TRANSFER_RECEIVED';
      }

      const txWithPerspective = {
        ...txn,
        userPerspectiveType,
        isOutgoing: isSender,
      };

      txns.push(txWithPerspective as any);
    }
  }

  // Sorting: newest first
  txns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Search filter
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    txns = txns.filter(
      (t) =>
        t.transactionReference.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.senderName?.toLowerCase().includes(q) ||
        t.receiverName?.toLowerCase().includes(q) ||
        t.receiverEmail?.toLowerCase().includes(q) ||
        t.senderEmail?.toLowerCase().includes(q)
    );
  }

  // Type filter
  if (type && type !== 'ALL') {
    txns = txns.filter((t) => (t as any).userPerspectiveType === type || t.transactionType === type);
  }

  // Status filter
  if (status && status !== 'ALL') {
    txns = txns.filter((t) => t.transactionStatus === status);
  }

  return res.json({
    success: true,
    message: 'Transactions retrieved successfully.',
    data: {
      transactions: txns,
      total: txns.length,
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/transactions/:id
router.get('/transactions/:id', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const wallet = db.findWalletByUserId(user.id);

  let foundTxn: TransactionEntity | undefined;

  for (const txn of db.transactions.values()) {
    if (txn.id === id || txn.transactionReference === id) {
      foundTxn = txn;
      break;
    }
  }

  if (!foundTxn) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found.',
      timestamp: new Date().toISOString(),
    });
  }

  // Check authorization: must be user involved or admin
  const isSender = wallet && foundTxn.senderWalletId === wallet.id;
  const isReceiver = wallet && foundTxn.receiverWalletId === wallet.id;

  if (user.role !== 'ADMIN' && !isSender && !isReceiver) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this transaction receipt.',
      timestamp: new Date().toISOString(),
    });
  }

  return res.json({
    success: true,
    data: {
      transaction: foundTxn,
    },
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// 5. ADMIN CONTROLLER (Protected: ADMIN ONLY)
// ----------------------------------------------------

// GET /api/admin/dashboard
router.get('/admin/dashboard', authenticateJWT, authorizeRoles('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const totalUsers = Array.from(db.users.values()).filter((u) => u.role === 'USER').length;
  const activeUsers = Array.from(db.users.values()).filter((u) => u.role === 'USER' && u.status === 'ACTIVE').length;
  const inactiveUsers = Array.from(db.users.values()).filter((u) => u.role === 'USER' && u.status === 'INACTIVE').length;
  const totalWallets = db.wallets.size;
  const totalTransactions = db.transactions.size;

  let totalCirculatingBalance = 0;
  for (const wallet of db.wallets.values()) {
    totalCirculatingBalance += wallet.balance;
  }

  let totalVolumeTransferred = 0;
  let totalDeposited = 0;
  for (const txn of db.transactions.values()) {
    if (txn.transactionStatus === 'SUCCESS') {
      if (txn.transactionType === 'ADD_MONEY') {
        totalDeposited += txn.amount;
      } else {
        totalVolumeTransferred += txn.amount;
      }
    }
  }

  // Recent 10 transactions across the entire system
  const allTxns = Array.from(db.transactions.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return res.json({
    success: true,
    message: 'Admin dashboard statistics retrieved.',
    data: {
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalWallets,
        totalTransactions,
        totalCirculatingBalance: Number(totalCirculatingBalance.toFixed(2)),
        totalVolumeTransferred: Number(totalVolumeTransferred.toFixed(2)),
        totalDeposited: Number(totalDeposited.toFixed(2)),
      },
      recentTransactions: allTxns.slice(0, 10),
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/admin/users
router.get('/admin/users', authenticateJWT, authorizeRoles('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const usersList = Array.from(db.users.values()).map((user) => {
    const wallet = db.findWalletByUserId(user.id);
    return {
      ...sanitizeUser(user),
      walletNumber: wallet?.walletNumber || 'N/A',
      walletBalance: wallet?.balance ?? 0,
    };
  });

  return res.json({
    success: true,
    data: {
      users: usersList,
      total: usersList.length,
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/admin/users/:id
router.get('/admin/users/:id', authenticateJWT, authorizeRoles('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = db.findUserById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found.',
      timestamp: new Date().toISOString(),
    });
  }

  const wallet = db.findWalletByUserId(user.id);

  // Get user transaction history
  const userTxns: TransactionEntity[] = [];
  if (wallet) {
    for (const txn of db.transactions.values()) {
      if (txn.senderWalletId === wallet.id || txn.receiverWalletId === wallet.id) {
        userTxns.push(txn);
      }
    }
  }

  return res.json({
    success: true,
    data: {
      user: sanitizeUser(user),
      wallet,
      transactions: userTxns,
    },
    timestamp: new Date().toISOString(),
  });
});

// PUT /api/admin/users/:id/status
router.put('/admin/users/:id/status', authenticateJWT, authorizeRoles('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'ACTIVE' && status !== 'INACTIVE') {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be ACTIVE or INACTIVE.',
      timestamp: new Date().toISOString(),
    });
  }

  const user = db.findUserById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found.',
      timestamp: new Date().toISOString(),
    });
  }

  if (user.role === 'ADMIN') {
    return res.status(400).json({
      success: false,
      message: 'Administrator accounts cannot be deactivated.',
      timestamp: new Date().toISOString(),
    });
  }

  user.status = status;
  user.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    message: `User status successfully updated to ${status}.`,
    data: {
      user: sanitizeUser(user),
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/admin/wallets
router.get('/admin/wallets', authenticateJWT, authorizeRoles('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const walletsList = Array.from(db.wallets.values()).map((wallet) => {
    const user = db.findUserById(wallet.userId);
    return {
      ...wallet,
      ownerName: user?.fullName || 'Unknown',
      ownerEmail: user?.email || 'Unknown',
      ownerStatus: user?.status || 'UNKNOWN',
    };
  });

  return res.json({
    success: true,
    data: {
      wallets: walletsList,
      total: walletsList.length,
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/admin/transactions
router.get('/admin/transactions', authenticateJWT, authorizeRoles('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { search, type, status } = req.query;

  let allTxns = Array.from(db.transactions.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    allTxns = allTxns.filter(
      (t) =>
        t.transactionReference.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.senderName?.toLowerCase().includes(q) ||
        t.receiverName?.toLowerCase().includes(q) ||
        t.receiverEmail?.toLowerCase().includes(q) ||
        t.senderEmail?.toLowerCase().includes(q)
    );
  }

  if (type && type !== 'ALL') {
    allTxns = allTxns.filter((t) => t.transactionType === type);
  }

  if (status && status !== 'ALL') {
    allTxns = allTxns.filter((t) => t.transactionStatus === status);
  }

  return res.json({
    success: true,
    data: {
      transactions: allTxns,
      total: allTxns.length,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
