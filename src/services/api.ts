import { ApiResponse, AuthResponseData, User, Wallet, Transaction, WalletStats, AdminStats } from '../types';

const API_BASE = '/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected network error occurred.');
    }
  }

  // --- AUTHENTICATION ---
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponseData>> {
    return this.request<AuthResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<AuthResponseData>> {
    return this.request<AuthResponseData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- USER PROFILE ---
  async getProfile(): Promise<ApiResponse<{ user: User; wallet: Wallet; stats: WalletStats }>> {
    return this.request<{ user: User; wallet: Wallet; stats: WalletStats }>('/users/me');
  }

  async updateProfile(data: {
    fullName?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- WALLET ---
  async getWallet(): Promise<ApiResponse<{ wallet: Wallet; stats: WalletStats }>> {
    return this.request<{ wallet: Wallet; stats: WalletStats }>('/wallet');
  }

  async addMoney(data: {
    amount: number;
    paymentMethod: string;
    description?: string;
  }): Promise<ApiResponse<{ wallet: Wallet; transaction: Transaction }>> {
    return this.request<{ wallet: Wallet; transaction: Transaction }>('/wallet/add-money', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async transferMoney(data: {
    receiverIdentifier: string;
    amount: number;
    description?: string;
  }): Promise<ApiResponse<{ wallet: Wallet; transaction: Transaction }>> {
    return this.request<{ wallet: Wallet; transaction: Transaction }>('/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- TRANSACTIONS ---
  async getTransactions(params?: {
    search?: string;
    type?: string;
    status?: string;
  }): Promise<ApiResponse<{ transactions: Transaction[]; total: number }>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ transactions: Transaction[]; total: number }>(`/transactions${qs}`);
  }

  async getTransactionById(id: string): Promise<ApiResponse<{ transaction: Transaction }>> {
    return this.request<{ transaction: Transaction }>(`/transactions/${id}`);
  }

  // --- ADMIN ---
  async getAdminDashboard(): Promise<ApiResponse<{ stats: AdminStats; recentTransactions: Transaction[] }>> {
    return this.request<{ stats: AdminStats; recentTransactions: Transaction[] }>('/admin/dashboard');
  }

  async getAdminUsers(): Promise<ApiResponse<{ users: User[]; total: number }>> {
    return this.request<{ users: User[]; total: number }>('/admin/users');
  }

  async getAdminUserById(id: string): Promise<ApiResponse<{ user: User; wallet: Wallet; transactions: Transaction[] }>> {
    return this.request<{ user: User; wallet: Wallet; transactions: Transaction[] }>(`/admin/users/${id}`);
  }

  async toggleUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getAdminWallets(): Promise<ApiResponse<{ wallets: (Wallet & { ownerName: string; ownerEmail: string; ownerStatus: string })[]; total: number }>> {
    return this.request<{ wallets: (Wallet & { ownerName: string; ownerEmail: string; ownerStatus: string })[]; total: number }>('/admin/wallets');
  }

  async getAdminTransactions(params?: {
    search?: string;
    type?: string;
    status?: string;
  }): Promise<ApiResponse<{ transactions: Transaction[]; total: number }>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ transactions: Transaction[]; total: number }>(`/admin/transactions${qs}`);
  }
}

export const api = new ApiService();
