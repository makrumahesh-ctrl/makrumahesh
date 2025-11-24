
import React, { useState } from 'react';
import { ArrowRightLeft, Wallet, Building2, Banknote, Landmark, Globe, Calendar } from 'lucide-react';
import { BankAccount, LoanAccount, CurrencyConfig } from '../types';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';

interface TransfersProps {
  accounts: BankAccount[];
  loans: LoanAccount[];
  onTransfer: (sourceId: string, destType: 'LOAN' | 'CASH' | 'BANK' | 'EXTERNAL', destId: string, amount: number, remarks?: string, date?: string) => void;
  currency: CurrencyConfig;
}

export const Transfers: React.FC<TransfersProps> = ({ accounts, loans, onTransfer, currency }) => {
  const [activeTab, setActiveTab] = useState<'BANK' | 'LOAN' | 'CASH'>('BANK');
  
  // For Bank Transfers (Internal vs External)
  const [bankTransferType, setBankTransferType] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  
  const [sourceBankId, setSourceBankId] = useState('');
  const [destId, setDestId] = useState(''); // Can be Loan ID, Dest Bank ID, or External Name
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [successMsg, setSuccessMsg] = useState('');

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceBankId) return;
    
    // Validation based on tab
    if (activeTab === 'LOAN' && !destId) return;
    if (activeTab === 'BANK' && !destId) return;
    // For CASH, destId is not required (it's implicit)

    const val = parseFloat(amount);
    if (val > 0) {
        let destType: 'LOAN' | 'CASH' | 'BANK' | 'EXTERNAL';
        
        if (activeTab === 'CASH') {
            destType = 'CASH';
        } else if (activeTab === 'LOAN') {
            destType = 'LOAN';
        } else {
            // Bank Tab
            destType = bankTransferType === 'INTERNAL' ? 'BANK' : 'EXTERNAL';
        }

        onTransfer(sourceBankId, destType, activeTab === 'CASH' ? 'CASH' : destId, val, remarks, date);
        
        setAmount('');
        setRemarks('');
        if (bankTransferType === 'EXTERNAL') setDestId('');
        setSuccessMsg('Transfer successful!');
        setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Money Transfers</h1>
        <p className="text-slate-500">Move money between your accounts or pay externally.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('BANK'); setDestId(''); }}
            className={`flex-1 py-4 px-2 text-sm font-medium text-center transition-colors flex items-center justify-center gap-2 min-w-[120px] ${
              activeTab === 'BANK' 
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Landmark size={18} />
            Bank Transfer
          </button>
          <button
            onClick={() => { setActiveTab('LOAN'); setDestId(''); }}
            className={`flex-1 py-4 px-2 text-sm font-medium text-center transition-colors flex items-center justify-center gap-2 min-w-[120px] ${
              activeTab === 'LOAN' 
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 size={18} />
            Pay Loan
          </button>
          <button
            onClick={() => { setActiveTab('CASH'); setDestId(''); }}
            className={`flex-1 py-4 px-2 text-sm font-medium text-center transition-colors flex items-center justify-center gap-2 min-w-[120px] ${
              activeTab === 'CASH' 
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Banknote size={18} />
            Withdraw Cash
          </button>
        </div>

        <div className="p-8">
           {successMsg && (
             <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center">
               <span className="mr-2">✓</span> {successMsg}
             </div>
           )}

           <form onSubmit={handleTransfer}>
              <div className="space-y-6">
                {/* Source */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">From (Source)</label>
                   <Select 
                     label="Select Bank Account" 
                     value={sourceBankId} 
                     onChange={(e) => setSourceBankId(e.target.value)}
                     className="bg-white"
                     required
                   >
                     <option value="" disabled>Select Bank Account...</option>
                     {accounts.map(acc => (
                       <option key={acc.id} value={acc.id}>
                         {acc.name} (Avail: {currency.symbol}{acc.balance.toLocaleString(currency.locale)})
                       </option>
                     ))}
                   </Select>
                </div>

                <div className="flex justify-center -my-3 relative z-10">
                   <div className="bg-white p-2 rounded-full shadow border border-slate-100 text-slate-400">
                      <ArrowRightLeft size={20} />
                   </div>
                </div>

                {/* Destination */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">To (Destination)</label>
                   
                   {activeTab === 'BANK' && (
                       <div className="mb-4">
                           <div className="flex p-1 bg-slate-200 rounded-lg mb-3">
                               <button
                                   type="button"
                                   onClick={() => { setBankTransferType('INTERNAL'); setDestId(''); }}
                                   className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                                       bankTransferType === 'INTERNAL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                   }`}
                               >
                                   Internal Account
                               </button>
                               <button
                                   type="button"
                                   onClick={() => { setBankTransferType('EXTERNAL'); setDestId(''); }}
                                   className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                                       bankTransferType === 'EXTERNAL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                   }`}
                               >
                                   External Account
                               </button>
                           </div>

                           {bankTransferType === 'INTERNAL' ? (
                               <Select 
                                   label="Select Recipient Account" 
                                   value={destId} 
                                   onChange={(e) => setDestId(e.target.value)}
                                   className="bg-white"
                                   required
                               >
                                   <option value="" disabled>Select Account...</option>
                                   {accounts.filter(a => a.id !== sourceBankId).map(acc => (
                                   <option key={acc.id} value={acc.id}>
                                       {acc.name} (Curr: {currency.symbol}{acc.balance.toLocaleString(currency.locale)})
                                   </option>
                                   ))}
                               </Select>
                           ) : (
                               <div>
                                   <Input 
                                       label="Beneficiary Name / Details"
                                       value={destId} // Using destId to store the name for external
                                       onChange={(e) => setDestId(e.target.value)}
                                       placeholder="e.g. Landlord, Electric Bill, Friend"
                                       required
                                       className="bg-white"
                                       icon={<Globe size={16} />}
                                   />
                               </div>
                           )}
                       </div>
                   )}
                   
                   {activeTab === 'LOAN' && (
                      <Select 
                        label="Select Loan Account" 
                        value={destId} 
                        onChange={(e) => setDestId(e.target.value)}
                        className="bg-white"
                        required
                      >
                        <option value="" disabled>Select Loan Account...</option>
                        {loans.map(loan => (
                          <option key={loan.id} value={loan.id}>
                            {loan.name} (Owe: {currency.symbol}{loan.balance.toLocaleString(currency.locale)})
                          </option>
                        ))}
                      </Select>
                   )} 
                   
                   {activeTab === 'CASH' && (
                      <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 font-medium">
                        <Wallet size={24} />
                        <div>
                           <p>Cash in Hand</p>
                           <p className="text-xs text-emerald-600 font-normal">Physical wallet</p>
                        </div>
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Date" 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        icon={<Calendar size={16} />}
                    />

                    <Input 
                        label="Amount" 
                        type="number" 
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                        className="text-lg font-semibold"
                    />
                </div>
                
                {(activeTab === 'BANK' || activeTab === 'LOAN') && (
                    <Input 
                        label="Remarks (Optional)"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add a note..."
                    />
                )}

                <Button type="submit" className="w-full py-3 text-lg" disabled={!sourceBankId || (activeTab !== 'CASH' && !destId)}>
                  {activeTab === 'LOAN' ? 'Pay Loan' : 
                   activeTab === 'CASH' ? 'Withdraw Cash' : 
                   bankTransferType === 'INTERNAL' ? 'Transfer Funds' : 'Send Payment'}
                </Button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};
