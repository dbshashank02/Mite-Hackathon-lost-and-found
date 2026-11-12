'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  XCircle,
  FileQuestion,
  CheckCircle,
  Lock,
  AlertTriangle,
  QrCode,
  ArrowRight,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { Claim, Item, UserRole } from '../../types';

interface ClaimsQueueViewProps {
  claims: Claim[];
  items: Item[];
  onReviewClaim: (claimId: string, action: 'APPROVE' | 'REQUEST_EVIDENCE' | 'DENY', lockerId?: string) => Promise<void>;
  onOpenHandoverPass: (claim: Claim) => void;
  userRole: UserRole;
}

export const ClaimsQueueView: React.FC<ClaimsQueueViewProps> = ({
  claims,
  items,
  onReviewClaim,
  onOpenHandoverPass,
  userRole,
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(
    claims.length > 0 ? claims[0].id : null
  );
  const [assignedLocker, setAssignedLocker] = useState('DEPOT-LK-14B');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const activeClaim = claims.find((c) => c.id === selectedClaimId) || claims[0];
  const activeItem = activeClaim ? items.find((i) => i.id === activeClaim.itemId) : null;

  const handleAction = async (action: 'APPROVE' | 'REQUEST_EVIDENCE' | 'DENY') => {
    if (!activeClaim) return;
    setProcessingId(activeClaim.id);
    try {
      await onReviewClaim(activeClaim.id, action, assignedLocker);
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" /> APPROVED (QR PASS READY)
          </span>
        );
      case 'EVIDENCE_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            <FileQuestion className="w-3 h-3" /> EVIDENCE REQUIRED
          </span>
        );
      case 'DENIED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
            <XCircle className="w-3 h-3" /> REJECTED / FRAUD
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/30">
            <ShieldAlert className="w-3 h-3" /> PENDING REVIEW
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6 pb-24">
      {/* Top Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Security Staff Verification Queue
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
              AUDITED VAULT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Side-by-side inspection of physical Depot inventory against claimant distinguishing marks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Total Claims:</span>
          <span className="px-2.5 py-1 rounded-full bg-white/10 text-white font-mono text-xs font-bold">
            {claims.length}
          </span>
        </div>
      </div>

      {claims.length === 0 ? (
        <div className="py-16 text-center rounded-3xl glass-panel border border-white/10">
          <Layers className="w-10 h-10 mx-auto text-slate-500 mb-2 opacity-50" />
          <p className="text-slate-400 text-sm">No ownership claims pending review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Claims List Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
              Active Claims
            </h3>
            {claims.map((claim) => {
              const item = items.find((i) => i.id === claim.itemId);
              const isSelected = activeClaim?.id === claim.id;

              return (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`p-4 rounded-3xl glass-panel border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#FF5E3A] bg-white/10 shadow-glow-orange/20'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      #{claim.id}
                    </span>
                    {statusBadge(claim.status)}
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">
                    {item?.title || 'Unknown Item'}
                  </h4>

                  <p className="text-xs text-slate-300 line-clamp-2 italic mb-2">
                    &quot;{claim.secretAnswer}&quot;
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/10">
                    <span>Claimant: {claim.claimantId}</span>
                    <span>{new Date(claim.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side-by-Side Review Column */}
          {activeClaim && (
            <div className="lg:col-span-2 space-y-5">
              <div className="glass-panel-heavy p-6 sm:p-8 rounded-4xl border border-white/15 space-y-6 shadow-2xl">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#00E599] font-bold">
                      INSPECTION DOSSIER
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      Verification for Claim #{activeClaim.id}
                    </h3>
                  </div>
                  <div>{statusBadge(activeClaim.status)}</div>
                </div>

                {/* Fraud Flag Badges */}
                {activeClaim.fraudFlags.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Automated Fraud Guard Alerts</span>
                    </div>
                    <ul className="text-xs text-amber-200/90 space-y-1 pl-5 list-disc">
                      {activeClaim.fraudFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Side-by-Side Comparison Container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: Depot Item Logged Details */}
                  <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Physical Depot Inventory Log
                    </span>
                    {activeItem && (
                      <>
                        <div className="h-36 rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                          <img
                            src={activeItem.imageUrl}
                            alt="Item"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {activeItem.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {activeItem.category} • {activeItem.brand} • {activeItem.color}
                          </span>
                        </div>
                        {/* Hidden traits known to Depot */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
                          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                            Depot Private Record:
                          </span>
                          <span className="text-slate-200 font-mono text-[11px]">
                            {activeItem.sensitive.privateTraits}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right: Claimant Provided Answer & Proof */}
                  <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF5E3A] font-bold block">
                      Claimant Submitted Evidence
                    </span>
                    {activeClaim.proofImageUrl ? (
                      <div className="h-36 rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                        <img
                          src={activeClaim.proofImageUrl}
                          alt="Proof"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-36 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-slate-500 italic">
                        No image uploaded
                      </div>
                    )}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                        Claimant Secret Answer:
                      </span>
                      <span className="text-slate-200 font-mono text-[11px]">
                        &quot;{activeClaim.secretAnswer}&quot;
                      </span>
                    </div>
                  </div>
                </div>

                {/* Locker Assignment Input */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Assign Depot Vault Locker
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Will be revealed to student upon authorization
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={assignedLocker}
                    onChange={(e) => setAssignedLocker(e.target.value)}
                    placeholder="e.g. DEPOT-LK-14B"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-white font-mono text-xs w-full sm:w-44 focus:outline-none focus:border-[#00E599]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
                  <button
                    onClick={() => handleAction('APPROVE')}
                    disabled={processingId !== null}
                    className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E599] to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 hover:brightness-110 shadow-glow-emerald transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>APPROVE (GENERATE QR)</span>
                  </button>

                  <button
                    onClick={() => handleAction('REQUEST_EVIDENCE')}
                    disabled={processingId !== null}
                    className="py-3 px-4 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <FileQuestion className="w-4 h-4" />
                    <span>REQUEST EVIDENCE</span>
                  </button>

                  <button
                    onClick={() => handleAction('DENY')}
                    disabled={processingId !== null}
                    className="py-3 px-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>DENY CLAIM</span>
                  </button>
                </div>

                {/* View QR Pass shortcut if approved */}
                {activeClaim.status === 'APPROVED' && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Handover Pass Active: OTP {activeClaim.otpCode}
                        </span>
                        <span className="text-[10px] text-emerald-300 font-mono">
                          Token: {activeClaim.qrToken}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenHandoverPass(activeClaim)}
                      className="px-3 py-1.5 rounded-xl bg-[#00E599] text-slate-950 font-bold text-xs flex items-center gap-1 hover:brightness-110 shadow-sm"
                    >
                      <span>Open Handover Pass</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
