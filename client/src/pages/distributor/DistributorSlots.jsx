import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { Calendar, Clock, Phone, User } from 'lucide-react';

const DistributorSlots = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/distributor/slots?date=${date}`);
      setBookings(res.data.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [date]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">Expected Slot Bookings</h1>
          <p className="text-xs text-slate-400">Consumers scheduled to visit shop for ration distribution</p>
        </div>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400 text-xs animate-pulse">Fetching scheduled slot bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">No bookings scheduled for this date.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b) => (
            <div key={b.bookingId} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> {b.timeSlot}
                </span>
                <StatusBadge status={b.status} />
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Consumer Name:</span>
                  <span className="font-semibold text-slate-200">{b.consumerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ration Card No:</span>
                  <span className="font-mono text-blue-400 font-bold">{b.rationCardNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ref Code:</span>
                  <span className="font-mono text-slate-300">{b.bookingReference}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DistributorSlots;
