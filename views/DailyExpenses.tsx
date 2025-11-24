
import React, { useState } from 'react';
import { Calendar, LucideIcon } from 'lucide-react';
import { BankAccount, CurrencyConfig } from '../types';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';

interface DailyExpensesProps {
  accounts: BankAccount[];
  cashBalance: number;
  onAddExpense: (date: string, sourceId: string, amount: number, remarks: string) => void;
  currency: CurrencyConfig;
  CurrencyIcon: LucideIcon;
}

export const DailyExpenses: React.FC<DailyExpensesProps> = ({ 
  accounts, 
  cashBalance, 
  onAddExpense,
  currency,
  CurrencyIcon
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sourceId, setSourceId] = useState('');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !amount || !remarks) return;

    const val = parseFloat(amount);
    if (val > 0) {
      onAddExpense(date, sourceId, val, remarks);
      setAmount('');
      setRemarks('');
      setSuccessMsg('Expense recorded successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Daily Expenses</h1>
        <p className="text-slate-500">Log your spending and transactions.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
         {successMsg && (
             <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center">
               <span className="mr-2">✓</span> {successMsg}
             </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input 
                 label="Date" 
                 type="date" 
                 value={date} 
                 onChange={(e) => setDate(e.target.value)}
                 required
                 icon={<Calendar size={16}/>}
               />
               
               <Input 
                 label="Amount" 
                 type="number" 
                 step="0.01"
                 value={amount} 
                 onChange={(e) => setAmount(e.target.value)}
                 placeholder="0.00"
                 required
                 icon={<CurrencyIcon size={16}/>}
               />
            </div>

            <Select 
              label="Payment Source" 
              value={sourceId} 
              onChange={(e) => setSourceId(e.target.value)}
              required
            >
              <option value="" disabled>Select Source...</option>
              <option value="CASH">Cash in Hand (Avail: {currency.symbol}{cashBalance.toLocaleString(currency.locale)})</option>
              <optgroup label="Bank Accounts">
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} (Avail: {currency.symbol}{acc.balance.toLocaleString(currency.locale)})</option>
                ))}
              </optgroup>
            </Select>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1.5">Remarks</label>
               <textarea
                 className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 focus:outline-none focus:ring-2 transition-all"
                 rows={3}
                 placeholder="What was this expense for?"
                 value={remarks}
                 onChange={(e) => setRemarks(e.target.value)}
                 required
               ></textarea>
            </div>

            <Button type="submit" className="w-full py-3 text-lg shadow-indigo-300">
              Save Expense
            </Button>
         </form>
      </div>
    </div>
  );
};
