'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Sparkles, CheckCircle, ThumbsUp } from 'lucide-react';

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
      }, 1600);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          className="relative w-full max-w-md rounded-4xl glass-panel-heavy border border-white/20 p-6 sm:p-8 text-center shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="py-8 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Thank You for Your Feedback!</h3>
              <p className="text-xs text-slate-300">
                Your rating helps improve campus recovery algorithms and Good Samaritan recognition.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5E3A] to-[#FFB800] p-[2px] mx-auto">
                <div className="w-full h-full bg-[#0B0E14] rounded-2xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">Rate Your Recovery Experience</h3>
                <p className="text-xs text-slate-400 mt-1">
                  How smooth was the AI verification & contactless handover process?
                </p>
              </div>

              {/* 1-5 Star Selection */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        (hoverRating !== null ? star <= hoverRating : star <= rating)
                          ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Optional comments on item condition or depot staff experience..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00E599]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00E599] to-teal-400 text-slate-950 font-black text-sm hover:brightness-110 shadow-glow-emerald transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit Recovery Feedback'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
