import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { MessageSquare, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState('');

  const fetchComplaints = async () => {
    try {
      const res = await API.get('/consumer/admin/complaints');
      setComplaints(res.data.complaints || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.patch(`/consumer/admin/complaints/${id}`, { status, adminNotes: actionNotes });
      setActionNotes('');
      fetchComplaints();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">Grievance & Complaint Management</h1>
        <p className="text-xs text-slate-400">Review consumer complaints, auto-suggested categories, and resolve issues</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400 text-xs animate-pulse">Loading grievance queue...</div>
      ) : complaints.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">No active complaints filed!</div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">{c.subject}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-slate-400">
                    Consumer: {c.consumerProfile?.headOfHouseholdName || c.consumerProfile?.user?.name} (Ration Card: {c.consumerProfile?.rationCardNo})
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <p>"{c.description}"</p>

                {c.mediaUrls && c.mediaUrls.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {c.mediaUrls.map((url, i) => (
                      <img key={i} src={url} alt="Evidence" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-blue-500/5 p-3 rounded-xl border border-blue-500/20">
                <div>
                  <span className="text-blue-400 font-bold block mb-1">Auto-Suggested Category:</span>
                  <span className="text-slate-200">{c.suggestedCategory}</span>
                </div>
                <div>
                  <span className="text-blue-400 font-bold block mb-1">Recommended Resolution:</span>
                  <span className="text-slate-300">{c.suggestedResolution}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <input
                  type="text"
                  placeholder="Resolution notes / Inspector query update..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full sm:flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleUpdateStatus(c._id, 'in-progress')}
                    className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                  >
                    Mark In-Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(c._id, 'resolved')}
                    className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Resolve Complaint
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
