import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { allocateStock } from '../../redux/slices/adminSlice';
import API from '../../services/api';
import { Boxes, CheckCircle2, AlertCircle } from 'lucide-react';

const StockAllocation = () => {
  const dispatch = useDispatch();
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [item, setItem] = useState('Rice');
  const [quantityKg, setQuantityKg] = useState('500');
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/admin/distributors').then((res) => {
      if (res.data.distributors) {
        const activeShops = res.data.distributors
          .filter(d => d.shop)
          .map(d => d.shop);
        setShops(activeShops);
        if (activeShops.length > 0) setSelectedShopId(activeShops[0].id);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await dispatch(allocateStock({ shopId: selectedShopId, monthYear, item, quantityKg }));
    setLoading(false);
    if (allocateStock.fulfilled.match(res)) {
      setMessage(`Successfully allocated ${quantityKg} kg of ${item} to shop!`);
    } else {
      setMessage(res.payload || 'Allocation failed.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">Monthly Stock Allocation</h1>
        <p className="text-xs text-slate-400">Allocate monthly grain and essential quota to Fair Price Shops</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Select Target Fair Price Shop</label>
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none"
            >
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shopName} ({s.shopCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Commodity Item</label>
              <select
                value={item}
                onChange={(e) => setItem(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none"
              >
                <option value="Rice">Rice (White Grain)</option>
                <option value="Wheat">Wheat (Whole Grain)</option>
                <option value="Sugar">Sugar (Refined)</option>
                <option value="Kerosene">Kerosene (L)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Month & Year</label>
              <input
                type="month"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Quantity to Allocate (kg or L)</label>
            <input
              type="number"
              required
              min="10"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
          >
            <Boxes className="w-4 h-4" />
            {loading ? 'Dispatching Stock...' : 'Confirm Stock Allocation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StockAllocation;
