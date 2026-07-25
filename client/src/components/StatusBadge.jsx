import React from 'react';

const StatusBadge = ({ status, type = "card" }) => {
  const getBadgeStyle = () => {
    const s = String(status).toUpperCase();
    if (s === 'AAY') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    if (s === 'BPL') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (s === 'APL') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';

    if (s === 'ACTIVE' || s === 'VERIFIED' || s === 'COMPLETED' || s === 'RESOLVED') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (s === 'PENDING' || s === 'OPEN' || s === 'IN-PROGRESS' || s === 'BOOKED') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    if (s === 'REJECTED' || s === 'CANCELLED' || s === 'FULL' || s === 'FAILED') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }

    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getBadgeStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};

export default StatusBadge;
