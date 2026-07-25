import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDigitalRationBook } from '../../redux/slices/rationBookSlice';
import StatusBadge from '../../components/StatusBadge';
import { History, Package, QrCode } from 'lucide-react';

const ConsumerHistoryPage = () => {
  const dispatch = useDispatch();
  const { bookData, loading } = useSelector((state) => state.rationBook);

  useEffect(() => {
    dispatch(fetchDigitalRationBook());
  }, [dispatch]);

  if (loading || !bookData) {
    return <div className="text-center py-10 text-slate-400 text-xs animate-pulse">Loading Transaction History...</div>;
  }

  const { transactionHistory = [] } = bookData;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">Digital Ration Book Ledger</h1>
        <p className="text-xs text-slate-400">Historical log of all ration distribution transactions & digital receipts</p>
      </div>

      {transactionHistory.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">No distribution history recorded yet.</div>
      ) : (
        <div className="space-y-4">
          {transactionHistory.map((tx) => (
            <div key={tx._id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{tx.shop?.shopName || 'Fair Price Shop'}</h3>
                  <span className="text-xs text-slate-400 font-mono">Tx ID: {tx._id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={tx.paymentStatus} />
                  <span className="text-xs font-mono text-slate-300">{new Date(tx.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">Items Distributed:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {tx.itemsDistributed.map((it, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
                      <span className="text-slate-200">{it.item} ({it.quantity} {it.unit})</span>
                      <span className="font-mono text-emerald-400">₹{it.cost.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-slate-400">Biometric Audit: <span className="text-emerald-400 font-mono font-bold">PASSED</span></span>
                <span className="font-bold text-slate-100 text-sm">Total Paid: <span className="text-emerald-400 font-mono">₹{tx.totalAmount.toFixed(2)}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsumerHistoryPage;
