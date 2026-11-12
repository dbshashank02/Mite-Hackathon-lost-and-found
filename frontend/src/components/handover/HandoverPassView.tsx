'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  ShieldCheck,
  Clock,
  KeyRound,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Archive,
} from 'lucide-react';
import { Claim, Item, UserRole } from '../../types';

interface HandoverPassViewProps {
  claims: Claim[];
  items: Item[];
  activeClaim: Claim | null;
  onVerifyHandover: (data: { claimId?: string; qrToken?: string; otpCode?: string }) => Promise<{ success: boolean; message: string; item?: Item }>;
  onFeedbackTrigger: (claimId: string) => void;
  userRole: UserRole;
}

export const HandoverPassView: React.FC<HandoverPassViewProps> = ({
  claims,
  items,
  activeClaim,
  onVerifyHandover,
  onFeedbackTrigger,
  userRole,
}) => {
  // Select active claim or fallback to first approved claim
  const approvedClaims = claims.filter((c) => c.status === 'APPROVED');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(
    activeClaim?.id || (approvedClaims.length > 0 ? approvedClaims[0].id : null)
  );

  const currentClaim = claims.find((c) => c.id === selectedClaimId) || approvedClaims[0] || claims[0];
  const currentItem = currentClaim ? items.find((i) => i.id === currentClaim.itemId) : null;

  // Security Verification Input State
  const [manualOtp, setManualOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string; item?: Item } | null>(null);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Countdown timer simulation (4 hours remaining)
  const [timeLeft, setTimeLeft] = useState(14399); // 3h 59m 59s

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyOtp = () => {
    if (currentClaim?.otpCode) {
      navigator.clipboard.writeText(currentClaim.otpCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualOtp.trim()) return;

    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await onVerifyHandover({
        otpCode: manualOtp.trim(),
        claimId: currentClaim?.id,
      });
      setVerifyResult(res);
      if (res.success && currentClaim) {
        setTimeout(() => {
          onFeedbackTrigger(currentClaim.id);
        }, 1800);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleInstantScanVerify = async () => {
    if (!currentClaim) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await onVerifyHandover({
        claimId: currentClaim.id,
        qrToken: currentClaim.qrToken,
        otpCode: currentClaim.otpCode,
      });
      setVerifyResult(res);
      if (res.success) {
        setTimeout(() => {
          onFeedbackTrigger(currentClaim.id);
        }, 1800);
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Contactless QR & 6-Digit OTP Handover Pass
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ZERO PHYSICAL CONTACT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cryptographic proof-of-claim for custody release at the Campus Security Depot.
          </p>
        </div>

        {/* Claim Selector if multiple */}
        {approvedClaims.length > 1 && (
          <select
            value={currentClaim?.id}
            onChange={(e) => setSelectedClaimId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-mono"
          >
            {approvedClaims.map((c) => (
              <option key={c.id} value={c.id}>
                Pass #{c.id} ({c.status})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Claimant Pass Card (Dynamic QR + OTP) */}
        <div className="relative rounded-4xl glass-panel-heavy border border-white/20 p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-0 w-64 h-32 bg-[#00E599]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Pass Status Header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Authenticated Depot Gatepass
            </span>
          </div>

          <h3 className="text-lg font-black text-white mb-1">
            {currentItem?.title || 'Approved Campus Property'}
          </h3>
          <p className="text-xs text-slate-400 font-mono mb-6">
            Claim Ref: #{currentClaim?.id || 'CLM-ACTIVE'}
          </p>

          {/* Dynamic QR Code Canvas */}
          <div className="relative p-5 rounded-3xl bg-white shadow-2xl border-4 border-slate-900 mb-6 group">
            <QRCodeSVG
              value={currentClaim?.qrToken || 'FINDIT-CAMPUS-DEFAULT-PASS-2026'}
              size={180}
              level="H"
              includeMargin={false}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 rounded-2xl">
              <span className="text-[11px] font-mono font-bold text-emerald-400 px-3 py-1 bg-black/80 rounded-full border border-emerald-500/40">
                Encrypted Token
              </span>
            </div>
          </div>

          {/* 6-Digit OTP Block */}
          <div className="w-full mb-6">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-2">
              6-Digit One-Time Handover Code
            </span>
            <div className="flex items-center justify-center gap-2">
              {(currentClaim?.otpCode || '849201').split('').map((digit, i) => (
                <div
                  key={i}
                  className="w-10 h-12 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-center text-xl font-mono font-black text-[#00E599] shadow-inner"
                >
                  {digit}
                </div>
              ))}
              <button
                onClick={handleCopyOtp}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all ml-1"
                title="Copy OTP"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Live Countdown Timer */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono mb-4">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Pass Expires in: {formatTime(timeLeft)}</span>
          </div>

          {/* Locker Vault Location */}
          <div className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Archive className="w-4 h-4 text-indigo-400" />
              <span>Depot Vault Locker:</span>
            </div>
            <span className="font-mono font-bold text-white">
              {currentItem?.lockerId || 'DEPOT-LK-14B'}
            </span>
          </div>
        </div>

        {/* Security Scanner & Handover Verification Column */}
        <div className="space-y-6">
          <div className="rounded-4xl glass-panel-heavy border border-white/20 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5E3A] to-[#7000FF] p-[2px]">
                <div className="w-full h-full bg-[#0B0E14] rounded-2xl flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#FF5E3A]" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Security Terminal Handover Station
                </h3>
                <p className="text-xs text-slate-400">
                  Verify claimant physical presence before custody release
                </p>
              </div>
            </div>

            {/* Quick 1-Tap Handover Simulation */}
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <span className="text-xs font-bold text-white block">
                Instant Scanner Simulation (Demo Shortcut)
              </span>
              <p className="text-xs text-slate-300">
                Emulates security desk bar-code scanner reading the displayed QR pass and active token.
              </p>
              <button
                type="button"
                onClick={handleInstantScanVerify}
                disabled={verifying}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E599] via-teal-400 to-[#7000FF] text-slate-950 font-black text-xs hover:brightness-110 shadow-glow-emerald transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{verifying ? 'Verifying with Vault...' : 'Scan Pass & Confirm Handover'}</span>
              </button>
            </div>

            {/* Manual OTP Input Form */}
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Manual 6-Digit OTP Entry
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={manualOtp}
                  onChange={(e) => setManualOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP (e.g. 849201)"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/20 text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-[#00E599]"
                />
              </div>

              <button
                type="submit"
                disabled={verifying || !manualOtp}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 disabled:opacity-40"
              >
                Verify OTP Manually
              </button>
            </form>

            {/* Verification Result Toast / Banner */}
            {verifyResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  verifyResult.success
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                {verifyResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <span className="font-bold block text-white mb-0.5">
                    {verifyResult.success ? 'Handover Authorized!' : 'Authentication Failed'}
                  </span>
                  <span>{verifyResult.message}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
