import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Terminal, BookOpen, Calendar, ArrowRight, Sparkles, UserCheck, Lock } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="space-y-16 py-10 px-4 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-blue-500/30 text-blue-400 text-xs font-bold shadow-lg shadow-blue-500/10 animate-bounce">
          <Sparkles className="w-4 h-4" />
          Next-Gen e-POS Integrated Public Distribution System
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight font-['Outfit']">
          Transparent, Digital & Secure <br />
          <span className="gradient-text">Ration Distribution for Every Household</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
          Smart PDS connects Government Administrators, Fair Price Shop Distributors, and Beneficiary Consumers into a single transparent digital ecosystem featuring Digital Ration Books, Slot Reservations, and Biometric e-POS terminals.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-105 flex items-center gap-2"
          >
            Access Platform Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register/consumer"
            className="px-6 py-3 rounded-xl glass-panel border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-sm transition-all"
          >
            Register Ration Card
          </Link>
        </div>
      </div>

      {/* Role Portal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admin Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-blue-500/40 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Government Admin</h3>
            <p className="text-xs text-slate-400 mt-1">
              KYC verification queue, monthly stock allocation, helpline settings, and system-wide distribution analytics.
            </p>
          </div>
          <Link
            to="/login?role=admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors pt-2"
          >
            Admin Portal Login →
          </Link>
        </div>

        {/* Distributor Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">FPS Distributor (e-POS)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Run guided e-POS distribution workflow: Ration card scan → Biometric verification → Quota dispense → QR Receipt.
            </p>
          </div>
          <Link
            to="/login?role=distributor"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors pt-2"
          >
            Distributor Login →
          </Link>
        </div>

        {/* Consumer Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-teal-500/40 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Consumer (Ration Card)</h3>
            <p className="text-xs text-slate-400 mt-1">
              View Digital Ration Book, manage family member details, reserve date/time slots, and file assisted complaints.
            </p>
          </div>
          <Link
            to="/login?role=consumer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors pt-2"
          >
            Consumer Login →
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">Built for Trust & Governance</h2>
          <p className="text-xs text-slate-400">Academic prototype demonstrating field-level security and atomic state management.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <Lock className="w-5 h-5 text-blue-400" />
            <h4 className="text-sm font-bold text-slate-200">AES-256 Encryption</h4>
            <p className="text-xs text-slate-400">Field-level Aadhaar encryption at rest; only masked values (`XXXX XXXX 1234`) ever returned.</p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-slate-200">Atomic Slot Guard</h4>
            <p className="text-xs text-slate-400">Race-condition proof MongoDB capacity limits (e.g. 30 spots) preventing overbooking.</p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-slate-200">e-POS Simulator</h4>
            <p className="text-xs text-slate-400">Self-contained state machine mimicking physical hardware biometric verification & QR generation.</p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-bold text-slate-200">Assisted Chatbot</h4>
            <p className="text-xs text-slate-400">Keyword & NLP suggestion engine automatically classifying grievance categories.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
