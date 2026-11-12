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
  Copy,
  Check,
  Archive,
  AlertCircle,
  Sparkles,
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
  const approvedClaims = claims.filter((c) => c.status === 'APPROVED');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(
    activeClaim?.id || (approvedClaims.length > 0 ? approvedClaims[0].id : null)
  );

  const currentClaim = claims.find((c) => c.id === selectedClaimId) || approvedClaims[0] || claims[0];
  const currentItem = currentClaim ? items.find((i) => i.id === currentClaim.itemId) : null;

  const [manualOtp, setManualOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string; item?: Item } | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(14399);

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

  const handleManualVerify = async (e?: React.FormEvent) => {
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
    <div className="w-full space-y-6 pb-28 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-apple-xl studio-surface border border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Contactless Handover & Apple Wallet Pass
            </h2>
            <span className="px-2 py-0.5 rounded-apple-pill text-[10px] font-mono text-telemetry-emerald bg-telemetry-emerald/10 border border-telemetry-emerald/20">
              ZERO PHYSICAL CONTACT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographic proof-of-claim for physical custody transfer at Campus Security.
          </p>
        </div>

        {approvedClaims.length > 1 && (
          <select
            value={currentClaim?.id}
            onChange={(e) => setSelectedClaimId(e.target.value)}
            className="px-3 py-1.5 rounded-apple-md bg-slate-900 border border-hairline text-white text-xs font-mono"
          >
            {approvedClaims.map((c) => (
              <option key={c.id} value={c.id}>
                Pass #{c.id} ({c.status})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Apple Wallet-Style Pass Card */}
        <div className="relative rounded-[28px] bg-[#1E1F30] border border-[#2F314C] p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-[#00D084]" />
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#00D084]">
              CAMPUS SECURITY GATEPASS
            </span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white mb-0.5">
            {currentItem?.title || 'Approved Campus Property'}
          </h3>
          <p className="text-xs font-mono text-slate-400 mb-6">
            REF #{currentClaim?.id || 'CLM-ACTIVE'}
          </p>

          {/* Precision QR Code Container */}
          <div className="p-4 rounded-2xl bg-white shadow-2xl mb-6">
            <QRCodeSVG
              value={currentClaim?.qrToken || 'FINDIT-CAMPUS-PASS-2026'}
              size={170}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* 6-Digit Tabular OTP */}
          <div className="w-full mb-5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-2">
              6-Digit Handover Code
            </span>
            <div className="flex items-center justify-center gap-2">
              {(currentClaim?.otpCode || '849201').split('').map((digit, i) => (
                <div
                  key={i}
                  className="w-10 h-12 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-xl font-mono font-bold text-white tabular-numbers shadow-inner"
                >
                  {digit}
                </div>
              ))}
              <button
                onClick={handleCopyOtp}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all ml-1"
                title="Copy OTP"
              >
                {copied ? <Check className="w-4 h-4 text-[#00D084]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Ticking Countdown Timer */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-mono mb-4">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span className="tabular-numbers">Expires in: {formatTime(timeLeft)}</span>
          </div>

          {/* Vault Locker Allocation */}
          <div className="w-full p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Vault Location:</span>
            <span className="font-mono font-bold text-[#00D084]">
              {currentItem?.lockerId || 'DEPOT-LK-14B'}
            </span>
          </div>
        </div>

        {/* Security Terminal Handover Station */}
        <div className="p-6 sm:p-8 rounded-[28px] bg-[#1E1F30] border border-[#2F314C] space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF4A36]/10 flex items-center justify-center border border-[#FF4A36]/20">
              <KeyRound className="w-5 h-5 text-[#FF4A36]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Security Scanner Station
              </h3>
              <p className="text-xs text-slate-400">
                Authenticate claimant presence before physical release
              </p>
            </div>
          </div>

          {/* 1-Tap Scanner Shortcut */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
            <span className="text-xs font-bold text-white block">
              Optical Barcode Scanner Simulation
            </span>
            <p className="text-xs text-slate-400">
              Reads active encrypted token from claimant pass card.
            </p>
            <button
              type="button"
              onClick={handleInstantScanVerify}
              disabled={verifying}
              className="w-full py-2.5 px-4 rounded-full bg-[#FF4A36] hover:bg-[#FF5C47] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-[#FF4A36]/25"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{verifying ? 'Verifying with Vault...' : 'Scan Pass & Confirm Handover'}</span>
            </button>
          </div>

          {/* Manual OTP Form */}
          <form onSubmit={handleManualVerify} className="space-y-3">
            <label className="text-[10px] uppercase font-mono text-slate-400 block">
              Manual 6-Digit OTP Entry
            </label>
            <input
              type="text"
              maxLength={6}
              value={manualOtp}
              onChange={(e) => setManualOtp(e.target.value)}
              placeholder="e.g. 849201"
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-[#FF4A36]"
            />
            <button
              type="submit"
              disabled={verifying || !manualOtp}
              className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all border border-white/10 disabled:opacity-40"
            >
              Verify OTP
            </button>
          </form>

          {/* Result Alert */}
          {verifyResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-3.5 rounded-apple-md border flex items-start gap-3 ${
                verifyResult.success
                  ? 'bg-telemetry-emerald/10 border-telemetry-emerald/30 text-telemetry-emerald'
                  : 'bg-tesla-crimson/10 border-tesla-crimson/30 text-tesla-crimson'
              }`}
            >
              {verifyResult.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <span className="font-bold block text-white mb-0.5">
                  {verifyResult.success ? 'Handover Complete' : 'Verification Rejected'}
                </span>
                <span>{verifyResult.message}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
