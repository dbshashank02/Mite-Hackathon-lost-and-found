'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  Lock,
  Sparkles,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-apple-2xl studio-surface border border-hairline p-6 sm:p-8 shadow-2xl my-8"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="mb-5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-apple-blue font-bold block mb-1">
              ANTI-FRAUD GUARD
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              File Ownership Claim
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Vault Item ID: {targetItem.id}
            </p>
          </div>

          {/* Item Preview */}
          <div className="p-3 rounded-apple-md apple-glass flex items-center gap-3 mb-5">
            <img
              src={targetItem.imageUrl}
              alt={targetItem.title}
              className="w-12 h-12 rounded-apple-sm object-cover"
            />
            <div className="truncate">
              <span className="text-xs font-semibold text-white block truncate">
                {targetItem.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {targetItem.category} • {targetItem.brand} • {targetItem.color}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-300 font-semibold block mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-tesla-crimson" />
                <span>Private Distinguishing Marks / Interior Traits</span>
              </label>
              <textarea
                required
                rows={3}
                value={secretAnswer}
                onChange={(e) => setSecretAnswer(e.target.value)}
                placeholder="e.g. Lock screen photo, specific scratch on right corner, cash denominations inside..."
                className="w-full px-3.5 py-2 rounded-apple-md bg-white/5 border border-hairline text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-apple-blue"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-300 font-semibold block mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-apple-blue" />
                <span>Proof of Ownership Image URL</span>
              </label>
              <input
                type="text"
                value={proofImageUrl}
                onChange={(e) => setProofImageUrl(e.target.value)}
                placeholder="Paste URL to purchase invoice or photo with item..."
                className="w-full px-3.5 py-2 rounded-apple-md bg-white/5 border border-hairline text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-apple-blue"
              />
            </div>

            <div className="p-3 rounded-apple-md bg-black/60 border border-hairline flex items-start gap-2.5 text-[11px] text-slate-400">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Claims are logged with institutional student telemetry. False claims are reviewed by Campus Security.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-apple-pill bg-white text-black font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-apple-blue" />
              <span>{isSubmitting ? 'Verifying with Anti-Fraud Guard...' : 'Submit Claim to Security'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
