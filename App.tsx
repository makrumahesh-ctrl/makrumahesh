
import React, { useState, useMemo, useEffect } from 'react';
import { BankAccount, LoanAccount, Transaction, ViewMode, TransactionType, CurrencyConfig } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { BankAccounts } from './views/BankAccounts';
import { LoanAccounts } from './views/LoanAccounts';
import { Transfers } from './views/Transfers';
import { DailyExpenses } from './views/DailyExpenses';
import { Reports } from './views/Reports';
import { BackupRestore } from './views/BackupRestore';
import { Security } from './views/Security';
import { Setup } from './views/Setup';
import { LockScreen } from './views/LockScreen';
import { Modal } from './components/Modal';
import { Button } from './components/Button';
import { ArrowLeft, LayoutGrid, Wallet, IndianRupee, DollarSign, Euro, PoundSterling, JapaneseYen, RussianRuble, SwissFranc, Banknote, LogOut, HelpCircle, WifiOff, Globe } from 'lucide-react';

// Currency Configuration
const CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', locale: 'en-US', name: 'United States Dollar' },
  { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', locale: 'de-CH', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', locale: 'zh-CN', name: 'Chinese Yuan' },
  { code: 'NZD', symbol: 'NZ$', locale: 'en-NZ', name: 'New Zealand Dollar' },
  { code: 'SGD', symbol: 'S$', locale: 'en-SG', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'dh', locale: 'ar-AE', name: 'UAE Dirham' },
  { code: 'RUB', symbol: '₽', locale: 'ru-RU', name: 'Russian Ruble' },
  { code: 'ZAR', symbol: 'R', locale: 'en-ZA', name: 'South African Rand' },
  { code: 'BRL', symbol: 'R$', locale: 'pt-BR', name: 'Brazilian Real' },
  { code: 'TRY', symbol: '₺', locale: 'tr-TR', name: 'Turkish Lira' },
  { code: 'KRW', symbol: '₩', locale: 'ko-KR', name: 'South Korean Won' },
  { code: 'MXN', symbol: '$', locale: 'es-MX', name: 'Mexican Peso' },
  { code: 'SAR', symbol: '﷼', locale: 'ar-SA', name: 'Saudi Riyal' },
  { code: 'IDR', symbol: 'Rp', locale: 'id-ID', name: 'Indonesian Rupiah' },
];

// Constants
const STORAGE_KEY = 'finance_app_data';
const CARD_GRADIENTS = [
  'from-blue-600 to-blue-800',
  'from-emerald-500 to-teal-700',
  'from-indigo-500 to-purple-700',
  'from-rose-500 to-pink-700',
  'from-amber-500 to-orange-700'
];
const LOAN_GRADIENTS = [
  'from-red-500 to-red-700',
  'from-orange-500 to-orange-700',
  'from-pink-600 to-rose-800'
];

// --- WebAuthn Helpers ---
const bufferEncode = (value: ArrayBuffer) => {
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(value))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

const str2ab = (str: string) => {
    return new Uint8Array(str.split("").map(c => c.charCodeAt(0))).buffer;
}

