
import React, { useState } from 'react';
import { Search, Wallet, Check, Globe, ArrowRight, Lock } from 'lucide-react';
import { CurrencyConfig } from '../types';
import { Button } from '../components/Button';
import { PinPad } from '../components/PinPad';

interface SetupProps {
  currencies: CurrencyConfig[];
  onComplete: (config: CurrencyConfig, pin: string) => void;
}

export const Setup: React.FC<SetupProps> = ({ currencies, onComplete }) => {
  const [step, setStep] = useState<'CURRENCY' | 'PIN'>('CURRENCY');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // PIN State
  const [pinStep, setPinStep] = useState<'CREATE' | 'CONFIRM'>('CREATE');
  const [firstPin, setFirstPin] = useState('');
  const [pinError, setPinError] = useState('');

  const filteredCurrencies = currencies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCurrencyConfirm = () => {
    if (selectedCurrency) {
      setStep('PIN');
    }
  };

  const handlePinEntry = (enteredPin: string) => {
    setPinError('');
    if (pinStep === 'CREATE') {
      setFirstPin(enteredPin);
      setPinStep('CONFIRM');
    } else {
      if (enteredPin === firstPin) {
        if (selectedCurrency) {
          onComplete(selectedCurrency, enteredPin);
        }
      } else {
        setPinError("PINs don't match. Try again.");
        setPinStep('CREATE');
        setFirstPin('');
      }
    }
  };

  if (step === 'PIN') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <Lock size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Secure Your App</h1>
            <p className="text-slate-500">Set a 4-digit PIN to protect your financial data.</p>
          </div>

          <PinPad 
            title={pinStep === 'CREATE' ? "Create PIN" : "Confirm PIN"}
            subtitle={pinStep === 'CREATE' ? "Enter a new 4-digit PIN" : "Re-enter to confirm"}
            onComplete={handlePinEntry}
            error={pinError}
          />
          
          <div className="mt-6 text-center">
             <button onClick={() => setStep('CURRENCY')} className="text-sm text-slate-400 hover:text-indigo-600">
               Back to Currency Selection
             </button>
          </div>
        </div>
      </div>
    );
  }

  // Currency Step
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-indigo-600 p-8 text-center flex-shrink-0">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Wallet className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome</h1>
          <p className="text-indigo-100">Step 1 of 2: Select your currency</p>
        </div>

        <div className="p-6 flex-1 flex flex-col overflow-hidden">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search currency (e.g. USD, Euro)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredCurrencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => setSelectedCurrency(curr)}
                className={`w-full p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 text-left ${
                  selectedCurrency?.code === curr.code
                    ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                    : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                   selectedCurrency?.code === curr.code ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {curr.symbol}
                </div>
                <div className="flex-1">
                  <div className={`font-bold ${selectedCurrency?.code === curr.code ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {curr.code}
                  </div>
                  <div className="text-xs text-slate-500">{curr.name}</div>
                </div>
                {selectedCurrency?.code === curr.code && (
                  <div className="text-indigo-600">
                    <Check size={20} strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex-shrink-0">
             <Button 
                onClick={handleCurrencyConfirm} 
                disabled={!selectedCurrency}
                className="w-full py-3 text-lg"
                icon={<ArrowRight size={20} />}
              >
                Continue
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
