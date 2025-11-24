
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, Search, LucideIcon, Calendar } from 'lucide-react';
import { BankAccount, ModalType, CurrencyConfig } from '../types';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { Modal } from '../components/Modal';

interface BankAccountsProps {
  accounts: BankAccount[];
  onAddAccount: (name: string, balance: number) => void;
  onEditAccount: (id: string, name: string, balance: number) => void;
  onDeleteAccount: (id: string) => void;
  onAddIncome: (accountId: string, amount: number, date: string) => void;
  currency: CurrencyConfig;
  CurrencyIcon: LucideIcon;
}

export const BankAccounts: React.FC<BankAccountsProps> = ({
  accounts,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onAddIncome,
  currency,
  CurrencyIcon
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formBalance, setFormBalance] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (type: ModalType, account: BankAccount | null = null) => {
    setModalType(type);
    setSelectedAccount(account);
    setFormDate(new Date().toISOString().split('T')[0]);
    
    if (type === 'ADD_ACCOUNT') {
      setFormName('');
      setFormBalance('');
    } else if (type === 'EDIT_ACCOUNT' && account) {
      setFormName(account.name);
      setFormBalance(account.balance.toString());
    } else if (type === 'ADD_INCOME') {
      setFormBalance('');
    }
    
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceVal = parseFloat(formBalance);
    
    if (modalType === 'ADD_ACCOUNT') {
      if (formName && !isNaN(balanceVal)) {
        onAddAccount(formName, balanceVal);
      }
    } else if (modalType === 'EDIT_ACCOUNT' && selectedAccount) {
      if (formName && !isNaN(balanceVal)) {
        onEditAccount(selectedAccount.id, formName, balanceVal);
      }
    } else if (modalType === 'ADD_INCOME' && selectedAccount) {
      if (!isNaN(balanceVal) && balanceVal > 0) {
        onAddIncome(selectedAccount.id, balanceVal, formDate);
      }
    } else if (modalType === 'DELETE_ACCOUNT' && selectedAccount) {
      onDeleteAccount(selectedAccount.id);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bank Accounts</h1>
          <p className="text-slate-500">Manage your savings and checking accounts.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openModal('ADD_INCOME')} variant="secondary" icon={<TrendingUp size={18}/>}>
            Add Income
          </Button>
          <Button onClick={() => openModal('ADD_ACCOUNT')} icon={<Plus size={18}/>}>
            Add Account
          </Button>
        </div>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search bank accounts..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map(account => (
          <div key={account.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all">
            <div className={`h-3 bg-gradient-to-r ${account.color}`}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{account.name}</h3>
                  <p className="text-slate-400 text-xs font-mono mt-1">{account.accountNumber}</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                  BANK
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Balance</p>
                <p className="text-3xl font-bold text-slate-900">
                  {currency.symbol}{account.balance.toLocaleString(currency.locale, { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => openModal('EDIT_ACCOUNT', account)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => openModal('ADD_INCOME', account)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <TrendingUp size={16} /> Income
                </button>
                <button 
                  onClick={() => openModal('DELETE_ACCOUNT', account)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredAccounts.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="text-slate-400" />
            </div>
            <p className="text-slate-500">No bank accounts found.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'ADD_ACCOUNT' ? 'Add Bank Account' :
          modalType === 'EDIT_ACCOUNT' ? 'Edit Bank Balance' :
          modalType === 'ADD_INCOME' ? 'Add New Income' :
          'Delete Account'
        }
      >
        {modalType === 'DELETE_ACCOUNT' ? (
           <div className="text-center">
             <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={24} />
             </div>
             <h3 className="text-lg font-medium text-gray-900 mb-2">Delete {selectedAccount?.name}?</h3>
             {!selectedAccount && (
                <Select 
                  label="Select Account to Delete" 
                  value={selectedAccount?.id || ''}
                  onChange={(e) => setSelectedAccount(accounts.find(a => a.id === e.target.value) || null)}
                >
                  <option value="" disabled>Choose account...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
             )}
             <p className="text-gray-500 mb-6 text-sm">
               This will remove the account and all its history. This action cannot be undone.
             </p>
             <div className="flex gap-3">
               <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
               <Button variant="danger" onClick={handleSubmit} className="flex-1" disabled={!selectedAccount}>Delete</Button>
             </div>
           </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {modalType === 'ADD_INCOME' && !selectedAccount && (
              <Select 
                label="Select Bank Account"
                value={selectedAccount?.id || ''}
                onChange={(e) => setSelectedAccount(accounts.find(a => a.id === e.target.value) || null)}
              >
                <option value="" disabled>Choose account...</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            )}

            {modalType !== 'ADD_INCOME' && (
              <Input 
                label="Bank Account Name" 
                value={formName} 
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Savings Account"
                required
              />
            )}

            {modalType === 'ADD_INCOME' && (
               <Input 
                 label="Date Received" 
                 type="date" 
                 value={formDate} 
                 onChange={(e) => setFormDate(e.target.value)}
                 required
                 icon={<Calendar size={16}/>}
               />
            )}

            <Input 
              label={modalType === 'ADD_INCOME' ? "Income Amount" : "Current Balance"}
              type="number" 
              step="0.01"
              value={formBalance} 
              onChange={(e) => setFormBalance(e.target.value)}
              placeholder="0.00"
              required
              icon={<CurrencyIcon size={16} />}
            />

            <div className="flex gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1">
                {modalType === 'ADD_ACCOUNT' ? 'Create Account' : 
                 modalType === 'ADD_INCOME' ? 'Add Income' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
