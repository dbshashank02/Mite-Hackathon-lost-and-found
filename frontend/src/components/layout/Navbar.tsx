'use client';

import React from 'react';
import { User, UserRole } from '../../types';
import { ThemeToggle } from '../common/ThemeToggle';
import { ShieldCheck, Sparkles, UserCheck, Activity } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onOpenReportModal: () => void;
  onOpenGatekeeper: () => void;
  onRoleChange: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenReportModal,
  onOpenGatekeeper,
  onRoleChange,
}) => {
  const roles: UserRole[] = ['STUDENT', 'FINDER', 'SECURITY', 'ADMIN'];

  return (
    <header className="sticky top-0 z-50 w-full h-12 apple-header px-4 sm:px-8 flex items-center justify-between transition-colors">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        {/* Apple Wordmark + Live Telemetry Status Pulse */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white p-0.5 shadow-sm border border-hairline flex items-center justify-center flex-shrink-0">
              <img src="/logo-icon.png" alt="MITERetrieve Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white flex items-center">
              <span>MITE</span>
              <span className="text-[#FF4A36]">Retrieve</span>
              <span className="text-slate-400 font-normal text-xs ml-0.5">.com</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-apple-pill bg-white/5 border border-hairline text-[10px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-telemetry-emerald animate-pulse" />
            <span>DEPOT ONLINE</span>
          </div>
        </div>


        {/* Right Actions: Gatekeeper Profile + Theme */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenGatekeeper}
            className="flex items-center gap-2 px-2.5 py-1 rounded-apple-pill bg-white/5 border border-hairline hover:bg-white/10 text-xs transition-all"
            title="Institutional Gatekeeper Auth"
          >
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold">
              {currentUser.handle.charAt(0)}
            </div>
            <span className="hidden sm:inline font-medium text-slate-200 text-xs">
              {currentUser.handle.split(' ')[0]}
            </span>
            <span className="text-[10px] font-mono uppercase text-apple-blue font-bold">
              {currentUser.role}
            </span>
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
