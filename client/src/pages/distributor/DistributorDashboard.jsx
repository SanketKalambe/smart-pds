import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import FingerprintScannerModal from '../../components/FingerprintScannerModal';
import { Terminal, Boxes, Calendar, ShieldCheck, ArrowRight, Package, Fingerprint, UserCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const DistributorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [lastVerifiedHash, setLastVerifiedHash] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/distributor/dashboard');
      setDashboardData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleScanComplete = (scannedHash) => {
    setLastVerifiedHash({
      hash: scannedHash,
      timestamp: new Date().toLocaleTimeString(),
      status: 'AUTHENTICATED'
    });
  };

  if (loading || !dashboardData) {
    return (
      <div className="text-center py-16 text-slate-400 text-xs animate-pulse">
        Loading Shop Dashboard & Inventory...
      </div>
    );
  }

  const { shop, stockSummary, todaySlotCount, monthlyDistributionCount } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">{shop?.shopName || 'Fair Price Shop'}</h1>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
              OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Shop Code: <span className="font-mono text-blue-400 font-bold">{shop?.shopCode}</span> • Ward/District: {shop?.wardDistrict}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBioModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 text-purple-300 font-bold text-xs shadow-lg shadow-purple-600/10 transition-all flex items-center gap-2"
          >
            <Fingerprint className="w-4 h-4 text-purple-400" />
            Quick Customer Biometric Auth
          </button>

          <Link
            to="/distributor/epos"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/25 transition-all flex items-center gap-2"
          >
            <Terminal className="w-4 h-4" /> Open e-POS Terminal →
          </Link>
        </div>
      </div>

      {lastVerifiedHash && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Biometric Customer Authenticated at {lastVerifiedHash.timestamp}</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-300">Hash: {lastVerifiedHash.hash.slice(0, 22)}...</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">Today's Booked Slots</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-100">{todaySlotCount || 0} Consumers</p>
          <span className="text-[10px] text-slate-500">Expected visiting cardholders</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">Biometric Authentications</span>
            <Fingerprint className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-purple-300">{monthlyDistributionCount || 0} Verified</p>
          <span className="text-[10px] text-purple-400 font-semibold">100% Aadhaar-linked biometrics</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">Monthly Distributions</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-100">{monthlyDistributionCount || 0} Transactions</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Digital Receipts issued</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">Stock Categories</span>
            <Boxes className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-100">{stockSummary?.length || 0} Items</p>
          <span className="text-[10px] text-slate-500">Rice, Wheat, Sugar, Kerosene</span>
        </div>
      </div>

      {/* Stock Summary & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-400" />
              Current Shop Inventory Stock Balance
            </h3>
            <Link to="/distributor/stock" className="text-xs text-blue-400 font-semibold hover:underline">
              Manage Stock →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stockSummary && stockSummary.map((s) => (
              <div key={s.item} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{s.item}</h4>
                  <span className="text-xs text-slate-400 font-mono">Available: {s.availableQty} {s.unit}</span>
                </div>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                  Allocated: {s.allocatedQty} {s.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Biometric & Terminal Quick Start */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-400" />
            Biometric e-POS Quick Actions
          </h3>

          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2 text-xs text-purple-200">
            <span className="font-bold flex items-center gap-1.5 text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Aadhaar Biometric Guard Active
            </span>
            <p className="text-[11px] text-slate-300">
              All ration dispensations require a fingerprint scan match against mock government registries before stock release.
            </p>
          </div>

          <button
            onClick={() => setIsBioModalOpen(true)}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Fingerprint className="w-4 h-4" /> Open Fingerprint Scanner
          </button>
        </div>
      </div>

      <FingerprintScannerModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        memberName="Customer Verification"
        onScanComplete={handleScanComplete}
      />
    </div>
  );
};

export default DistributorDashboard;
