
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle, LucideIcon } from 'lucide-react';
import { LoanAccount, ModalType, CurrencyConfig } from '../types';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { Modal } from '../components/Modal';

interface LoanAccountsProps {
  loans: LoanAccount[];
  onAddLoan: (name: string, balance: number) => void;
  onEditLoan: (id: string, name: string, balance: number) => void;
  onDeleteLoan: (id: string) => void;
  currency: CurrencyConfig;
  CurrencyIcon: LucideIcon;
}

export const LoanAccounts: React.FC<LoanAccountsProps> = ({
  loans,
  onAddLoan,
  onEditLoan,
  onDeleteLoan,
  currency,
  CurrencyIcon
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedLoan, setSelectedLoan] = useState<LoanAccount | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formBalance, setFormBalance] = useState('');

  const filteredLoans = loans.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (type: ModalType, loan: LoanAccount | null = null) => {
    setModalType(type);
    setSelectedLoan(loan);
    
    if (type === 'ADD_ACCOUNT') {
      setFormName('');
      setFormBalance('');
    } else if (type === 'EDIT_ACCOUNT' && loan) {
      setFormName(loan.name);
      setFormBalance(loan.balance.toString());
    }
    
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceVal = parseFloat(formBalance);
    
    if (modalType === 'ADD_ACCOUNT') {
      if (formName && !isNaN(balanceVal)) {
        onAddLoan(formName, balanceVal);
      }
    } else if (modalType === 'EDIT_ACCOUNT' && selectedLoan) {
      if (formName && !isNaN(balanceVal)) {
        onEditLoan(selectedLoan.id, formName, balanceVal);
      }
    } else if (modalType === 'DELETE_ACCOUNT' && selectedLoan) {
      onDeleteLoan(selectedLoan.id);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loan Accounts</h1>
          <p className="text-slate-500">Track your liabilities and loan payments.</p>
        </div>
        <Button onClick={() => openModal('ADD_ACCOUNT')} variant="danger" icon={<Plus size={18}/>}>
          Add Loan Account
        </Button>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search loan accounts..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLoans.map(loan => (
          <div key={loan.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all">
            <div className={`h-3 bg-gradient-to-r ${loan.color}`}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{loan.name}</h3>
                  <p className="text-slate-400 text-xs font-mono mt-1">{loan.accountNumber}</p>
                </div>
                <div className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-bold">
                  LOAN
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Outstanding Balance</p>
                <p className="text-3xl font-bold text-red-600">
                  -{currency.symbol}{loan.balance.toLocaleString(currency.locale, { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => openModal('EDIT_ACCOUNT', loan)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => openModal('DELETE_ACCOUNT', loan)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredLoans.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="text-slate-400" />
            </div>
            <p className="text-slate-500">No loan accounts found.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'ADD_ACCOUNT' ? 'Add Loan Account' :
          modalType === 'EDIT_ACCOUNT' ? 'Edit Loan Details' :
          'Delete Loan'
        }
      >
        {modalType === 'DELETE_ACCOUNT' ? (
           <div className="text-center">
             <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={24} />
             </div>
             <h3 className="text-lg font-medium text-gray-900 mb-2">Delete {selectedLoan?.name}?</h3>
             {!selectedLoan && (
                <Select 
                  label="Select Loan to Delete" 
                  value={selectedLoan?.id || ''}
                  onChange={(e) => setSelectedLoan(loans.find(a => a.id === e.target.value) || null)}
                >
                  <option value="" disabled>Choose loan...</option>
                  {loans.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
             )}
             <p className="text-gray-500 mb-6 text-sm">
               This will remove the loan account. Ensure it is fully paid off before deleting.
             </p>
             <div className="flex gap-3">
               <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
               <Button variant="danger" onClick={handleSubmit} className="flex-1" disabled={!selectedLoan}>Delete</Button>
             </div>
           </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input 
              label="Loan Account Name" 
              value={formName} 
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Home Mortgage"
              required
            />

            <Input 
              label="Current Outstanding Balance"
              type="number" 
              step="0.01"
              value={formBalance} 
              onChange={(e) => setFormBalance(e.target.value)}
              placeholder="0.00"
              required
              icon={<CurrencyIcon size={16} />}
            />
            <p className="text-xs text-slate-500 -mt-2 mb-4">Enter positive amount for what you owe.</p>

            <div className="flex gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1" variant="danger">
                {modalType === 'ADD_ACCOUNT' ? 'Add Loan' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
