import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  scanConsumerCard, 
  verifyFingerprint, 
  dispenseRation, 
  generateReceipt, 
  resetEposState, 
  setEposStep 
} from '../../redux/slices/eposSlice';
import { 
  Terminal, 
  CreditCard, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Package, 
  QrCode, 
  ShoppingBag,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import QRReceiptModal from '../../components/QRReceiptModal';
import API from '../../services/api';

const EposTerminal = () => {
  const dispatch = useDispatch();
  const { currentStep, scanData, entitlement, bioVerification, dispenseData, receiptData, loading, error } = useSelector((state) => state.epos);

  const [inputCardNo, setInputCardNo] = useState('RC100200300');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [sampleBioHash, setSampleBioHash] = useState('FINGERPRINT_MATCH_APPROVED');
  const [selectedItems, setSelectedItems] = useState({}); // { 'Rice': 15, 'Wheat': 5 }
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Step 1: Scan Card
  const handleScan = (e) => {
    e.preventDefault();
    dispatch(scanConsumerCard(inputCardNo));
  };

  // Step 2: Biometric Check
  const handleVerifyFingerprint = () => {
    if (!scanData?.consumer?.id) return;
    dispatch(verifyFingerprint({
      consumerId: scanData.consumer.id,
      memberId: selectedMemberId || scanData.familyMembers[0]?.id,
      fingerprintHash: sampleBioHash
    }));
  };

  // Item quantity input change
  const handleQtyChange = (item, qty, maxQty) => {
    const val = Math.min(maxQty, Math.max(0, Number(qty)));
    setSelectedItems((prev) => ({ ...prev, [item]: val }));
  };

  // Step 3: Dispense & Trigger Payment
  const handleDispenseAndPay = async () => {
    const itemsArray = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([item, quantity]) => ({ item, quantity }));

    if (itemsArray.length === 0) {
      alert('Please select at least one item quantity to dispense.');
      return;
    }

    const res = await dispatch(dispenseRation({
      consumerId: scanData.consumer.id,
      selectedItems: itemsArray,
      verificationId: bioVerification?.verificationId
    }));

    if (dispenseRation.fulfilled.match(res)) {
      const tx = res.payload.transaction;
      // Generate QR receipt
      const receiptRes = await dispatch(generateReceipt(tx._id));
      if (generateReceipt.fulfilled.match(receiptRes)) {
        setIsReceiptModalOpen(true);
      }
    }
  };

  const handleReset = () => {
    dispatch(resetEposState());
    setInputCardNo('RC100200300');
    setSelectedItems({});
    setIsReceiptModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Terminal className="w-6 h-6 text-blue-400" />
            Fair Price Shop e-POS Terminal Simulator
          </h1>
          <p className="text-xs text-slate-400">Guided distribution state machine mimicking physical device hardware</p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Terminal
        </button>
      </div>

      {/* Step Indicator Bar */}
      <div className="grid grid-cols-5 gap-1.5 p-1.5 glass-panel rounded-2xl border border-slate-800 text-center text-xs font-bold">
        <div className={`py-2 rounded-xl transition-all ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
          1. Scan ID
        </div>
        <div className={`py-2 rounded-xl transition-all ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
          2. Biometric
        </div>
        <div className={`py-2 rounded-xl transition-all ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
          3. Quota
        </div>
        <div className={`py-2 rounded-xl transition-all ${currentStep >= 4 ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
          4. Payment
        </div>
        <div className={`py-2 rounded-xl transition-all ${currentStep >= 5 ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>
          5. Receipt
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* STEP 1: Scan Ration Card */}
      {currentStep === 1 && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Step 1: Scan / Enter Ration Card ID</h3>
            <p className="text-xs text-slate-400">Simulate barcode/QR scan or enter 10-digit Ration Card Number</p>
          </div>

          <form onSubmit={handleScan} className="max-w-md mx-auto space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Ration Card Number</label>
              <input
                type="text"
                required
                placeholder="e.g. RC100200300"
                value={inputCardNo}
                onChange={(e) => setInputCardNo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono tracking-wider focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Scanning Registry...' : 'Simulate Scan & Verify Card'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: Biometric Fingerprint Check */}
      {currentStep === 2 && scanData && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto animate-pulse">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Step 2: Biometric Fingerprint Check</h3>
            <p className="text-xs text-slate-400">Academic Prototype: Simulates matching against stored template hash</p>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 max-w-lg mx-auto text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Head of Household:</span>
              <span className="font-bold text-slate-100">{scanData.consumer.headName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ration Card Type:</span>
              <span className="font-mono text-amber-400 font-bold">{scanData.consumer.rationCardType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Family Members:</span>
              <span className="font-semibold text-slate-200">{scanData.familyMembers.length} Members Listed</span>
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Select Member Placing Fingerprint</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none"
              >
                {scanData.familyMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relation}) — Aadhaar: {m.aadhaarMasked}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleVerifyFingerprint}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-4 h-4" />
              {loading ? 'Authenticating Biometrics...' : 'Scan & Verify Fingerprint (Match Hash)'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 & 4: Quota Selection & Dispense */}
      {(currentStep === 3 || currentStep === 4) && scanData && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                Step 3 & 4: Quota Verification & Item Dispense
              </h3>
              <p className="text-xs text-slate-400">Card Type: <span className="font-bold text-amber-400">{scanData.consumer.rationCardType}</span> • Biometric Verification Passed</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              BIO_MATCH_PASSED
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Monthly Entitlement & Selected Quantities:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entitlement.map((item) => (
                <div key={item.item} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-100">{item.item}</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {item.pricePerKg === 0 ? 'FREE (₹0/kg)' : `₹${item.pricePerKg}/${item.unit}`}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex justify-between font-mono">
                    <span>Monthly Quota: {item.totalQty} {item.unit}</span>
                    <span>Remaining: {item.remainingQty} {item.unit}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-300 font-semibold">Dispense Qty ({item.unit}):</label>
                    <input
                      type="number"
                      min="0"
                      max={item.remainingQty}
                      value={selectedItems[item.item] || ''}
                      onChange={(e) => handleQtyChange(item.item, e.target.value, item.remainingQty)}
                      placeholder={`Max ${item.remainingQty}`}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono text-right focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleDispenseAndPay}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            {loading ? 'Processing e-POS Dispense & Razorpay Sandbox...' : 'Dispense Ration & Generate QR Receipt'}
          </button>
        </div>
      )}

      {/* QR Receipt Modal */}
      <QRReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={handleReset}
        receiptData={receiptData}
      />
    </div>
  );
};

export default EposTerminal;
