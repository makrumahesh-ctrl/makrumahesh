
import React from 'react';
import { Wallet, Landmark, ArrowRightLeft, PieChart, LogOut, LayoutGrid, LucideIcon, ShieldCheck, Database } from 'lucide-react';
import { ViewMode, CurrencyConfig } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  totalNetWorth: number;
  currency: CurrencyConfig;
  DailyExpenseIcon: LucideIcon;
  onExit: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  totalNetWorth, 
  currency,
  DailyExpenseIcon,
  onExit
}) => {
  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'DASHBOARD', label: 'Home', icon: <LayoutGrid size={20} /> },
    { id: 'BANKS', label: 'Bank Accounts', icon: <Landmark size={20} /> },
    { id: 'LOANS', label: 'Loan Accounts', icon: <LogOut size={20} /> },
    { id: 'TRANSFERS', label: 'Money Transfer & Payments', icon: <ArrowRightLeft size={20} /> },
    { id: 'EXPENSES', label: 'Daily Expenses', icon: <DailyExpenseIcon size={20} /> },
    { id: 'REPORTS', label: 'Reports & Balance', icon: <PieChart size={20} /> },
    { id: 'BACKUP', label: 'Backup & Restore', icon: <Database size={20} /> },
    { id: 'SECURITY', label: 'Security', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
      <button 
        onClick={() => onChangeView('DASHBOARD')}
        className="p-6 border-b border-slate-100 flex items-center gap-2 w-full text-left hover:bg-slate-50 transition-colors"
      >
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Wallet className="text-white" size={20} />
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">HOME</span>
      </button>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-left ${
              currentView === item.id
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white shadow-lg">
          <p className="text-xs font-medium opacity-70 mb-1">Net Liquidity (Cash+Bank)</p>
          <p className="text-2xl font-bold tracking-tight">
            {currency.symbol}{totalNetWorth.toLocaleString(currency.locale, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <button
            onClick={onExit}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors text-slate-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100"
          >
            <LogOut size={18} />
            <span>Exit App</span>
        </button>
      </div>
    </aside>
  );
};