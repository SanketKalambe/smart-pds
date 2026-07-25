import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateSettings } from '../../redux/slices/adminSlice';
import { Sliders, PhoneCall, Users, CheckCircle2 } from 'lucide-react';

const SystemSettingsPage = () => {
  const dispatch = useDispatch();
  const [helplineNumber, setHelplineNumber] = useState('1800-11-1967');
  const [defaultSlotCapacity, setDefaultSlotCapacity] = useState('30');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await dispatch(updateSettings({ helplineNumber, defaultSlotCapacity }));
    setLoading(false);
    if (updateSettings.fulfilled.match(res)) {
      setMessage('System settings updated successfully! Helpline & capacity updated across all portals.');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">System Settings</h1>
        <p className="text-xs text-slate-400">Configure global helpline support number & default slot capacity</p>
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
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              National PDS Helpline Number (Displayed to Consumers)
            </label>
            <input
              type="text"
              required
              value={helplineNumber}
              onChange={(e) => setHelplineNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Default Time Slot Capacity (Per Shop / Hour Slot)
            </label>
            <input
              type="number"
              required
              min="5"
              max="200"
              value={defaultSlotCapacity}
              onChange={(e) => setDefaultSlotCapacity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Enforces atomic MongoDB capacity limit (e.g. 30 spots)</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            {loading ? 'Updating Settings...' : 'Save System Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
