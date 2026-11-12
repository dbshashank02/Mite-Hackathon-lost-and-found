'use client';

import React from 'react';
import { Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { UserRole, ClaimStatus } from '../../types';

interface PrivacyShieldProps {
  label: string;
  value?: string;
  userRole: UserRole;
  claimStatus?: ClaimStatus;
  fallbackText?: string;
}

export const PrivacyShield: React.FC<PrivacyShieldProps> = ({
  label,
  value,
  userRole,
  claimStatus,
  fallbackText = 'Private Data Masked',
}) => {
  const isAuthorized =
    userRole === 'SECURITY' || userRole === 'ADMIN' || claimStatus === 'APPROVED';

  const [revealed, setRevealed] = React.useState(false);

  if (!value || value === 'REDACTED' || value === 'N/A') {
    return (
      <div className="text-xs text-slate-400 dark:text-slate-500 italic">
        {label}: <span className="font-mono">None logged</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-3 text-xs transition-all">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
          {label}
        </span>
        {isAuthorized ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" /> Staff / Claimant Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3" /> Shield Active
          </span>
        )}
      </div>

      <div className="relative font-mono text-sm">
        {/* Actual Content */}
        <div
          className={`transition-all duration-300 ${
            !isAuthorized && !revealed ? 'filter blur-md select-none opacity-40' : 'filter-none opacity-100'
          }`}
        >
          {value}
        </div>

        {/* Shield Overlay if not authorized */}
        {!isAuthorized && !revealed && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-100/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg px-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <span className="font-sans text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {fallbackText}
            </span>
          </div>
        )}
      </div>

      {!isAuthorized && (
        <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <span>Protected under Campus Privacy Policy. Revealed upon security claim approval.</span>
        </div>
      )}
    </div>
  );
};
