'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string | null;
  onSubmitFeedback: (data: { claimId: string; rating: number; comment: string }) => Promise<void>;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  claimId,
  onSubmitFeedback,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !claimId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitFeedback({
        claimId,
        rating,
        comment,
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-apple-2xl studio-surface border border-hairline p-6 sm:p-8 text-center shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {submitted ? (
            <div className="py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-telemetry-emerald/20 text-telemetry-emerald flex items-center justify-center mx-auto border border-telemetry-emerald/30">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Recovery Verified</h3>
              <p className="text-xs text-slate-400">
                Your feedback enhances the campus spatio-temporal matching network.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="w-10 h-10 rounded-apple-md bg-white/10 flex items-center justify-center mx-auto border border-hairline">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Rate Recovery Experience</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Handover experience for claim ref: {claimId}
                </p>
              </div>

              <div className="flex items-center justify-center gap-1.5 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        (hoverRating !== null ? star <= hoverRating : star <= rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional comments regarding item condition or depot staff..."
                className="w-full px-3.5 py-2 rounded-apple-md bg-white/5 border border-hairline text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-apple-blue"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-apple-pill bg-white text-black font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-all shadow-sm"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