function App() {
  // Loading State
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // App Data State
  const [pin, setPin] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyConfig | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [webAuthnCredentialId, setWebAuthnCredentialId] = useState<string | null>(null);
  
  const [view, setView] = useState<ViewMode>('DASHBOARD');

  // --- PERSISTENCE & INITIALIZATION ---

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Network Status Listener
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // Browser Close Protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isLocked && pin) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLocked, pin]);

  // Load Data on Mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          
          const restoreDate = (d: string | Date) => new Date(d);
          
          if (parsed.accounts) setAccounts(parsed.accounts.map((a: any) => ({ ...a, updatedAt: restoreDate(a.updatedAt) })));
          if (parsed.loans) setLoans(parsed.loans.map((l: any) => ({ ...l, updatedAt: restoreDate(l.updatedAt) })));
          if (parsed.transactions) setTransactions(parsed.transactions.map((t: any) => ({ ...t, date: restoreDate(t.date) })));
          if (typeof parsed.cashBalance === 'number') setCashBalance(parsed.cashBalance);
          if (parsed.currency) setCurrency(parsed.currency);
          if (parsed.webAuthnCredentialId) setWebAuthnCredentialId(parsed.webAuthnCredentialId);
          
          if (parsed.pin) {
            setPin(parsed.pin);
            setIsLocked(true); 
          } else {
            setIsLocked(false); 
          }
        } else {
            setIsLocked(false); 
        }
      } catch (err) {
        console.error("Failed to load data", err);
        setIsLocked(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save Data on Change
  useEffect(() => {
    if (!isLoading) { 
      const dataToSave = {
        accounts,
        loans,
        transactions,
        cashBalance,
        currency,
        pin,
        webAuthnCredentialId
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [accounts, loans, transactions, cashBalance, currency, pin, webAuthnCredentialId, isLoading]);

  // --- COMPUTED ---

  const totalNetWorth = useMemo(() => {
      const bankTotal = accounts.reduce((acc, curr) => acc + curr.balance, 0);
      return bankTotal + cashBalance;
  }, [accounts, cashBalance]);

  // --- HELPERS ---

  const getRandomGradient = () => CARD_GRADIENTS[Math.floor(Math.random() * CARD_GRADIENTS.length)];
  const getRandomLoanGradient = () => LOAN_GRADIENTS[Math.floor(Math.random() * LOAN_GRADIENTS.length)];
  const generateAccNum = () => `**** ${Math.floor(1000 + Math.random() * 9000)}`;

  const getCurrencyIcon = (code: string) => {
    switch (code) {
      case 'INR': return IndianRupee;
      case 'USD': 
      case 'AUD':
      case 'CAD':
      case 'NZD':
      case 'SGD':
      case 'MXN':
        return DollarSign;
      case 'EUR': return Euro;
      case 'GBP': return PoundSterling;
      case 'JPY': 
      case 'CNY':
        return JapaneseYen;
      case 'RUB': return RussianRuble;
      case 'CHF': return SwissFranc;
      default: return Banknote;
    }
  };

  // --- ACTION HANDLERS ---

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const addTransaction = (
      type: TransactionType, 
      amount: number, 
      desc: string, 
      sourceId: string, 
      sourceName: string, 
      destId?: string, 
      destName?: string,
      dateStr?: string
  ) => {
      const newTx: Transaction = {
          id: Date.now().toString() + Math.random(),
          date: dateStr ? new Date(dateStr) : new Date(),
          amount,
          type,
          description: desc,
          sourceId,
          sourceName,
          destinationId: destId,
          destinationName: destName
      };
      setTransactions(prev => [newTx, ...prev]);
  };

  const handleAddBankAccount = (name: string, balance: number) => {
      const newAcc: BankAccount = {
          id: Date.now().toString(),
          name,
          balance,
          accountNumber: generateAccNum(),
          color: getRandomGradient(),
          updatedAt: new Date()
      };
      setAccounts(prev => [...prev, newAcc]);
      if (balance > 0) {
        addTransaction('INCOME', balance, 'Initial Deposit', 'EXTERNAL', 'External', newAcc.id, name);
      }
  };

  const handleEditBankAccount = (id: string, name: string, balance: number) => {
      setAccounts(prev => prev.map(acc => {
          if (acc.id === id) {
              if (acc.balance !== balance) {
                  const diff = balance - acc.balance;
                  const type = diff > 0 ? 'INCOME' : 'EXPENSE';
                  addTransaction(type === 'INCOME' ? 'INCOME' : 'ADJUSTMENT', Math.abs(diff), 'Balance Adjustment', id, name);
              }
              return { ...acc, name, balance, updatedAt: new Date() };
          }
          return acc;
      }));
  };

  const handleDeleteBankAccount = (id: string) => {
      setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleAddIncome = (accountId: string, amount: number, date: string) => {
      const acc = accounts.find(a => a.id === accountId);
      if (acc) {
          setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance: a.balance + amount } : a));
          addTransaction('INCOME', amount, 'Income Deposit', 'EXTERNAL', 'Income Source', acc.id, acc.name, date);
      }
  };

  const handleAddLoan = (name: string, balance: number) => {
      const newLoan: LoanAccount = {
          id: Date.now().toString(),
          name,
          balance,
          accountNumber: generateAccNum(),
          color: getRandomLoanGradient(),
          updatedAt: new Date()
      };
      setLoans(prev => [...prev, newLoan]);
  };

  const handleEditLoan = (id: string, name: string, balance: number) => {
      setLoans(prev => prev.map(l => l.id === id ? { ...l, name, balance } : l));
  };

  const handleDeleteLoan = (id: string) => {
      setLoans(prev => prev.filter(l => l.id !== id));
  };

  const handleTransfer = (
    sourceId: string, 
    destType: 'LOAN' | 'CASH' | 'BANK' | 'EXTERNAL', 
    destId: string, 
    amount: number,
    remarks: string = '',
    dateStr: string = new Date().toISOString().split('T')[0]
  ) => {
      const sourceAcc = accounts.find(a => a.id === sourceId);
      if (!sourceAcc || sourceAcc.balance < amount) {
          alert('Insufficient funds');
          return;
      }

      setAccounts(prev => prev.map(a => a.id === sourceId ? { ...a, balance: a.balance - amount } : a));

      if (destType === 'CASH') {
          setCashBalance(prev => prev + amount);
          addTransaction('WITHDRAWAL', amount, remarks || 'Cash Withdrawal', sourceAcc.id, sourceAcc.name, 'CASH', 'Cash in Hand', dateStr);
      } else if (destType === 'LOAN') {
          const destLoan = loans.find(l => l.id === destId);
          if (destLoan) {
              setLoans(prev => prev.map(l => l.id === destId ? { ...l, balance: l.balance - amount } : l));
              addTransaction('TRANSFER_LOAN', amount, remarks || 'Loan Payment', sourceAcc.id, sourceAcc.name, destLoan.id, destLoan.name, dateStr);
          }
      } else if (destType === 'BANK') {
          const destAcc = accounts.find(a => a.id === destId);
          if (destAcc) {
              setAccounts(prev => prev.map(a => a.id === destId ? { ...a, balance: a.balance + amount } : a));
              addTransaction('TRANSFER_BANK', amount, remarks || 'Bank Transfer', sourceAcc.id, sourceAcc.name, destAcc.id, destAcc.name, dateStr);
          }
      } else if (destType === 'EXTERNAL') {
          addTransaction('TRANSFER_EXTERNAL', amount, remarks || 'External Payment', sourceAcc.id, sourceAcc.name, 'EXTERNAL', destId, dateStr);
      }
  };

  const handleAddExpense = (date: string, sourceId: string, amount: number, remarks: string) => {
      if (sourceId === 'CASH') {
          if (cashBalance < amount) {
              alert('Insufficient cash');
              return;
          }
          setCashBalance(prev => prev - amount);
          addTransaction('EXPENSE', amount, remarks, 'CASH', 'Cash', undefined, undefined, date);
      } else {
          const acc = accounts.find(a => a.id === sourceId);
          if (!acc || acc.balance < amount) {
              alert('Insufficient funds');
              return;
          }
          setAccounts(prev => prev.map(a => a.id === sourceId ? { ...a, balance: a.balance - amount } : a));
          addTransaction('EXPENSE', amount, remarks, acc.id, acc.name, undefined, undefined, date);
      }
  };

  const handleRestore = (data: any) => {
      if (data.accounts) setAccounts(data.accounts);
      if (data.loans) setLoans(data.loans);
      if (data.transactions) setTransactions(data.transactions);
      if (typeof data.cashBalance === 'number') setCashBalance(data.cashBalance);
      alert("Data restored successfully");
  };

  const handleSetupComplete = (config: CurrencyConfig, pinCode: string) => {
      setCurrency(config);
      setPin(pinCode);
      setIsLocked(false);
  };

  const handleUnlock = () => setIsLocked(false);

  const handleExitRequest = () => setIsExitModalOpen(true);
  
  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    if (pin) setIsLocked(true);
    try { window.close(); } catch (e) {}
  };
  
  const handleRegisterBiometrics = async () => {
    try {
      let userId = localStorage.getItem('webauthn_user_id');
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('webauthn_user_id', userId);
      }
  
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "HOME Finance", id: window.location.hostname },
        user: {
          id: str2ab(userId),
          name: "user@home.finance",
          displayName: "User",
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }], // ES256
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          requireResidentKey: false,
          userVerification: 'preferred',
        },
        timeout: 60000,
        attestation: 'none'
      };

      const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions }) as PublicKeyCredential;
      const credentialId = bufferEncode(credential.rawId);
      setWebAuthnCredentialId(credentialId);
    } catch (err) {
      console.error(err);
      alert(`Could not enable fingerprint login. Error: ${err}`);
      throw err;
    }
  };

  const handleDeregisterBiometrics = () => {
    setWebAuthnCredentialId(null);
  };


  // --- RENDER ---

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading...</div>;
  }

  if (isLocked && pin) {
    return <LockScreen storedPin={pin} onUnlock={handleUnlock} webAuthnCredentialId={webAuthnCredentialId} />;
  }

  if (!currency) {
    return <Setup currencies={CURRENCIES} onComplete={handleSetupComplete} />;
  }

  const CurrencyIcon = getCurrencyIcon(currency.code);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar 
        currentView={view} 
        onChangeView={setView} 
        totalNetWorth={totalNetWorth}
        currency={currency}
        DailyExpenseIcon={CurrencyIcon}
        onExit={handleExitRequest}
      />

      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between md:hidden shrink-0">
          <button onClick={() => setView('DASHBOARD')} className="flex items-center gap-2 text-left">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Wallet className="text-white" size={18} />
            </div>
            <span className="font-bold text-slate-900">HOME</span>
          </button>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <div className="text-slate-400" title="Offline Mode">
                <WifiOff size={18} />
              </div>
            )}
            {view !== 'DASHBOARD' && (
              <button onClick={() => setView('DASHBOARD')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full">
                <LayoutGrid size={20} />
              </button>
            )}
            <button onClick={handleExitRequest} className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-full">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Desktop Navigation Bar */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              {view !== 'DASHBOARD' && (
                  <button 
                      onClick={() => setView('DASHBOARD')}
                      className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                  >
                      <ArrowLeft size={18} />
                      HOME
                  </button>
              )}
            </div>
            <div className="flex items-center gap-4">
                {!isOnline && (
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-slate-500 text-xs font-medium">
                    <WifiOff size={14} />
                    Offline Mode
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Globe size={14} />
                  {currency.code}
                </div>
            </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-5xl mx-auto">
            {view === 'DASHBOARD' && (
              <Dashboard 
                onNavigate={setView} 
                currency={currency}
                DailyExpenseIcon={CurrencyIcon}
                onExit={handleExitRequest}
              />
            )}
            
            {view === 'BANKS' && (
              <BankAccounts 
                accounts={accounts} 
                onAddAccount={handleAddBankAccount} 
                onEditAccount={handleEditBankAccount} 
                onDeleteAccount={handleDeleteBankAccount}
                onAddIncome={handleAddIncome}
                currency={currency}
                CurrencyIcon={CurrencyIcon}
              />
            )}

            {view === 'LOANS' && (
              <LoanAccounts 
                loans={loans} 
                onAddLoan={handleAddLoan} 
                onEditLoan={handleEditLoan} 
                onDeleteLoan={handleDeleteLoan}
                currency={currency}
                CurrencyIcon={CurrencyIcon}
              />
            )}

            {view === 'TRANSFERS' && (
              <Transfers 
                accounts={accounts} 
                loans={loans} 
                onTransfer={handleTransfer}
                currency={currency}
              />
            )}

            {view === 'EXPENSES' && (
              <DailyExpenses 
                accounts={accounts}
                cashBalance={cashBalance}
                onAddExpense={handleAddExpense}
                currency={currency}
                CurrencyIcon={CurrencyIcon}
              />
            )}

            {view === 'REPORTS' && (
              <Reports 
                accounts={accounts}
                loans={loans}
                cashBalance={cashBalance}
                transactions={transactions}
                currency={currency}
              />
            )}

            {view === 'BACKUP' && (
              <BackupRestore 
                data={{accounts, loans, transactions, cashBalance}}
                onRestore={handleRestore}
              />
            )}

            {view === 'SECURITY' && (
              <Security 
                isBiometricEnabled={!!webAuthnCredentialId}
                onRegister={handleRegisterBiometrics}
                onDeregister={handleDeregisterBiometrics}
              />
            )}
          </div>
        </main>
      </div>

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        title="Exit Application?"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="text-slate-600" size={24} />
          </div>
          <p className="text-slate-600 mb-6">
            Are you sure you want to exit? <br/>
            This will lock the application.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsExitModalOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={handleConfirmExit} className="flex-1">Exit & Lock</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;