import React from 'react';
import { PhoneCall, ShieldAlert, LifeBuoy } from 'lucide-react';

const HelplineWidget = ({ helplineNumber = "1800-11-1967" }) => {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <a
        href={`tel:${helplineNumber}`}
        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-panel border border-blue-500/40 text-slate-100 shadow-2xl shadow-blue-500/20 hover:scale-105 hover:border-blue-400 transition-all duration-300 group"
      >
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
          <PhoneCall className="w-4 h-4" />
        </div>
        <div className="text-left">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
            National PDS Toll-Free Helpline
          </span>
          <span className="text-xs font-extrabold text-slate-100 tracking-wide font-mono">
            {helplineNumber}
          </span>
        </div>
      </a>
    </div>
  );
};

export default HelplineWidget;
