'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldAlert,
  Upload,
  Lock,
  Sparkles,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Item, UserRole } from '../../types';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: Item | null;
  onSubmitClaim: (data: { itemId: string; secretAnswer: string; proofImageUrl?: string }) => Promise<void>;
  userRole: UserRole;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  onSubmitClaim,
  userRole,
}) => {
  const [secretAnswer, setSecretAnswer] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState(
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !targetItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitClaim({
        itemId: targetItem.id,
        secretAnswer,
        proofImageUrl,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          className="relative w-full max-w-lg rounded-4xl glass-panel-heavy p-6 sm:p-8 shadow-2xl border border-white/15 my-8"
        >
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
                <ShieldAlert className="w-6 h-6 text-[#FF5E3A]" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Submit Ownership Claim
              </h2>
              <p className="text-xs text-slate-400">
                Anti-Fraud Verification for Depot Item ID: {targetItem.id}
              </p>
            </div>
          </div>

          {/* Item Preview Card */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 mb-5">
            <img
              src={targetItem.imageUrl}
              alt={targetItem.title}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">
                {targetItem.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {targetItem.category} • {targetItem.brand} • {targetItem.color}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Private Distinguishing Marks */}
            <div>
              <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Describe Hidden Distinctive Marks / Contents
              </label>
              <p className="text-[11px] text-slate-300 mb-2">
                To prevent fraudulent claims, describe details hidden from public view (e.g., lock screen wallpaper, specific scratches, interior card contents, serial number).
              </p>
              <textarea
                required
                rows={3}
                value={secretAnswer}
                onChange={(e) => setSecretAnswer(e.target.value)}
                placeholder="e.g. There is a sticker of a blue bird on the back, initials AR inside the fold, lockscreen photo with a golden retriever..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-amber-500/30 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* Proof Upload (Receipt / Purchase / Photo) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#00E599]" />
                Proof of Ownership (Receipt, Photo with item, or Serial Log)
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={proofImageUrl}
                  onChange={(e) => setProofImageUrl(e.target.value)}
                  placeholder="Paste URL to receipt or previous photo of item"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500"
                />
                {proofImageUrl && (
                  <div className="h-24 w-full rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                    <img
                      src={proofImageUrl}
                      alt="Proof"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Anti-Fraud Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Filing false claims violates University Code of Conduct. Claims are logged with your student ID and reviewed by Campus Security before OTP generation.
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5E3A] via-[#FF7A00] to-[#7000FF] text-white font-extrabold text-sm hover:brightness-110 shadow-glow-orange transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting to Security Depot...' : 'Submit Claim to Security'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
