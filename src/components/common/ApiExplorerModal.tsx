import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Send, 
  Copy, 
  Check, 
  Download, 
  Play, 
  ShieldCheck, 
  Code2, 
  Database,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ApiExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EndpointDef {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: 'Auth' | 'User' | 'Wallet' | 'Transactions' | 'Admin';
  description: string;
  requiresAuth: boolean;
  requiredRole?: 'USER' | 'ADMIN';
  defaultBody?: any;
}

export const ApiExplorerModal: React.FC<ApiExplorerModalProps> = ({ isOpen, onClose }) => {
  const { token, user } = useAuth();
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('auth-login');
  const [requestBodyText, setRequestBodyText] = useState<string>('');
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedPostman, setCopiedPostman] = useState(false);

  if (!isOpen) return null;

  const endpoints: EndpointDef[] = [
    {
      id: 'auth-login',
      method: 'POST',
      path: '/api/auth/login',
      category: 'Auth',
      description: 'Authenticate user or admin, receive JWT token and profile data',
      requiresAuth: false,
      defaultBody: {
        email: 'alex.chen@bank.com',
        password: 'User@123',
      },
    },
    {
      id: 'auth-register',
      method: 'POST',
      path: '/api/auth/register',
      category: 'Auth',
      description: 'Register a new customer account, hash password via BCrypt, and provision wallet with balance 0.00',
      requiresAuth: false,
      defaultBody: {
        fullName: 'Jordan Taylor',
        email: `jordan.${Math.floor(Math.random() * 9000 + 1000)}@bank.com`,
        phone: `+1 (415) 555-${Math.floor(Math.random() * 9000 + 1000)}`,
        password: 'User@123',
        confirmPassword: 'User@123',
      },
    },
    {
      id: 'user-profile',
      method: 'GET',
      path: '/api/users/me',
      category: 'User',
      description: 'Get authenticated user profile, wallet details, and aggregated transaction metrics',
      requiresAuth: true,
    },
    {
      id: 'wallet-get',
      method: 'GET',
      path: '/api/wallet',
      category: 'Wallet',
      description: 'Get current user wallet number, balance, and stats',
      requiresAuth: true,
    },
    {
      id: 'wallet-add-money',
      method: 'POST',
      path: '/api/wallet/add-money',
      category: 'Wallet',
      description: 'Deposit funds into user wallet (Simulated Gateway)',
      requiresAuth: true,
      defaultBody: {
        amount: 500.0,
        paymentMethod: 'Debit Card (Simulated)',
        description: 'Simulated payroll top-up',
      },
    },
    {
      id: 'wallet-transfer',
      method: 'POST',
      path: '/api/wallet/transfer',
      category: 'Wallet',
      description: 'Execute atomic money transfer with ACID rollback & balance check',
      requiresAuth: true,
      defaultBody: {
        receiverIdentifier: 'sarah.smith@bank.com',
        amount: 75.0,
        description: 'Dinner reimbursement split',
      },
    },
    {
      id: 'transactions-list',
      method: 'GET',
      path: '/api/transactions',
      category: 'Transactions',
      description: 'List current user transactions with filters',
      requiresAuth: true,
    },
    {
      id: 'admin-dashboard',
      method: 'GET',
      path: '/api/admin/dashboard',
      category: 'Admin',
      description: 'Get executive system metrics (Total users, wallets, volume, transactions)',
      requiresAuth: true,
      requiredRole: 'ADMIN',
    },
    {
      id: 'admin-users',
      method: 'GET',
      path: '/api/admin/users',
      category: 'Admin',
      description: 'List all registered user accounts with wallet numbers and balances',
      requiresAuth: true,
      requiredRole: 'ADMIN',
    },
    {
      id: 'admin-wallets',
      method: 'GET',
      path: '/api/admin/wallets',
      category: 'Admin',
      description: 'List all wallets in the banking system',
      requiresAuth: true,
      requiredRole: 'ADMIN',
    },
    {
      id: 'admin-transactions',
      method: 'GET',
      path: '/api/admin/transactions',
      category: 'Admin',
      description: 'Audit log of all system transactions across all users',
      requiresAuth: true,
      requiredRole: 'ADMIN',
    },
  ];

  const currentEndpoint = endpoints.find((e) => e.id === selectedEndpointId) || endpoints[0];

  const handleSelectEndpoint = (endpoint: EndpointDef) => {
    setSelectedEndpointId(endpoint.id);
    if (endpoint.defaultBody) {
      setRequestBodyText(JSON.stringify(endpoint.defaultBody, null, 2));
    } else {
      setRequestBodyText('');
    }
    setResponseOutput(null);
    setResponseStatus(null);
  };

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    setResponseOutput(null);
    setResponseStatus(null);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (currentEndpoint.requiresAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method: currentEndpoint.method,
      headers,
    };

    if (currentEndpoint.method !== 'GET' && requestBodyText) {
      options.body = requestBodyText;
    }

    try {
      const startTime = performance.now();
      const res = await fetch(currentEndpoint.path, options);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      setResponseStatus(res.status);
      const data = await res.json();
      setResponseOutput(JSON.stringify({ ...data, _responseTimeMs: duration }, null, 2));
    } catch (err: any) {
      setResponseStatus(500);
      setResponseOutput(JSON.stringify({ error: err.message || 'Request failed' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const getPostmanCollectionJson = () => {
    return {
      info: {
        name: 'Online Banking & Digital Wallet API (Spring Boot 3 / MySQL)',
        _postman_id: '8b42fc91-7c91-4d7a-b9c2-555554321000',
        description: 'Production-ready REST collection for Spring Boot 3 + JWT Digital Banking System.',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      variable: [
        { key: 'baseUrl', value: window.location.origin, type: 'string' },
        { key: 'jwtToken', value: token || '', type: 'string' },
      ],
      item: [
        {
          name: 'Authentication',
          item: [
            {
              name: 'Login User/Admin',
              request: {
                method: 'POST',
                header: [{ key: 'Content-Type', value: 'application/json' }],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({ email: 'alex.chen@bank.com', password: 'User@123' }, null, 2),
                },
                url: { raw: '{{baseUrl}}/api/auth/login', host: ['{{baseUrl}}'], path: ['api', 'auth', 'login'] },
              },
            },
            {
              name: 'Register User',
              request: {
                method: 'POST',
                header: [{ key: 'Content-Type', value: 'application/json' }],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify(
                    {
                      fullName: 'Jordan Taylor',
                      email: 'jordan.t@bank.com',
                      phone: '+1 (415) 555-9988',
                      password: 'User@123',
                      confirmPassword: 'User@123',
                    },
                    null,
                    2
                  ),
                },
                url: { raw: '{{baseUrl}}/api/auth/register', host: ['{{baseUrl}}'], path: ['api', 'auth', 'register'] },
              },
            },
          ],
        },
        {
          name: 'Wallet & Transfers',
          item: [
            {
              name: 'Get Wallet Details',
              request: {
                method: 'GET',
                header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
                url: { raw: '{{baseUrl}}/api/wallet', host: ['{{baseUrl}}'], path: ['api', 'wallet'] },
              },
            },
            {
              name: 'Deposit Money (Add Money)',
              request: {
                method: 'POST',
                header: [
                  { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
                  { key: 'Content-Type', value: 'application/json' },
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({ amount: 500.0, paymentMethod: 'Debit Card', description: 'Simulated funding' }, null, 2),
                },
                url: { raw: '{{baseUrl}}/api/wallet/add-money', host: ['{{baseUrl}}'], path: ['api', 'wallet', 'add-money'] },
              },
            },
            {
              name: 'Transfer Money (Atomic @Transactional)',
              request: {
                method: 'POST',
                header: [
                  { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
                  { key: 'Content-Type', value: 'application/json' },
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify(
                    { receiverIdentifier: 'sarah.smith@bank.com', amount: 100.0, description: 'Dinner reimbursement' },
                    null,
                    2
                  ),
                },
                url: { raw: '{{baseUrl}}/api/wallet/transfer', host: ['{{baseUrl}}'], path: ['api', 'wallet', 'transfer'] },
              },
            },
          ],
        },
        {
          name: 'Admin Endpoints',
          item: [
            {
              name: 'Get System Metrics Dashboard',
              request: {
                method: 'GET',
                header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
                url: { raw: '{{baseUrl}}/api/admin/dashboard', host: ['{{baseUrl}}'], path: ['api', 'admin', 'dashboard'] },
              },
            },
            {
              name: 'Get All Users',
              request: {
                method: 'GET',
                header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
                url: { raw: '{{baseUrl}}/api/admin/users', host: ['{{baseUrl}}'], path: ['api', 'admin', 'users'] },
              },
            },
            {
              name: 'Get All Wallets',
              request: {
                method: 'GET',
                header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
                url: { raw: '{{baseUrl}}/api/admin/wallets', host: ['{{baseUrl}}'], path: ['api', 'admin', 'wallets'] },
              },
            },
            {
              name: 'Get All Transactions Audit',
              request: {
                method: 'GET',
                header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
                url: { raw: '{{baseUrl}}/api/admin/transactions', host: ['{{baseUrl}}'], path: ['api', 'admin', 'transactions'] },
              },
            },
          ],
        },
      ],
    };
  };

  const handleDownloadPostman = () => {
    const postmanJson = JSON.stringify(getPostmanCollectionJson(), null, 2);
    const blob = new Blob([postmanJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Digital_Wallet_System.postman_collection.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyPostman = () => {
    navigator.clipboard.writeText(JSON.stringify(getPostmanCollectionJson(), null, 2));
    setCopiedPostman(true);
    setTimeout(() => setCopiedPostman(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[88vh] bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden flex flex-col text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-base">REST API Interactive Explorer & Postman</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
                  Spring Boot 3 Spec
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Execute live HTTP requests against the backend with JWT authentication
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyPostman}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 border border-slate-200 transition"
              title="Copy Postman Collection JSON"
            >
              {copiedPostman ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPostman ? 'Copied JSON!' : 'Copy Postman JSON'}</span>
            </button>
            <button
              onClick={handleDownloadPostman}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center space-x-1.5 border border-indigo-200 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .json</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Columns: Left (Endpoint list), Right (Runner & Results) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Endpoint List */}
          <div className="w-72 bg-slate-50 border-r border-slate-100 overflow-y-auto p-3 space-y-4 shrink-0">
            {['Auth', 'User', 'Wallet', 'Transactions', 'Admin'].map((category) => {
              const catEndpoints = endpoints.filter((e) => e.category === category);
              if (catEndpoints.length === 0) return null;

              return (
                <div key={category} className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                    {category} Endpoints
                  </span>
                  {catEndpoints.map((ep) => {
                    const isSelected = selectedEndpointId === ep.id;
                    const methodColor =
                      ep.method === 'GET'
                        ? 'text-blue-700 bg-blue-50'
                        : ep.method === 'POST'
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-amber-700 bg-amber-50';

                    return (
                      <button
                        key={ep.id}
                        onClick={() => handleSelectEndpoint(ep)}
                        className={`w-full text-left p-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${methodColor}`}>
                            {ep.method}
                          </span>
                          <span className="truncate text-slate-700 font-mono text-[11px]">{ep.path.replace('/api', '')}</span>
                        </div>
                        {ep.requiredRole === 'ADMIN' && (
                          <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded font-bold ml-1">ADM</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Right: Request & Response Area */}
          <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-4">
            {/* Selected Endpoint Banner */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                      currentEndpoint.method === 'GET'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : currentEndpoint.method === 'POST'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {currentEndpoint.method}
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-900">{currentEndpoint.path}</span>
                </div>

                <button
                  id="btn-execute-api"
                  onClick={handleExecuteRequest}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 disabled:opacity-50 transition flex items-center space-x-1.5"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Send Request</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-600">{currentEndpoint.description}</p>

              {/* Auth Details */}
              <div className="flex items-center space-x-4 text-[11px] text-slate-500 pt-1 font-mono">
                <span>
                  Auth Required:{' '}
                  <strong className={currentEndpoint.requiresAuth ? 'text-amber-700' : 'text-slate-500'}>
                    {currentEndpoint.requiresAuth ? 'YES (Bearer JWT)' : 'NO (Public)'}
                  </strong>
                </span>
                {currentEndpoint.requiredRole && (
                  <span>
                    Role Required: <strong className="text-amber-700">{currentEndpoint.requiredRole}</strong>
                  </span>
                )}
                {token && (
                  <span className="text-emerald-700 truncate max-w-xs">
                    Current Token: Bearer {token.slice(0, 15)}...
                  </span>
                )}
              </div>
            </div>

            {/* Request Body (If POST/PUT) */}
            {currentEndpoint.method !== 'GET' && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Request Payload (JSON)
                </label>
                <textarea
                  rows={5}
                  value={requestBodyText}
                  onChange={(e) => setRequestBodyText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            )}

            {/* Response Output */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live API Response</span>
                  {responseStatus && (
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        responseStatus >= 200 && responseStatus < 300
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      HTTP {responseStatus}
                    </span>
                  )}
                </div>
                {responseOutput && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(responseOutput);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-slate-500 hover:text-slate-800 text-xs flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>

              <div className="flex-1 min-h-[160px] bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto font-mono text-xs text-slate-800">
                {responseOutput ? (
                  <pre className="whitespace-pre-wrap">{responseOutput}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-center">
                    Click "Send Request" to test this endpoint against the live server.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
