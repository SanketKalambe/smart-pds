import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVerificationQueue, updateVerificationStatus } from '../../redux/slices/adminSlice';
import { UserCheck, Building2, CreditCard, Check, X, ShieldCheck, FileText, AlertCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const VerificationQueue = () => {
  const dispatch = useDispatch();
  const { verificationQueue, loading } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState('distributors'); // 'distributors' or 'consumers'
  const [actionRemarks, setActionRemarks] = useState('');

  useEffect(() => {
    dispatch(fetchVerificationQueue());
  }, [dispatch]);

  const handleAction = (userId, status) => {
    dispatch(updateVerificationStatus({ userId, status, remarks: actionRemarks }));
    setActionRemarks('');
  };

  const { distributors = [], consumers = [] } = verificationQueue;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">KYC Verification Queue</h1>
        <p className="text-xs text-slate-400">Review government IDs, Ration Cards, and Aadhaar numbers before account activation</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('distributors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'distributors'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'glass-panel text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Pending Distributors ({distributors.length})
        </button>

        <button
          onClick={() => setActiveTab('consumers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'consumers'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'glass-panel text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Pending Consumers ({consumers.length})
        </button>
      </div>

      {/* Distributors List */}
      {activeTab === 'distributors' && (
        <div className="space-y-4">
          {distributors.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">
              No pending distributor KYC requests. All accounts are up-to-date!
            </div>
          ) : (
            distributors.map((d) => (
              <div key={d.profileId} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-100">{d.name}</h3>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="text-xs text-slate-400">{d.email} • Phone: {d.phone}</p>
                  </div>
                  <span className="text-xs font-mono text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    Govt ID: {d.distributorGovtId}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-900/60 p-4 rounded-xl">
                  <div>
                    <span className="text-slate-400 block mb-1">Fair Price Shop:</span>
                    <span className="font-semibold text-slate-200">{d.shopName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Distributor Aadhaar (Masked):</span>
                    <span className="font-mono text-slate-200">{d.aadhaarMasked}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Government Registry Match:</span>
                    <span className={`font-bold ${d.distributorGovtIdVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {d.distributorGovtIdVerified ? '✓ MATCHED' : '⚠ MANUAL AUDIT REQUIRED'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Admin remarks / reason for approval or rejection..."
                    value={actionRemarks}
                    onChange={(e) => setActionRemarks(e.target.value)}
                    className="w-full sm:flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleAction(d.userId, 'active')}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(d.userId, 'rejected')}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Consumers List */}
      {activeTab === 'consumers' && (
        <div className="space-y-4">
          {consumers.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">
              No pending consumer KYC requests. All ration cards are verified!
            </div>
          ) : (
            consumers.map((c) => (
              <div key={c.profileId} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-100">{c.headOfHouseholdName || c.name}</h3>
                      <StatusBadge status={c.rationCardType} />
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-xs text-slate-400">Address: {c.address} • Phone: {c.phone}</p>
                  </div>
                  <span className="text-xs font-mono text-teal-400 font-bold bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                    Card No: {c.rationCardNo}
                  </span>
                </div>

                {/* Family Members Table */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300">Family Members ({c.familyMembers.length}):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {c.familyMembers.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between">
                        <span className="text-slate-200 font-semibold">{m.name} ({m.relation})</span>
                        <span className="font-mono text-slate-400">{m.aadhaarMasked}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Admin remarks..."
                    value={actionRemarks}
                    onChange={(e) => setActionRemarks(e.target.value)}
                    className="w-full sm:flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleAction(c.userId, 'active')}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Approve Card
                    </button>
                    <button
                      onClick={() => handleAction(c.userId, 'rejected')}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationQueue;
