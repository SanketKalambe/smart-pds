import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminReports } from '../../redux/slices/adminSlice';
import { Users, Building2, UserCheck, Package, AlertCircle, PhoneCall, TrendingUp, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { reports, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminReports());
  }, [dispatch]);

  const stats = reports?.stats || {};
  const chartData = reports?.distributionVolume || [
    { _id: 'Rice', totalQuantity: 515, totalRevenue: 0 },
    { _id: 'Wheat', totalQuantity: 355, totalRevenue: 0 },
    { _id: 'Sugar', totalQuantity: 100, totalRevenue: 1350 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">Government Admin Overview</h1>
        <p className="text-xs text-slate-400">Central PDS Governance, KYC Verification & Distribution Analytics</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Beneficiary Consumers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">{stats.totalConsumers || 0}</div>
          <span className="text-[11px] text-slate-500">Registered Household Cards</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Pending KYC Queue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">{stats.pendingKycCount || 0}</div>
          <Link to="/admin/verification-queue" className="text-[11px] font-bold text-blue-400 hover:underline">
            Review Queue →
          </Link>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Fair Price Shops</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">{stats.totalShops || 0}</div>
          <span className="text-[11px] text-slate-500">Onboarded Distributors</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Open Complaints</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-400">{stats.openComplaints || 0}</div>
          <Link to="/admin/complaints" className="text-[11px] font-bold text-rose-400 hover:underline">
            Manage Grievances →
          </Link>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Monthly Ration Distribution Volume (kg/L)
            </h3>
            <p className="text-xs text-slate-400">Itemized breakdown of ration commodities distributed through e-POS</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            Live e-POS Ledger
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="totalQuantity" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Distributed (kg/L)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
