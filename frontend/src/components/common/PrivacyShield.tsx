'use client';

import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
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
  fallbackText = 'Zero-Exposure Shielded',
}) => {
  const isAuthorized =
    userRole === 'SECURITY' || userRole === 'ADMIN' || claimStatus === 'APPROVED';

  if (!value || value === 'REDACTED' || value === 'N/A') {
    return (
      <div className="p-3.5 rounded-apple-md apple-glass">
        <span className="text-[10px] tracking-wider uppercase text-slate-400 font-mono block mb-1">
          {label}
        </span>
        <span className="text-xs text-slate-500 font-mono">None logged / Redacted</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-apple-md apple-glass p-3.5 transition-all">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
          {label}
        </span>
        {isAuthorized ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-telemetry-emerald bg-telemetry-emerald/10 px-2 py-0.5 rounded-full border border-telemetry-emerald/20">
            <ShieldCheck className="w-3 h-3" /> Unmasked (Staff/Claimant)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-tesla-crimson bg-tesla-crimson/10 px-2 py-0.5 rounded-full border border-tesla-crimson/20">
            <Lock className="w-3 h-3" /> Shield Active
          </span>
        )}
      </div>

      <div className="relative">
        <div
          className={`font-mono text-xs transition-all duration-300 ${
            !isAuthorized ? 'filter blur-md select-none opacity-25' : 'filter-none opacity-100 text-white dark:text-white'
          }`}
        >
          {value}
        </div>

        {!isAuthorized && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 backdrop-blur-md rounded-lg px-2">
            <Lock className="w-3.5 h-3.5 text-tesla-crimson" />
            <span className="text-[11px] font-medium text-slate-300">
              {fallbackText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
