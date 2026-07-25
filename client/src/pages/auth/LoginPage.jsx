import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearAuthError } from '../../redux/slices/authSlice';
import { KeyRound, Mail, CreditCard, ShieldCheck, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [loginType, setLoginType] = useState('email'); // 'email' or 'ration'
  const [email, setEmail] = useState('');
  const [rationCardNo, setRationCardNo] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    const payload = loginType === 'email' ? { email, password } : { rationCardNo, password };
    const result = await dispatch(loginUser(payload));

    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'distributor') navigate('/distributor');
      else navigate('/consumer');
    }
  };

  // Demo account quick fill
  const handleQuickFill = (type) => {
    dispatch(clearAuthError());
    if (type === 'admin') {
      setLoginType('email');
      setEmail('admin@smartpds.gov.in');
      setPassword('Admin@123');
    } else if (type === 'distributor') {
      setLoginType('email');
      setEmail('distributor@example.com');
      setPassword('Distributor@123');
    } else if (type === 'consumer') {
      setLoginType('ration');
      setRationCardNo('RC100200300');
      setPassword('Consumer@123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">Sign In to Smart PDS</h2>
          <p className="text-xs text-slate-400">Access Government Admin, Distributor or Digital Ration Book</p>
        </div>

        {/* Quick Demo Pre-fill Buttons */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> One-Click Viva Demo Logins:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="px-2 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[11px] font-bold border border-blue-500/30 transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('distributor')}
              className="px-2 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[11px] font-bold border border-indigo-500/30 transition-colors"
            >
              Distributor
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('consumer')}
              className="px-2 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-[11px] font-bold border border-teal-500/30 transition-colors"
            >
              Consumer
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setLoginType('email')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              loginType === 'email' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => setLoginType('ration')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              loginType === 'ration' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ration Card ID
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {loginType === 'email' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@smartpds.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Ration Card Number</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="RC100200300"
                  value={rationCardNo}
                  onChange={(e) => setRationCardNo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono tracking-wider"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80 space-y-1">
          <p>Don't have an account?</p>
          <div className="flex justify-center gap-3 font-semibold text-blue-400">
            <Link to="/register/consumer" className="hover:underline">Register Consumer</Link>
            <span>•</span>
            <Link to="/register/distributor" className="hover:underline">Register Distributor</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
