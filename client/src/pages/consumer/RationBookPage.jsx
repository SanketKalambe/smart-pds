import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDigitalRationBook } from '../../redux/slices/rationBookSlice';
import StatusBadge from '../../components/StatusBadge';
import { CreditCard, Users, Building2, Package, ShieldCheck, History } from 'lucide-react';

const RationBookPage = () => {
  const dispatch = useDispatch();
  const { bookData, loading } = useSelector((state) => state.rationBook);

  useEffect(() => {
    dispatch(fetchDigitalRationBook());
  }, [dispatch]);

  if (loading || !bookData) {
    return <div className="text-center py-10 text-slate-400 text-xs animate-pulse">Loading Digital Ration Card...</div>;
  }

  const { rationCardNo, cardType, headOfHousehold, address, familyMembers, entitlementSummary, transactionHistory } = bookData;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Digital Ration Card Graphic */}
      <div className="p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-400 tracking-widest block">
              Government Public Distribution System
            </span>
            <h2 className="text-2xl font-black text-slate-100 font-['Outfit'] mt-1">Digital Ration Card</h2>
          </div>
          <StatusBadge status={cardType} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-sans block">Ration Card Number</span>
            <span className="text-xl font-bold text-blue-300 tracking-wider">{rationCardNo}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-sans block">Head of Household</span>
            <span className="text-sm font-bold text-slate-100 font-sans">{headOfHousehold}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs relative z-10">
          <span className="text-slate-400">Address: {address}</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Official Verified Digital Credential
          </span>
        </div>
      </div>

      {/* Household Members */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-teal-400" />
          Family Members Included on Card ({familyMembers.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {familyMembers.map((m) => (
            <div key={m.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between font-semibold text-slate-200">
                <span>{m.name}</span>
                <span className="text-teal-400">{m.relation}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                <span>Aadhaar: {m.aadhaarMasked}</span>
                <span>DOB: {m.dateOfBirth ? new Date(m.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RationBookPage;
