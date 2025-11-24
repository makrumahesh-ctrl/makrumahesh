
import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';

interface SecurityProps {
  isBiometricEnabled: boolean;
  onRegister: () => Promise<void>;
  onDeregister: () => void;
}

export const Security: React.FC<SecurityProps> = ({ isBiometricEnabled, onRegister, onDeregister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isWebAuthnSupported = window.PublicKeyCredential;

  const handleEnable = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onRegister();
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Security Settings</h1>
        <p className="text-slate-500">Manage your application access and security.</p>
      </header>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <Fingerprint size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Fingerprint Login</h3>
            <p className="text-slate-500 text-sm">Use your device's biometric sensor to log in.</p>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-800">Status</p>
            {isBiometricEnabled ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm">Enabled</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span className="text-sm">Disabled</span>
              </div>
            )}
          </div>
          
          {isBiometricEnabled ? (
            <Button onClick={onDeregister} variant="danger" size="sm">
              Disable Fingerprint
            </Button>
          ) : (
            <Button 
              onClick={handleEnable} 
              variant="primary" 
              size="sm" 
              isLoading={isLoading}
              disabled={!isWebAuthnSupported}
            >
              Enable Fingerprint
            </Button>
          )}
        </div>

        {!isWebAuthnSupported && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5"/>
            <span>Your browser does not support Web Authentication, or you are not in a secure context (HTTPS). Fingerprint login is unavailable.</span>
          </div>
        )}
        
        {error && (
            <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        )}

      </div>
      
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
        <ShieldCheck className="text-slate-400 mt-1 flex-shrink-0" size={20} />
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">Security Note</h4>
          <p className="text-xs text-slate-500 mt-1">
            Your biometric data (e.g., your fingerprint) never leaves your device and is not accessible by this application. The browser handles the authentication securely.
          </p>
        </div>
      </div>
    </div>
  );
};
