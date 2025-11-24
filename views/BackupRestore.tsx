
import React, { useRef, useState } from 'react';
import { Download, Upload, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';
import { BankAccount, LoanAccount, Transaction } from '../types';

interface BackupData {
  accounts: BankAccount[];
  loans: LoanAccount[];
  transactions: Transaction[];
  cashBalance: number;
  version: string;
  timestamp: string;
}

interface BackupRestoreProps {
  data: {
    accounts: BankAccount[];
    loans: LoanAccount[];
    transactions: Transaction[];
    cashBalance: number;
  };
  onRestore: (data: any) => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ data, onRestore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMsg, setErrorMsg] = useState('');

  const handleBackup = () => {
    const backupData: BackupData = {
      ...data,
      version: '1.0',
      timestamp: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const parsedData = JSON.parse(json);
        
        // Basic validation
        if (!parsedData.accounts || !parsedData.loans || !parsedData.transactions) {
          throw new Error("Invalid backup file format");
        }

        onRestore(parsedData);
        setRestoreStatus('SUCCESS');
        setTimeout(() => setRestoreStatus('IDLE'), 3000);
      } catch (err) {
        console.error(err);
        setRestoreStatus('ERROR');
        setErrorMsg('Failed to process file. Ensure it is a valid JSON backup.');
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Backup & Restore</h1>
        <p className="text-slate-500">Secure your data or move it to another device.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* Backup Section */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4 text-cyan-600">
            <Download size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Export Data</h3>
          <p className="text-slate-500 mb-6 max-w-sm">
            Download a complete backup of your accounts, transactions, and history to your device.
          </p>
          <Button onClick={handleBackup} className="w-full max-w-xs" icon={<Download size={18} />}>
            Download Backup
          </Button>
        </div>

        {/* Restore Section */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-600">
            <Upload size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Restore Data</h3>
          <p className="text-slate-500 mb-6 max-w-sm">
            Upload a previously saved backup file to restore your financial data. <br/>
            <span className="text-amber-600 text-xs font-semibold">⚠️ This will overwrite current data.</span>
          </p>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            className="w-full max-w-xs" 
            variant="secondary"
            icon={<Upload size={18} />}
          >
            Select Backup File
          </Button>

          {restoreStatus === 'SUCCESS' && (
             <div className="mt-4 flex items-center gap-2 text-green-600 font-medium animate-pulse">
               <CheckCircle size={18} />
               Data restored successfully!
             </div>
          )}

          {restoreStatus === 'ERROR' && (
             <div className="mt-4 flex items-center gap-2 text-red-600 font-medium">
               <AlertTriangle size={18} />
               {errorMsg}
             </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
        <Database className="text-slate-400 mt-1 flex-shrink-0" size={20} />
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">Data Security Note</h4>
          <p className="text-xs text-slate-500 mt-1">
            Your data is stored locally on your device. Backups are standard JSON text files. 
            Keep them safe as they contain your financial history.
          </p>
        </div>
      </div>
    </div>
  );
};