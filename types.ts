
export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  accountNumber: string;
  color: string;
  updatedAt: Date;
}

export interface LoanAccount {
  id: string;
  name: string;
  balance: number; // Outstanding debt
  accountNumber: string;
  color: string;
  updatedAt: Date;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER_LOAN' | 'WITHDRAWAL' | 'ADJUSTMENT' | 'TRANSFER_BANK' | 'TRANSFER_EXTERNAL';

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: TransactionType;
  sourceId: string; // Account ID or 'CASH' or 'EXTERNAL'
  destinationId?: string; // Account ID or 'CASH' or 'EXTERNAL'
  sourceName: string;
  destinationName?: string;
  description: string;
}

export type ViewMode = 'DASHBOARD' | 'BANKS' | 'LOANS' | 'TRANSFERS' | 'EXPENSES' | 'REPORTS' | 'BACKUP' | 'SECURITY';

export type ModalType = 'ADD_ACCOUNT' | 'EDIT_ACCOUNT' | 'DELETE_ACCOUNT' | 'ADD_INCOME' | null;

// Updated CurrencyCode to include all codes used in App.tsx
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'NZD' | 'SGD' | 'AED' | 'RUB' | 'ZAR' | 'BRL' | 'TRY' | 'KRW' | 'MXN' | 'SAR' | 'IDR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  name: string;
}