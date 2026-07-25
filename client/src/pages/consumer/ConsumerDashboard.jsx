import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDigitalRationBook } from '../../redux/slices/rationBookSlice';
import SlotCalendar from '../../components/SlotCalendar';
import HelplineWidget from '../../components/HelplineWidget';
import StatusBadge from '../../components/StatusBadge';
import { BookOpen, Users, Package, Clock, Building2, ShieldCheck, History } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConsumerDashboard = () => {
  const dispatch = useDispatch();
  const { bookData, loading } = useSelector((state) => state.rationBook);

  useEffect(() => {
    dispatch(fetchDigitalRationBook());
  }, [dispatch]);

  if (loading || !bookData) {
    return (
      <div className="text-center py-16 text-slate-400 text-xs animate-pulse">
        Loading Digital Ration Book & Household Entitlements...
      </div>
    );
  }

  const { rationCardNo, cardType, headOfHousehold, assignedShop, familyMembers, entitlementSummary, transactionHistory, helplineNumber } = bookData;

  return (
    <div className="space-y-8 pb-16">
      {/* TOP HALF: Digital Ration Book Summary */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">Digital Ration Book</h1>
              <StatusBadge status={cardType} />
              <StatusBadge status="ACTIVE" />
            </div>
            <p className="text-xs text-slate-400">Card Number: <span className="font-mono text-blue-400 font-bold">{rationCardNo}</span> • Head: {headOfHousehold}</p>
          </div>

          <Link
            to="/consumer/ration-book"
            className="px-4 py-2 rounded-xl glass-panel border border-slate-700 hover:border-blue-500/40 text-blue-400 text-xs font-bold transition-all self-start sm:self-auto"
          >
            View Full Digital Card →
          </Link>
        </div>

        {/* Household Info & Entitlement Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shop & Card Details */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Assigned Fair Price Shop
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block">Shop Name:</span>
                <span className="font-semibold text-slate-100">{assignedShop?.shopName || 'Janata FPS #42'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Code & Location:</span>
                <span className="font-mono text-slate-300">{assignedShop?.shopCode || 'DIS998877'} • {assignedShop?.address || 'Main Market'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <Users className="w-3.5 h-3.5 text-teal-400" />
                Registered Household Members ({familyMembers.length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {familyMembers.map((m) => (
                  <div key={m.id} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] flex justify-between">
                    <span className="text-slate-200 font-semibold">{m.name} ({m.relation})</span>
                    <span className="font-mono text-slate-400">{m.aadhaarMasked}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Month Entitlement Progress */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                Current Month Entitlement Balance ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Card Quota: {cardType}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entitlementSummary.map((item) => {
                const percent = Math.round((item.drawnQty / item.totalQty) * 100);
                return (
                  <div key={item.item} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-100">{item.item}</span>
                      <span className="font-mono text-slate-400">
                        {item.drawnQty} / {item.totalQty} {item.unit} drawn
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Price: {item.pricePerKg === 0 ? 'FREE' : `₹${item.pricePerKg}/${item.unit}`}</span>
                      <span className="font-bold text-emerald-400">Remaining: {item.remainingQty} {item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM HALF: Slot Calendar Booking System */}
      <div className="pt-4">
        <SlotCalendar assignedShop={assignedShop} />
      </div>

      {/* Persistent Helpline Footer Widget */}
      <HelplineWidget helplineNumber={helplineNumber} />
    </div>
  );
};

export default ConsumerDashboard;
