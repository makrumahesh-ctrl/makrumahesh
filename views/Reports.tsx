
import React, { useState } from 'react';
import { Download, PieChart, Calendar, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { BankAccount, LoanAccount, Transaction, CurrencyConfig } from '../types';
import { Button } from '../components/Button';
import { Select } from '../components/Input';

interface ReportsProps {
  accounts: BankAccount[];
  loans: LoanAccount[];
  cashBalance: number;
  transactions: Transaction[];
  currency: CurrencyConfig;
}

export const Reports: React.FC<ReportsProps> = ({ accounts, loans, cashBalance, transactions, currency }) => {
  const [selectedBankId, setSelectedBankId] = useState('ALL');
  const [selectedLoanId, setSelectedLoanId] = useState('ALL');
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const totalBankBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLoanBalance = loans.reduce((sum, loan) => sum + loan.balance, 0);

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999); 
    return tDate >= from && tDate <= to;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleExportExcel = () => {
    // --- XML Spreadsheet 2003 Generator ---
    // This format allows multiple sheets without needing external libraries (perfect for offline/standalone)

    const escapeXml = (unsafe: string | number | null | undefined): string => {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };

    const createWorksheet = (name: string, headers: string[], rows: (string | number | null | undefined)[][]): string => {
        let xml = ` <Worksheet ss:Name="${escapeXml(name)}">\n  <Table>\n`;
        
        // Header Row
        xml += `   <Row>\n`;
        headers.forEach(h => {
            xml += `    <Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
        });
        xml += `   </Row>\n`;

        // Data Rows
        rows.forEach(row => {
            xml += `   <Row>\n`;
            row.forEach(cell => {
                // Determine type
                let type = "String";
                let value = escapeXml(cell);
                
                if (typeof cell === 'number') {
                    type = "Number";
                    value = cell.toString();
                }
                
                xml += `    <Cell><Data ss:Type="${type}">${value}</Data></Cell>\n`;
            });
            xml += `   </Row>\n`;
        });

        xml += `  </Table>\n </Worksheet>\n`;
        return xml;
    };

    // --- 1. SNAPSHOT DATA ---
    const snapshotRows = [
        ["Total Bank Balance", totalBankBalance],
        ["Cash in Hand", cashBalance],
        ["Total Net Worth", totalBankBalance + cashBalance],
        ["Outstanding Loans", -totalLoanBalance]
    ];

    // --- 2. BANK DATA ---
    const bankRows = accounts.map(a => [a.name, a.accountNumber, a.balance]);

    // --- 3. LOAN DATA ---
    const loanRows = loans.map(l => [l.name, l.accountNumber, l.balance]);

    // --- 4. EXPENSES DATA ---
    const expenses = filteredTransactions.filter(t => t.type === 'EXPENSE');
    const expenseRows = expenses.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.amount,
        t.sourceName,
        t.description
    ]);

    // --- 5. TRANSFER DATA ---
    const transfers = filteredTransactions.filter(t => t.type !== 'EXPENSE');
    const transferRows = transfers.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.sourceName,
        t.destinationName || '',
        t.amount,
        t.description
    ]);

    // --- BUILD WORKBOOK ---
    let workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
 </Styles>
`;

    workbook += createWorksheet("Snapshot", ["Metric", "Amount"], snapshotRows);
    workbook += createWorksheet("Bank Accounts", ["Bank Name", "Account Number", "Balance"], bankRows);
    workbook += createWorksheet("Loan Accounts", ["Loan Name", "Account Number", "Balance"], loanRows);
    workbook += createWorksheet("Expenses", ["Date", "Amount", "Source", "Remarks"], expenseRows);
    workbook += createWorksheet("Transfers & Income", ["Date", "Type", "Source", "Destination", "Amount", "Description"], transferRows);
    
    workbook += `</Workbook>`;

    // --- DOWNLOAD ---
    const blob = new Blob([workbook], {type: 'application/vnd.ms-excel'});
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `FinanceReport_${dateFrom}_to_${dateTo}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Display logic for specific selection
  const displayedBankBalance = selectedBankId === 'ALL' 
    ? totalBankBalance 
    : accounts.find(a => a.id === selectedBankId)?.balance || 0;

  const displayedLoanBalance = selectedLoanId === 'ALL' 
    ? totalLoanBalance 
    : loans.find(l => l.id === selectedLoanId)?.balance || 0;

  return (
    <div className="space-y-8">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Balance & Reports</h1>
          <p className="text-slate-500">Overview of your financial health.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
           <Calendar size={16} className="text-slate-400 ml-2"/>
           <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="text-sm border-none focus:ring-0 text-slate-600"/>
           <span className="text-slate-300">-</span>
           <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="text-sm border-none focus:ring-0 text-slate-600"/>
           <Button size="sm" onClick={handleExportExcel} variant="outline" icon={<Download size={16}/>} className="ml-2 text-xs px-3 py-1.5">
             Export Excel Report
           </Button>
        </div>
      </header>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bank Balance */}
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><ArrowUpCircle size={24}/></div>
              <Select 
                label="" 
                value={selectedBankId} 
                onChange={e => setSelectedBankId(e.target.value)}
                className="w-32 text-xs mb-0 py-1 px-2 h-8"
              >
                <option value="ALL">All Banks</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
           </div>
           <p className="text-sm text-slate-500 font-medium">Total Bank Balance</p>
           <p className="text-3xl font-bold text-slate-900">
             {currency.symbol}{displayedBankBalance.toLocaleString(currency.locale, { minimumFractionDigits: 2 })}
           </p>
        </div>

        {/* Loan Balance */}
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="bg-red-50 p-2 rounded-lg text-red-600"><ArrowDownCircle size={24}/></div>
              <Select 
                label="" 
                value={selectedLoanId} 
                onChange={e => setSelectedLoanId(e.target.value)}
                className="w-32 text-xs mb-0 py-1 px-2 h-8"
              >
                <option value="ALL">All Loans</option>
                {loans.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
           </div>
           <p className="text-sm text-slate-500 font-medium">Outstanding Loans</p>
           <p className="text-3xl font-bold text-red-600">
             -{currency.symbol}{displayedLoanBalance.toLocaleString(currency.locale, { minimumFractionDigits: 2 })}
           </p>
        </div>

        {/* Cash Balance */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><PieChart size={24}/></div>
           </div>
           <p className="text-sm text-slate-500 font-medium">Cash in Hand</p>
           <p className="text-3xl font-bold text-emerald-700">
             {currency.symbol}{cashBalance.toLocaleString(currency.locale, { minimumFractionDigits: 2 })}
           </p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-800">Transaction History</h3>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                 <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Source</th>
                    <th className="px-6 py-3">Destination</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredTransactions.length > 0 ? (
                    filteredTransactions.map(t => (
                       <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                             <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                t.type === 'INCOME' ? 'bg-green-100 text-green-700' :
                                t.type === 'EXPENSE' ? 'bg-gray-100 text-gray-700' :
                                t.type === 'TRANSFER_LOAN' ? 'bg-indigo-100 text-indigo-700' :
                                t.type === 'WITHDRAWAL' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                             }`}>
                                {t.type.replace('_', ' ')}
                             </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">{t.description}</td>
                          <td className="px-6 py-4 text-slate-500">{t.sourceName}</td>
                          <td className="px-6 py-4 text-slate-500">{t.destinationName || '-'}</td>
                          <td className={`px-6 py-4 text-right font-bold ${
                             t.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'
                          }`}>
                             {t.type === 'INCOME' ? '+' : '-'}{currency.symbol}{t.amount.toLocaleString(currency.locale, { minimumFractionDigits: 2 })}
                          </td>
                       </tr>
                    ))
                 ) : (
                    <tr>
                       <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No transactions found for the selected period.
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
         </div>
      </div>
    </div>
  );
};
