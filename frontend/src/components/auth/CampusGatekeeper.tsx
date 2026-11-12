'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  X,
  Mail,
  ArrowRight,
  Sparkles,
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
      setError('Strict Institutional Security: Only @university.edu accounts permitted.');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-apple-2xl studio-surface border border-hairline p-6 sm:p-8 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-apple-md bg-white/10 flex items-center justify-center border border-hairline">
              <ShieldCheck className="w-5 h-5 text-apple-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Institutional SSO Gatekeeper
              </h2>
              <p className="text-xs text-slate-400">
                Identity & Access Management Policy
              </p>
            </div>
          </div>

          {/* Fast 1-Click Role Login Presets */}
          <div className="mb-6 space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              1-Click Role Presets (Hackathon Mode)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('STUDENT')}
                className="p-3 rounded-apple-md bg-white/5 hover:bg-white/10 border border-hairline text-left transition-all"
              >
                <span className="text-xs font-semibold text-white block">Student Claimant</span>
                <span className="text-[10px] text-slate-400 font-mono truncate block">alex.rivera@university.edu</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('FINDER')}
                className="p-3 rounded-apple-md bg-white/5 hover:bg-white/10 border border-hairline text-left transition-all"
              >
                <span className="text-xs font-semibold text-white block">Finder Samaritan</span>
                <span className="text-[10px] text-slate-400 font-mono truncate block">priya.sharma@university.edu</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('SECURITY')}
                className="p-3 rounded-apple-md bg-white/5 hover:bg-white/10 border border-hairline text-left transition-all"
              >
                <span className="text-xs font-semibold text-white block">Depot Security</span>
                <span className="text-[10px] text-slate-400 font-mono truncate block">dan.vance@university.edu</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-3 rounded-apple-md bg-white/5 hover:bg-white/10 border border-hairline text-left transition-all"
              >
                <span className="text-xs font-semibold text-white block">Administration</span>
                <span className="text-[10px] text-slate-400 font-mono truncate block">elena.rostova@university.edu</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-hairline" />
            <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-500 uppercase">
              Or Custom @university.edu Login
            </span>
            <div className="flex-grow border-t border-hairline" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                University Email Address (.edu)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@university.edu"
                  className="w-full pl-10 pr-4 py-2 rounded-apple-md bg-white/5 border border-hairline text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-apple-blue"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-apple-sm bg-tesla-crimson/10 border border-tesla-crimson/30 text-tesla-crimson text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-apple-pill bg-white text-black font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>Authenticate & Enter Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
