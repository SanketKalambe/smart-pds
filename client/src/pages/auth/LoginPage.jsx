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
    if (e) e.preventDefault();
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

  // One-click quick login handler
  const handleQuickFill = async (type) => {
    dispatch(clearAuthError());
    let payload = {};
    if (type === 'admin') {
      setLoginType('email');
      setEmail('admin@rationsetu.gov.in');
      setPassword('Admin@123');
      payload = { email: 'admin@rationsetu.gov.in', password: 'Admin@123' };
    } else if (type === 'distributor') {
      setLoginType('email');
      setEmail('distributor@example.com');
      setPassword('Distributor@123');
      payload = { email: 'distributor@example.com', password: 'Distributor@123' };
    } else if (type === 'consumer') {
      setLoginType('ration');
      setRationCardNo('RC100200300');
      setPassword('Consumer@123');
      payload = { rationCardNo: 'RC100200300', password: 'Consumer@123' };
    }

    const result = await dispatch(loginUser(payload));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'distributor') navigate('/distributor');
      else navigate('/consumer');
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 font-['Outfit']">Sign In to RationSetu</h2>
          <p className="text-xs text-slate-400">Access Government Admin, Distributor or Digital Ration Book</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Type Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLoginType('email')}
            className={`py-2 rounded-lg transition-all ${
              loginType === 'email' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Email Address
          </button>
          <button
            type="button"
            onClick={() => setLoginType('ration')}
            className={`py-2 rounded-lg transition-all ${
              loginType === 'ration' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ration Card No.
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {loginType === 'email' ? (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@rationsetu.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Ration Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. RC100200300"
                  value={rationCardNo}
                  onChange={(e) => setRationCardNo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
                <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Cards */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> One-Click Quick Demo Sign In:
          </span>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-amber-300 font-bold transition-all text-center"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('distributor')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-purple-500/20 border border-slate-800 hover:border-purple-500/40 text-purple-300 font-bold transition-all text-center"
            >
              FPS Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('consumer')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-blue-500/20 border border-slate-800 hover:border-blue-500/40 text-blue-300 font-bold transition-all text-center"
            >
              Consumer Demo
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-xs text-slate-400">
          <span>Need a new account? </span>
          <Link to="/register/consumer" className="text-blue-400 font-semibold hover:underline">
            Register Card (Consumer)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
