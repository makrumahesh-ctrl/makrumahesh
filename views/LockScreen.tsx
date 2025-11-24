
import React, { useState, useEffect } from 'react';
import { LockKeyhole, Fingerprint } from 'lucide-react';
import { PinPad } from '../components/PinPad';

interface LockScreenProps {
  storedPin: string;
  onUnlock: () => void;
  webAuthnCredentialId: string | null;
}

const bufferDecode = (value: string) => {
  const s = value.replace(/-/g, "+").replace(/_/g, "/");
  const p = (4 - (s.length % 4)) % 4;
  return new Uint8Array(
    atob(s + "=".repeat(p))
      .split("")
      .map(c => c.charCodeAt(0))
  ).buffer;
};

export const LockScreen: React.FC<LockScreenProps> = ({ storedPin, onUnlock, webAuthnCredentialId }) => {
  const [error, setError] = useState('');
  const [authInProgress, setAuthInProgress] = useState(false);
  const hasBiometricSetup = !!webAuthnCredentialId;

  const handlePinSubmit = (enteredPin: string) => {
    if (enteredPin === storedPin) {
      onUnlock();
    } else {
      setError('Incorrect PIN. Please try again.');
      if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  const handleBiometricAuth = async () => {
    if (!hasBiometricSetup || authInProgress) return;
    setAuthInProgress(true);
    setError('');

    try {
        const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            allowCredentials: [{
                id: bufferDecode(webAuthnCredentialId!),
                type: 'public-key',
            }],
            timeout: 60000,
        };

        await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });
        onUnlock();
    } catch (err) {
        console.error(err);
        const errStr = err instanceof Error ? err.name : String(err);
        if (errStr !== 'NotAllowedError') { // Don't show error if user just cancelled
            setError('Fingerprint authentication failed.');
        }
    } finally {
        setAuthInProgress(false);
    }
  };
  
  useEffect(() => {
    if (hasBiometricSetup) {
      const timer = setTimeout(() => handleBiometricAuth(), 300);
      return () => clearTimeout(timer);
    }
  }, [hasBiometricSetup]);


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-600">
        <LockKeyhole size={32} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">HOME Locked</h1>
      {hasBiometricSetup && <p className="text-slate-500 mb-6">Use your fingerprint or enter PIN</p>}
      
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <PinPad 
          title="Welcome Back"
          subtitle="Enter your 4-digit PIN to access"
          onComplete={handlePinSubmit}
          error={error}
        />
      </div>

      {hasBiometricSetup && (
        <button
          onClick={handleBiometricAuth}
          disabled={authInProgress}
          className="mt-8 flex flex-col items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group"
        >
          <div className="p-4 rounded-full bg-slate-100 group-hover:bg-indigo-50 border border-transparent group-hover:border-indigo-100">
            <Fingerprint size={28} />
          </div>
          <span className="text-sm font-medium">Use Fingerprint</span>
        </button>
      )}
    </div>
  );
};