'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  X,
  Mail,
  Lock,
  ArrowRight,
  GraduationCap,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Building,
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { DEMO_USERS } from '../../lib/mockData';

interface CampusGatekeeperProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onLogin: (email: string, role: UserRole) => void;
}

export const CampusGatekeeper: React.FC<CampusGatekeeperProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your university credentials');
      return;
    }
    if (!email.toLowerCase().endsWith('.edu')) {
      setError('Strict Security Enforcement: Only institutional @university.edu accounts permitted.');
      return;
    }
    setError(null);
    onLogin(email, role);
    onClose();
  };

  const handleQuickLogin = (quickRole: UserRole) => {
    const demo = DEMO_USERS[quickRole];
    onLogin(demo.email, quickRole);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-lg rounded-4xl glass-panel-heavy p-6 sm:p-8 shadow-2xl border border-white/15 overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#FF5E3A]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#7000FF]/25 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5E3A] via-[#7000FF] to-[#00E599] p-[2px]">
              <div className="w-full h-full bg-[#0B0E14] rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#00E599]" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Campus Gatekeeper Auth
              </h2>
              <p className="text-xs text-slate-400">
                Institutional SSO & Role-Based Custody Permissions
              </p>
            </div>
          </div>

          {/* Fast 1-Click Role Login Badges */}
          <div className="mb-6">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1-Click Role Login Badges (Hackathon Presets)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('STUDENT')}
                className="p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">Student Claimant</span>
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">alex.rivera@university.edu</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('FINDER')}
                className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">Finder / Samaritan</span>
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">priya.sharma@university.edu</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('SECURITY')}
                className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Depot Security Staff</span>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">dan.vance@university.edu</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-3 rounded-2xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-300">Campus Administration</span>
                  <Building className="w-4 h-4 text-violet-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">elena.rostova@university.edu</p>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-white/10" />
            <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-500 uppercase">
              Or Authenticate with Custom Email
            </span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          {/* Custom Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                University Email Address (.edu required)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#00E599] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Role Assignment
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['STUDENT', 'FINDER', 'SECURITY', 'ADMIN'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                      role === r
                        ? 'bg-[#00E599] text-slate-950 shadow-glow-emerald font-bold'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#FF5E3A] via-[#7000FF] to-[#00E599] text-white font-bold text-sm hover:brightness-110 shadow-glow-orange transition-all"
            >
              <span>Authenticate & Enter Campus Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
