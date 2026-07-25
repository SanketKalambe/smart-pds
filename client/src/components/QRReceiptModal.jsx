import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import Modal from './Modal';

const QRReceiptModal = ({ isOpen, onClose, receiptData }) => {
  if (!receiptData) return null;

  const { receiptNumber, qrImageUrl, transaction } = receiptData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official e-POS Digital Ration Receipt" maxWidth="max-w-md">
      <div id="printable-receipt" className="space-y-5 text-slate-200">
        <div className="text-center space-y-1 pb-4 border-b border-slate-800">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Transaction Verified & Completed
          </div>
          <h2 className="text-lg font-bold text-slate-100 mt-2">Smart Public Distribution System</h2>
          <p className="text-[11px] text-slate-400">Department of Food & Public Distribution</p>
          <p className="text-xs font-mono text-blue-400 font-bold">Receipt No: {receiptNumber}</p>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white text-slate-900 shadow-inner space-y-2">
          {qrImageUrl ? (
            <img src={qrImageUrl} alt="Receipt QR Code" className="w-40 h-40 object-contain" />
          ) : (
            <QRCodeSVG value={receiptNumber || 'MOCK_VERIFIED_RECEIPT'} size={150} />
          )}
          <span className="text-[10px] font-mono font-bold text-slate-600 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Scan QR code to verify on Government PDS Portal
          </span>
        </div>

        {/* Transaction Summary */}
        {transaction && (
          <div className="space-y-3 text-xs bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Shop Name:</span>
              <span className="font-semibold text-slate-200">{transaction.shop?.shopName || 'Fair Price Shop'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Date & Time:</span>
              <span className="font-mono text-slate-200">{new Date(transaction.timestamp).toLocaleString()}</span>
            </div>

            <div className="pt-2">
              <span className="font-bold text-slate-300 block mb-2">Distributed Items:</span>
              <div className="space-y-1.5">
                {transaction.itemsDistributed?.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="text-slate-300">{it.item} ({it.quantity} {it.unit})</span>
                    <span className="font-mono text-slate-200">₹{it.cost.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t border-slate-700 text-sm font-bold text-slate-100">
              <span>Total Amount Paid:</span>
              <span className="text-emerald-400 font-mono">₹{transaction.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/20"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default QRReceiptModal;
