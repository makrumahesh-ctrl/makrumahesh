import React from 'react';
import { Landmark, Building2, ArrowRightLeft, PieChart, Database, LucideIcon, LogOut, ShieldCheck } from 'lucide-react';
import { ViewMode, CurrencyConfig } from '../types';

interface DashboardProps {
  onNavigate: (view: ViewMode) => void;
  currency: CurrencyConfig;
  DailyExpenseIcon: LucideIcon;
  onExit: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, currency, DailyExpenseIcon, onExit }) => {
  const menuItems = [
    {
      label: 'Add Bank Account',
      icon: <Landmark size={48} />,
      view: 'BANKS' as ViewMode,
      color: 'bg-indigo-600',
      theme: 'indigo'
    },
    {
      label: 'Add Loan Account',
      icon: <Building2 size={48} />,
      view: 'LOANS' as ViewMode,
      color: 'bg-red-600',
      theme: 'red'
    },
    {
      label: 'Money Transfer & Payments',
      icon: <ArrowRightLeft size={48} />,
      view: 'TRANSFERS' as ViewMode,
      color: 'bg-emerald-600',
      theme: 'emerald'
    },
    {
      label: 'Daily Expenses',
      icon: <DailyExpenseIcon size={48} />,
      view: 'EXPENSES' as ViewMode,
      color: 'bg-amber-600',
      theme: 'amber'
    },
    {
      label: 'Reports & Balance',
      icon: <PieChart size={48} />,
      view: 'REPORTS' as ViewMode,
      color: 'bg-blue-600',
      theme: 'blue'
    },
    {
      label: 'Backup & Restore',
      icon: <Database size={48} />,
      view: 'BACKUP' as ViewMode,
      color: 'bg-cyan-600',
      theme: 'cyan'
    },
     {
      label: 'Security Settings',
      icon: <ShieldCheck size={48} />,
      view: 'SECURITY' as ViewMode,
      color: 'bg-slate-600',
      theme: 'slate'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col min-h-[80vh]">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Family Finance Tracker</h1>
        <p className="text-slate-500">Select an option below to manage your finances ({currency.code}).</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => onNavigate(item.view)}
            className={`
              group relative flex flex-col items-center justify-center aspect-square p-4 w-full
              bg-white rounded-3xl border border-slate-200 shadow-sm 
              transition-all duration-200 ease-out
              hover:shadow-xl hover:-translate-y-1 hover:border-${item.theme}-200
              focus:outline-none focus:ring-4 focus:ring-${item.theme}-100 focus:border-${item.theme}-500 focus:z-10
              active:scale-95 active:shadow-inner active:bg-${item.theme}-50 active:border-${item.theme}-500
            `}
          >
            <div className={`
              p-4 rounded-2xl ${item.color} text-white mb-4 shadow-lg 
              transition-all duration-300
              group-hover:scale-110 
              group-active:scale-100 group-active:shadow-none
            `}>
              {item.icon}
            </div>
            <h3 className={`
              text-sm md:text-base font-bold text-slate-800 
              text-center leading-tight transition-colors duration-200
              group-hover:text-${item.theme}-700 
              group-focus:text-${item.theme}-700
              group-active:text-${item.theme}-800
            `}>
              {item.label}
            </h3>
          </button>
        ))}
      </div>

      <div className="mt-auto flex justify-center pb-8">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-8 py-3 bg-slate-100 text-slate-600 rounded-full font-semibold hover:bg-red-50 hover:text-red-600 hover:shadow-md transition-all active:scale-95 border border-transparent hover:border-red-100"
        >
          <LogOut size={20} />
          Exit App
        </button>
      </div>
    </div>
  );
};