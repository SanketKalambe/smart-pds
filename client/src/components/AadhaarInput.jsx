import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';

const AadhaarInput = ({ value, onChange, label = "Aadhaar Number (12 Digits)", error, required = true }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    // Only allow numbers, max 12 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 12);
    onChange(cleaned);
  };

  const formatDisplay = (val) => {
    if (!val) return '';
    const parts = [];
    for (let i = 0; i < val.length; i += 4) {
      parts.push(val.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  const isValid = value && value.length === 12;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-blue-400" />
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Encrypted AES-256 at Rest
        </span>
      </div>

      <div className={`relative rounded-xl border transition-all glass-card ${
        isValid ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 
        error ? 'border-rose-500/50 ring-1 ring-rose-500/20' : 
        isFocused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-700'
      }`}>
        <input
          type="text"
          value={formatDisplay(value)}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="1234 5678 9012"
          className="w-full bg-transparent px-4 py-3 text-slate-100 font-mono tracking-widest text-sm focus:outline-none"
        />
        {isValid && (
          <div className="absolute right-3 top-3 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            VALID
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
};

export default AadhaarInput;
