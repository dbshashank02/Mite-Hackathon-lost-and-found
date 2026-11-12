'use client';

import React from 'react';
import { User, UserRole } from '../../types';
import { ThemeToggle } from '../common/ThemeToggle';
import { ShieldCheck, Sparkles, PlusCircle, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onOpenReportModal: () => void;
  onOpenGatekeeper: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenReportModal,
  onOpenGatekeeper,
}) => {
  const roleBadgeColors: Record<UserRole, string> = {
    STUDENT: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    FINDER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    SECURITY: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    ADMIN: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 backdrop-blur-xl bg-slate-900/60 dark:bg-[#0B0E14]/75 border-b border-slate-200/50 dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5E3A] via-[#7000FF] to-[#00E599] p-[1.5px] shadow-glow-orange/20">
            <div className="w-full h-full bg-[#0B0E14] rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-transparent bg-clip-text bg-gradient-to-tr from-[#FF5E3A] to-[#00E599]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-slate-900 dark:text-white">
                FindIt<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5E3A] to-[#00E599]">Campus</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                AI Vision 3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Intelligent Lost & Found Ecosystem
            </p>
          </div>
        </div>

        {/* Right actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Report CTA */}
          <button
            onClick={onOpenReportModal}
            className="group relative inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#FF5E3A] via-[#FF7A00] to-[#7000FF] hover:brightness-110 shadow-glow-orange active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span className="hidden xs:inline">Report Item</span>
            <span className="xs:hidden">Report</span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Active User Pill */}
          <button
            onClick={onOpenGatekeeper}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl glass-panel hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10"
            title="Click to switch Gatekeeper Persona"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#7000FF] to-[#00E599] flex items-center justify-center text-white text-xs font-bold shadow-inner">
              {currentUser.handle.charAt(0)}
            </div>
            <div className="text-left hidden md:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                  {currentUser.handle}
                </span>
                {currentUser.verifiedBadge && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[9px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.2 rounded border ${roleBadgeColors[currentUser.role]}`}
                >
                  {currentUser.role}
                </span>
              </div>
            </div>
            <UserCheck className="w-3.5 h-3.5 text-slate-400 md:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
};
