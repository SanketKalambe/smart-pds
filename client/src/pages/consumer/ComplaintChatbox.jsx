import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getComplaintSuggestion, 
  submitComplaint, 
  fetchConsumerComplaints 
} from '../../redux/slices/complaintSlice';
import { MessageSquare, Sparkles, Send, Paperclip, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const ComplaintChatbox = () => {
  const dispatch = useDispatch();
  const { complaints, suggestion, loading } = useSelector((state) => state.complaints);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchConsumerComplaints());
  }, [dispatch]);

  // Live typing trigger for auto-suggestions
  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);
    if (val.length > 5) {
      dispatch(getComplaintSuggestion({ text: val, subject }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const formData = new FormData();
    formData.append('subject', subject || 'PDS Grievance');
    formData.append('description', description);
    
    if (mediaFiles && mediaFiles.length > 0) {
      for (let i = 0; i < mediaFiles.length; i++) {
        formData.append('media', mediaFiles[i]);
      }
    }

    const res = await dispatch(submitComplaint(formData));
    if (submitComplaint.fulfilled.match(res)) {
      setSubject('');
      setDescription('');
      setMediaFiles([]);
      setMessage('Complaint submitted successfully!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">Assisted Complaint Chatbox</h1>
        <p className="text-xs text-slate-400">File grievances with live auto-categorization suggestions and media evidence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat / Filing Form */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            File New Grievance
          </h3>

          {message && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Subject / Issue Summary</label>
              <input
                type="text"
                required
                placeholder="e.g. Short quantity / Damaged rice stock"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Detailed Description</label>
              <textarea
                required
                rows={4}
                placeholder="Describe your issue (e.g., Rice bag received was 2 kg short of entitlement...)"
                value={description}
                onChange={handleDescriptionChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Live Auto-Suggestion Box */}
            {suggestion && (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-1.5 animate-fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Auto-Detected Category: {suggestion.category}
                </div>
                <p className="text-[11px] text-slate-300">
                  <span className="font-semibold text-slate-400">Suggested Action:</span> {suggestion.resolution}
                </p>
              </div>
            )}

            {/* Media Upload */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Attach Photo/Video Evidence (Optional)</label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => setMediaFiles(Array.from(e.target.files))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting Complaint...' : 'Submit Grievance Ticket'}
            </button>
          </form>
        </div>

        {/* Recent Tickets List */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Your Submitted Complaints</h3>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {complaints.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No complaints filed yet.</p>
            ) : (
              complaints.map((c) => (
                <div key={c._id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-100">{c.subject}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">"{c.description}"</p>
                  <span className="text-[10px] text-blue-400 font-semibold block">Category: {c.suggestedCategory}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintChatbox;
