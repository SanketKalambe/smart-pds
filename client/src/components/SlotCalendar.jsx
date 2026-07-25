import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableSlots, bookTimeSlot } from '../redux/slices/slotSlice';

const SlotCalendar = ({ assignedShop }) => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const { slots, loading, error, successMessage } = useSelector((state) => state.slots);

  useEffect(() => {
    if (assignedShop?._id || assignedShop?.id) {
      dispatch(fetchAvailableSlots({ shopId: assignedShop._id || assignedShop.id, date: selectedDate }));
    }
  }, [dispatch, assignedShop, selectedDate]);

  const handleBook = (slot) => {
    if (slot.availableSpots <= 0) return;
    dispatch(bookTimeSlot({
      slotDayId: slot.id,
      date: selectedDate,
      timeSlot: slot.timeSlot
    }));
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            Distribution Date & Slot Booking
          </h2>
          <p className="text-xs text-slate-400">
            Book a guaranteed time slot at <span className="text-blue-400 font-semibold">{assignedShop?.shopName || 'Assigned Fair Price Shop'}</span>
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Slots Grid */}
      {loading ? (
        <div className="text-center py-10 text-slate-400 text-xs animate-pulse">
          Fetching live slot capacity from shop server...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {slots.map((slot) => {
            const isFull = slot.availableSpots <= 0;
            const fillPercentage = Math.round((slot.bookedCount / slot.capacity) * 100);

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-xl border transition-all glass-card space-y-3 ${
                  isFull 
                    ? 'border-slate-800 bg-slate-900/40 opacity-75' 
                    : 'border-slate-700/60 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    {slot.timeSlot}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isFull 
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {isFull ? 'FULL' : 'OPEN'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      Capacity
                    </span>
                    <span className="text-slate-200 font-mono">
                      {slot.bookedCount}/{slot.capacity} booked
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        fillPercentage >= 100 ? 'bg-rose-500' : fillPercentage > 75 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, fillPercentage)}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isFull}
                  onClick={() => handleBook(slot)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                    isFull
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 active:scale-95'
                  }`}
                >
                  {isFull ? 'Slot Capacity Full' : 'Book This Slot'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SlotCalendar;
