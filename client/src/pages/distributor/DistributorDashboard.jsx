import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { Terminal, Boxes, Calendar, ShieldCheck, ArrowRight, Package } from 'lucide-react';

const DistributorDashboard = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/distributor/stock')
      .then((res) => setShop(res.data.shop))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">Fair Price Shop Portal</h1>
          <p className="text-xs text-slate-400">FPS Shop: <span className="text-blue-400 font-bold">{shop?.shopName || 'Janata Fair Price Shop #42'}</span></p>
        </div>

        <Link
          to="/distributor/epos"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
        >
          <Terminal className="w-4 h-4" /> Open e-POS Terminal →
        </Link>
      </div>

      {/* Stock Cards Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Boxes className="w-4 h-4 text-emerald-400" />
          Current Available Stock Inventory
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shop?.stockAvailability?.map((s) => (
            <div key={s.item} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 block">{s.item}</span>
              <span className="text-xl font-extrabold font-mono text-slate-100">{s.quantityKg} <span className="text-xs text-slate-500 font-normal">{s.unit}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <Calendar className="w-6 h-6 text-indigo-400" />
          <h3 className="text-base font-bold text-slate-100">Expected Slot Bookings Today</h3>
          <p className="text-xs text-slate-400">View upcoming consumer slot bookings to manage shop queue and inventory readiness.</p>
          <Link to="/distributor/slots" className="text-xs font-bold text-indigo-400 hover:underline inline-block pt-1">
            View Today's Bookings →
          </Link>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <Boxes className="w-6 h-6 text-emerald-400" />
          <h3 className="text-base font-bold text-slate-100">Stock Inventory Management</h3>
          <p className="text-xs text-slate-400">Inspect allotted stock from government depot and update shop availability.</p>
          <Link to="/distributor/stock" className="text-xs font-bold text-emerald-400 hover:underline inline-block pt-1">
            Manage Stock Inventory →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DistributorDashboard;
