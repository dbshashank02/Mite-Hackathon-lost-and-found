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
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-telemetry-emerald bg-telemetry-emerald/10 px-2.5 py-0.5 rounded-apple-pill border border-telemetry-emerald/30">
            <CheckCircle className="w-3 h-3" /> APPROVED (PASS READY)
          </span>
        );
      case 'EVIDENCE_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-apple-pill border border-amber-500/30">
            <FileQuestion className="w-3 h-3" /> EVIDENCE REQUIRED
          </span>
        );
      case 'DENIED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-tesla-crimson bg-tesla-crimson/10 px-2.5 py-0.5 rounded-apple-pill border border-tesla-crimson/30">
            <XCircle className="w-3 h-3" /> REJECTED / FRAUD
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-apple-blue bg-apple-blue/10 px-2.5 py-0.5 rounded-apple-pill border border-apple-blue/30">
            <ShieldAlert className="w-3 h-3" /> PENDING REVIEW
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6 pb-28">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-apple-xl studio-surface border border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Security Staff Verification Queue
            </h2>
            <span className="px-2 py-0.5 rounded-apple-pill text-[10px] font-mono text-apple-blue bg-apple-blue/10 border border-apple-blue/20">
              AUDITED VAULT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Split-screen verification: Depot inventory record vs claimant submitted evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Total Claims:</span>
          <span className="px-2.5 py-0.5 rounded-apple-pill bg-white/10 text-white font-mono text-xs font-bold">
            {claims.length}
          </span>
        </div>
      </div>

      {claims.length === 0 ? (
        <div className="py-16 text-center rounded-apple-xl apple-glass">
          <Layers className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-50" />
          <p className="text-slate-400 text-xs">No pending ownership claims in the queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Claims List Column */}
          <div className="lg:col-span-4 space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block px-1">
              Active Claims
            </span>
            {claims.map((claim) => {
              const item = items.find((i) => i.id === claim.itemId);
              const isSelected = activeClaim?.id === claim.id;

              return (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`p-4 rounded-apple-lg studio-surface border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-apple-blue shadow-apple-blue-glow'
                      : 'border-hairline hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400">#{claim.id}</span>
                    {statusBadge(claim.status)}
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {item?.title || 'Unknown Item'}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 italic">
                    &quot;{claim.secretAnswer}&quot;
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 mt-2 border-t border-hairline">
                    <span>{claim.claimantId}</span>
                    <span>{new Date(claim.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Split-Screen Side-by-Side Review Column */}
          {activeClaim && (
            <div className="lg:col-span-8 space-y-5">
              <div className="p-6 sm:p-8 rounded-apple-2xl studio-surface border border-hairline space-y-6 shadow-2xl">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-hairline">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-apple-blue font-bold">
                      VERIFICATION DOSSIER
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Review for Claim #{activeClaim.id}
                    </h3>
                  </div>
                  <div>{statusBadge(activeClaim.status)}</div>
                </div>

                {/* Fraud Flag Badges */}
                {activeClaim.fraudFlags.length > 0 && (
                  <div className="p-3.5 rounded-apple-md bg-black/60 border border-hairline space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Fraud Guard Alerts</span>
                    </div>
                    <ul className="text-xs text-amber-200/90 space-y-1 pl-4 list-disc font-mono">
                      {activeClaim.fraudFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Split-Screen Side-by-Side Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: Depot Inventory Log */}
                  <div className="p-4 rounded-apple-xl bg-black/50 border border-hairline space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Physical Depot Inventory
                    </span>
                    {activeItem && (
                      <>
                        <div className="h-36 rounded-apple-md overflow-hidden bg-slate-900 border border-hairline">
                          <img
                            src={activeItem.imageUrl}
                            alt="Item"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            {activeItem.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {activeItem.category} • {activeItem.brand} • {activeItem.color}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-apple-sm bg-black/70 border border-hairline text-xs">
                          <span className="text-[9px] font-mono text-telemetry-emerald uppercase font-bold block">
                            Depot Private Record:
                          </span>
                          <span className="text-slate-300 font-mono text-[11px]">
                            {activeItem.sensitive.privateTraits}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right: Claimant Evidence */}
                  <div className="p-4 rounded-apple-xl bg-black/50 border border-hairline space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-apple-blue font-bold block">
                      Claimant Submitted Evidence
                    </span>
                    {activeClaim.proofImageUrl ? (
                      <div className="h-36 rounded-apple-md overflow-hidden bg-slate-900 border border-hairline">
                        <img
                          src={activeClaim.proofImageUrl}
                          alt="Proof"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-36 rounded-apple-md bg-white/5 border border-hairline flex items-center justify-center text-xs text-slate-500 italic">
                        No image uploaded
                      </div>
                    )}
                    <div className="p-2.5 rounded-apple-sm bg-black/70 border border-hairline text-xs">
                      <span className="text-[9px] font-mono text-amber-400 uppercase font-bold block">
                        Claimant Secret Answer:
                      </span>
                      <span className="text-slate-300 font-mono text-[11px]">
                        &quot;{activeClaim.secretAnswer}&quot;
                      </span>
                    </div>
                  </div>
                </div>

                {/* Locker Assignment */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-apple-md bg-black/50 border border-hairline">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-telemetry-emerald" />
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        Assign Vault Locker
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Dispatched to claimant pass upon approval
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={assignedLocker}
                    onChange={(e) => setAssignedLocker(e.target.value)}
                    placeholder="DEPOT-LK-14B"
                    className="px-3 py-1.5 rounded-apple-md bg-slate-900 border border-hairline text-white font-mono text-xs w-full sm:w-44 focus:outline-none focus:border-apple-blue"
                  />
                </div>

                {/* 1-Tap Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-hairline">
                  <button
                    onClick={() => handleAction('APPROVE')}
                    disabled={processingId !== null}
                    className="py-2.5 px-4 rounded-apple-pill bg-white text-black font-semibold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-telemetry-emerald" />
                    <span>Approve (Gen QR)</span>
                  </button>

                  <button
                    onClick={() => handleAction('REQUEST_EVIDENCE')}
                    disabled={processingId !== null}
                    className="py-2.5 px-4 rounded-apple-pill bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-hairline transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileQuestion className="w-4 h-4 text-amber-400" />
                    <span>Request Evidence</span>
                  </button>

                  <button
                    onClick={() => handleAction('DENY')}
                    disabled={processingId !== null}
                    className="py-2.5 px-4 rounded-apple-pill bg-tesla-crimson/20 hover:bg-tesla-crimson/30 text-tesla-crimson border border-tesla-crimson/40 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Deny Claim</span>
                  </button>
                </div>

                {/* QR Pass shortcut if approved */}
                {activeClaim.status === 'APPROVED' && (
                  <div className="p-3.5 rounded-apple-md bg-black/60 border border-hairline flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-telemetry-emerald" />
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          Pass Active: OTP {activeClaim.otpCode}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {activeClaim.qrToken}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenHandoverPass(activeClaim)}
                      className="px-3.5 py-1.5 rounded-apple-pill bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1"
                    >
                      <span>View Pass</span>
                      <ArrowRight className="w-3 h-3" />
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
