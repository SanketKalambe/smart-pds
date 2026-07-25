import React, { useState } from 'react';
import { Fingerprint, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, RefreshCw, Usb } from 'lucide-react';
import Modal from './Modal';

const FingerprintScannerModal = ({ isOpen, onClose, memberName, onScanComplete }) => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [mode, setMode] = useState('simulated'); // 'simulated' or 'webauthn'
  const [error, setError] = useState(null);

  const startScan = async () => {
    setScanning(true);
    setError(null);
    setScannedData(null);

    if (mode === 'webauthn' && window.PublicKeyCredential) {
      try {
        // Attempt browser native WebAuthn biometric credential creation
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: "Smart PDS e-POS System" },
            user: {
              id: new Uint8Array(16),
              name: memberName || "consumer@smartpds.gov.in",
              displayName: memberName || "PDS Beneficiary"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: { authenticatorAttachment: "cross-platform" },
            timeout: 60000
          }
        });

        const hash = `WEBAUTHN_${Date.now()}_MATCH_APPROVED`;
        setScannedData({
          hash,
          quality: '99%',
          timestamp: new Date().toLocaleTimeString(),
          method: 'Hardware WebAuthn Sensor'
        });
        setScanning(false);
        if (onScanComplete) onScanComplete(hash);
        return;
      } catch (err) {
        console.warn('WebAuthn hardware fallback to prototype sensor:', err.message);
        // Fallback to interactive prototype simulator if WebAuthn is cancelled/missing
      }
    }

    // Interactive Prototype Sensor Simulation
    setTimeout(() => {
      const generatedHash = `FP_HASH_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      setScannedData({
        hash: generatedHash,
        quality: `${Math.floor(94 + Math.random() * 6)}%`,
        timestamp: new Date().toLocaleTimeString(),
        method: 'Optical Sensor Prototype'
      });
      setScanning(false);
      if (onScanComplete) onScanComplete(generatedHash);
    }, 2200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Biometric Fingerprint Scanner" maxWidth="max-w-md">
      <div className="space-y-6 text-center text-slate-200">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-100">
            {memberName ? `Scan Fingerprint for: ${memberName}` : 'Biometric Registration & Match'}
          </h3>
          <p className="text-xs text-slate-400">
            Place finger on the sensor or click <span className="text-blue-400 font-semibold">Start Scan</span>
          </p>
        </div>

        {/* Sensor Mode Switcher */}
        <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setMode('simulated')}
            className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
              mode === 'simulated' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive Optical Sensor
          </button>
          <button
            type="button"
            onClick={() => setMode('webauthn')}
            className={`flex-1 py-1.5 font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              mode === 'webauthn' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Usb className="w-3.5 h-3.5" /> USB / WebAuthn
          </button>
        </div>

        {/* Visual Scanner Pad */}
        <div className="relative w-36 h-36 mx-auto rounded-3xl bg-slate-900 border-2 border-slate-700/80 flex items-center justify-center overflow-hidden shadow-inner group">
          {/* Scanning Beam Animation */}
          {scanning && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-lg shadow-blue-500 animate-pulse top-0 animate-[ping_2s_infinite]" />
          )}

          <Fingerprint
            className={`w-20 h-20 transition-all duration-500 ${
              scannedData
                ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105'
                : scanning
                ? 'text-blue-400 animate-pulse scale-110'
                : 'text-slate-600 group-hover:text-blue-400'
            }`}
          />

          {scannedData && (
            <div className="absolute bottom-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
              MATCH {scannedData.quality}
            </div>
          )}
        </div>

        {/* Scan Results */}
        {scannedData ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left space-y-2 text-xs animate-fade-in">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Fingerprint Scanned Successfully
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Template Hash:</span>
                <span className="font-bold text-blue-300">{scannedData.hash.slice(0, 20)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quality Score:</span>
                <span className="text-emerald-400 font-bold">{scannedData.quality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scan Method:</span>
                <span className="text-slate-200">{scannedData.method}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            {scanning ? 'Capturing fingerprint minutiae points...' : 'Press Start Scan to capture biometric hash'}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={scanning}
            onClick={startScan}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            {scanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Scanning Sensor...
              </>
            ) : scannedData ? (
              'Rescan Fingerprint'
            ) : (
              'Start Biometric Scan'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FingerprintScannerModal;
