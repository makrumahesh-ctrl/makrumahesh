
import React, { useState, useEffect } from 'react';
import { Delete } from 'lucide-react';

interface PinPadProps {
  title?: string;
  subtitle?: string;
  onComplete: (pin: string) => void;
  error?: string;
  isLoading?: boolean;
}

export const PinPad: React.FC<PinPadProps> = ({ 
  title = "Enter PIN", 
  subtitle = "Enter your 4-digit security code",
  onComplete,
  error,
  isLoading
}) => {
  const [pin, setPin] = useState('');

  const handleNumClick = (num: number) => {
    if (pin.length < 4) {
      const newPin = pin + num.toString();
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
            onComplete(newPin);
            setPin(''); // Reset for security or next attempt
        }, 100); // Small delay for visual feedback
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 text-sm">{subtitle}</p>
      </div>

      {/* Dots Display */}
      <div className="flex gap-4 mb-8 justify-center">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              i < pin.length 
                ? 'bg-indigo-600 scale-110' 
                : 'bg-slate-200'
            } ${error ? 'bg-red-500' : ''}`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-6 animate-pulse font-medium">{error}</p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full px-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumClick(num)}
            disabled={isLoading}
            className="h-16 w-full rounded-2xl bg-white border border-slate-100 shadow-sm text-2xl font-semibold text-slate-700 active:bg-slate-100 active:scale-95 transition-all focus:outline-none"
          >
            {num}
          </button>
        ))}
        <div className="h-16"></div> {/* Spacer */}
        <button
          onClick={() => handleNumClick(0)}
          disabled={isLoading}
          className="h-16 w-full rounded-2xl bg-white border border-slate-100 shadow-sm text-2xl font-semibold text-slate-700 active:bg-slate-100 active:scale-95 transition-all focus:outline-none"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="h-16 w-full rounded-2xl bg-transparent text-slate-400 flex items-center justify-center active:text-slate-600 transition-colors focus:outline-none"
        >
          <Delete size={28} />
        </button>
      </div>
    </div>
  );
};
