import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Boxes, CheckCircle2 } from 'lucide-react';

const DistributorStock = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchStock = async () => {
    try {
      const res = await API.get('/distributor/stock');
      setStock(res.data.stockAvailability || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.patch('/distributor/stock', { items: stock });
      setMessage('Stock levels updated successfully!');
      fetchStock();
    } catch (e) {
      setMessage('Failed to update stock.');
    }
  };

  const handleChange = (index, value) => {
    const updated = [...stock];
    updated[index].quantityKg = Number(value);
    setStock(updated);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">Shop Stock Inventory</h1>
        <p className="text-xs text-slate-400">View and update current stock levels at your Fair Price Shop</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-3">
            {stock.map((item, index) => (
              <div key={item.item} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-200">{item.item} ({item.unit})</span>
                <input
                  type="number"
                  min="0"
                  value={item.quantityKg}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="w-32 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono text-right focus:outline-none"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/25 transition-all"
          >
            Update Inventory Levels
          </button>
        </form>
      </div>
    </div>
  );
};

export default DistributorStock;
