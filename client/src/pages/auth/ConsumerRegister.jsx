import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerConsumer } from '../../redux/slices/authSlice';
import FamilyMemberForm from '../../components/FamilyMemberForm';
import { CreditCard, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';

const ConsumerRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, registrationMessage } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    rationCardNo: '',
    headOfHouseholdName: '',
    address: '',
    assignedShopId: ''
  });

  const [familyMembers, setFamilyMembers] = useState([
    { name: '', relation: 'Self (Head)', dateOfBirth: '', aadhaarNumber: '' }
  ]);

  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  const handleSendOtp = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setOtpMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    try {
      const res = await API.post('/auth/otp/send', { phone: formData.phone });
      setOtpSent(true);
      setOtpMessage(`Simulated OTP [${res.data.otp}] sent to phone. (Use 123456 in demo)`);
    } catch (e) {
      setOtpMessage('Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await API.post('/auth/otp/verify', { phone: formData.phone, otp: otpInput });
      if (res.data.success) {
        setOtpVerified(true);
        setOtpMessage('Mobile phone verified via OTP!');
      }
    } catch (e) {
      setOtpMessage(e.response?.data?.message || 'Invalid OTP.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      setOtpMessage('Please complete Mobile OTP verification before proceeding.');
      return;
    }

    const payload = {
      ...formData,
      name: formData.headOfHouseholdName || formData.name,
      familyMembers
    };

    const result = await dispatch(registerConsumer(payload));
    if (registerConsumer.fulfilled.match(result)) {
      setTimeout(() => {
        navigate('/consumer');
      }, 1500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">Consumer Ration Card Registration</h2>
          <p className="text-xs text-slate-400">Onboard your Household Ration Card & Family Members</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {registrationMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {registrationMessage} Redirecting to Digital Ration Book...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Ration Card Number</label>
              <input
                type="text"
                required
                placeholder="RC100200300"
                value={formData.rationCardNo}
                onChange={(e) => setFormData({ ...formData, rationCardNo: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono tracking-wider"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Validates against Mock PDS Registry</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Head of Household Name</label>
              <input
                type="text"
                required
                placeholder="Ramesh Kumar"
                value={formData.headOfHouseholdName}
                onChange={(e) => setFormData({ ...formData, headOfHouseholdName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="consumer@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Account Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Residential Address (As on Ration Card)</label>
            <input
              type="text"
              required
              placeholder="H.No. 45, Gali No. 3, North Block"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Repeatable Family Members */}
          <FamilyMemberForm
            familyMembers={familyMembers}
            onChange={setFamilyMembers}
          />

          {/* Mobile OTP Verification */}
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-400" /> Mobile OTP Verification
              </span>
              {otpVerified && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  VERIFIED
                </span>
              )}
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                required
                disabled={otpVerified}
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
              />
              <button
                type="button"
                disabled={otpVerified}
                onClick={handleSendOtp}
                className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all disabled:opacity-50"
              >
                Send OTP
              </button>
            </div>

            {otpSent && !otpVerified && (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Enter OTP (e.g. 123456)"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Verify OTP
                </button>
              </div>
            )}

            {otpMessage && (
              <p className="text-[11px] text-amber-400 font-mono">{otpMessage}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xl shadow-teal-600/25 transition-all"
          >
            {loading ? 'Submitting Registration...' : 'Register Consumer Ration Card'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsumerRegister;
