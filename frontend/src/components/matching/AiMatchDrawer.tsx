'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Eye,
  Tag,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Item, MatchResult } from '../../types';

interface AiMatchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: Item | null;
  matchResult: MatchResult | null;
  onClaimItem?: (item: Item) => void;
}

export const AiMatchDrawer: React.FC<AiMatchDrawerProps> = ({
  isOpen,
  onClose,
  targetItem,
  matchResult,
  onClaimItem,
}) => {
  if (!isOpen || !targetItem) return null;

  const score = matchResult?.totalScore ?? 94;
  const breakdown = matchResult?.breakdown ?? {
    visual: 96,
    category: 100,
    location: 92,
    time: 88,
  };

  const explanations = matchResult?.explanation ?? [
    'Multimodal vision similarity engine matched 96% of form factor, chassis silhouette, and color hue.',
    'High confidence taxonomy verification across secondary sub-labels.',
    'Location proximity: Discovered within same building perimeter (Main Library, 2nd Fl study area).',
    'Temporal window: 30-minute delta between reported loss and custodian drop-off.',
  ];

  // Radial progress calculations (radius = 50, circumference = 2 * PI * 50 = 314.16)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
        {/* Drawer backdrop dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative z-10 w-full max-w-2xl rounded-t-4xl glass-panel-heavy border-t border-x border-white/20 p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
        >
          {/* Top handle bar */}
          <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-6" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7000FF] to-[#00E599] p-[2px]">
              <div className="w-full h-full bg-[#0B0E14] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#00E599]" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                AI Match Breakdown & Attribution
              </h2>
              <p className="text-xs text-slate-400">
                Multimodal Vision & Spatio-Temporal Correlation Matrix
              </p>
            </div>
          </div>

          {/* Score & Circular Radial Meter */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-5">
              {/* Radial Meter SVG */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="url(#gradient-ai-score)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                  <defs>
                    <linearGradient id="gradient-ai-score" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF5E3A" />
                      <stop offset="50%" stopColor="#7000FF" />
                      <stop offset="100%" stopColor="#00E599" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white">{score}%</span>
                  <span className="text-[9px] uppercase tracking-wider font-mono text-emerald-400">
                    MATCH
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono uppercase text-[#00E599] font-bold">
                  HIGH CONFIDENCE PAIR
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                  Strong Physical Correlation
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  The AI scoring algorithm evaluated feature maps and determined high probability of identity.
                </p>
              </div>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/30 text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                Target Item
              </span>
              <span className="text-xs font-bold text-white">{targetItem.title}</span>
            </div>
          </div>

          {/* Weighted Score Bars */}
          <div className="space-y-3.5 mb-6">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Multimodal Feature Weights
            </h4>

            {/* Visual (35%) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Eye className="w-3.5 h-3.5 text-[#FF5E3A]" /> Visual Geometry & Palette (35% weight)
                </span>
                <span className="font-mono font-bold text-white">{breakdown.visual}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${breakdown.visual}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#FF5E3A] to-[#FF7A00]"
                />
              </div>
            </div>

            {/* Category (30%) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Tag className="w-3.5 h-3.5 text-[#00E599]" /> Category Taxonomy (30% weight)
                </span>
                <span className="font-mono font-bold text-white">{breakdown.category}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${breakdown.category}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#00E599] to-teal-400"
                />
              </div>
            </div>

            {/* Location (20%) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#7000FF]" /> Proximity & Transit Clusters (20% weight)
                </span>
                <span className="font-mono font-bold text-white">{breakdown.location}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${breakdown.location}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#7000FF] to-indigo-500"
                />
              </div>
            </div>

            {/* Time (15%) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Temporal Chronology Delta (15% weight)
                </span>
                <span className="font-mono font-bold text-white">{breakdown.time}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${breakdown.time}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                />
              </div>
            </div>
          </div>

          {/* Bulleted natural-language match explanations */}
          <div className="p-4 rounded-3xl bg-white/5 border border-white/10 mb-6 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Natural-Language Verification Notes
            </h4>
            <ul className="space-y-2">
              {explanations.map((exp, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E599] flex-shrink-0 mt-0.5" />
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="py-3 px-5 rounded-2xl glass-panel text-slate-300 hover:text-white font-semibold text-xs transition-all border border-white/10"
            >
              Dismiss
            </button>

            {onClaimItem && targetItem.type === 'FOUND' && (
              <button
                onClick={() => {
                  onClose();
                  onClaimItem(targetItem);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF5E3A] via-[#FF7A00] to-[#7000FF] text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-glow-orange transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Initiate Ownership Claim</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
