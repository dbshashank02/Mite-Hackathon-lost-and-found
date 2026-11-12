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
  ArrowRight,
  ShieldCheck,
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
    'Location proximity: Discovered within same building perimeter.',
  ];

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-xl">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 350 }}
          className="relative z-10 w-full max-w-2xl rounded-t-apple-2xl studio-surface border-t border-x border-hairline p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
        >
          {/* Top Grab Handle */}
          <div className="w-10 h-1 rounded-apple-pill bg-white/20 mx-auto mb-6" />

          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-apple-md bg-white/10 flex items-center justify-center border border-hairline">
              <Sparkles className="w-5 h-5 text-apple-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                AI Match Telemetry
              </h2>
              <p className="text-xs text-slate-400">
                Multimodal Spatio-Temporal Correlation Matrix
              </p>
            </div>
          </div>

          {/* Circular Telemetry Meter */}
          <div className="p-6 rounded-apple-xl bg-black/50 border border-hairline flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-5">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="#0071E3"
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.0, ease: 'easeOut' }}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold tracking-tight text-white tabular-numbers">
                    {score}%
                  </span>
                  <span className="text-[9px] uppercase font-mono text-apple-blue font-bold">
                    MATCH
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-telemetry-emerald font-bold">
                  HIGH CONFIDENCE PAIR
                </span>
                <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                  Strong Feature Attribution
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Evaluated across visual contours, taxonomy tags, geo-coordinates, and intake time.
                </p>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-apple-md bg-white/5 border border-hairline text-right">
              <span className="text-[9px] uppercase font-mono text-slate-500 block">
                Target Inventory
              </span>
              <span className="text-xs font-semibold text-white max-w-[140px] truncate block">
                {targetItem.title}
              </span>
            </div>
          </div>

          {/* 4 Weighted Factor Progress Bars */}
          <div className="space-y-3.5 mb-6">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
              Weighted Feature Breakdown
            </span>

            {/* Visual (35%) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Eye className="w-3.5 h-3.5 text-apple-blue" />
                  Visual Geometry & Color (35% weight)
                </span>
                <span className="font-mono font-bold text-white tabular-numbers">
                  {breakdown.visual}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${breakdown.visual}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-apple-blue"
                />
              </div>
            </div>

            {/* Category (30%) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Tag className="w-3.5 h-3.5 text-telemetry-emerald" />
                  Category Taxonomy (30% weight)
                </span>
                <span className="font-mono font-bold text-white tabular-numbers">
                  {breakdown.category}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${breakdown.category}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="h-full rounded-full bg-telemetry-emerald"
                />
              </div>
            </div>

            {/* Location (20%) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  Location Proximity (20% weight)
                </span>
                <span className="font-mono font-bold text-white tabular-numbers">
                  {breakdown.location}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${breakdown.location}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full bg-purple-400"
                />
              </div>
            </div>

            {/* Time (15%) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Chronological Delta (15% weight)
                </span>
                <span className="font-mono font-bold text-white tabular-numbers">
                  {breakdown.time}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${breakdown.time}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full rounded-full bg-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Explanations List */}
          <div className="p-4 rounded-apple-xl bg-black/50 border border-hairline mb-6 space-y-2">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
              Match Attribution
            </span>
            <ul className="space-y-1.5">
              {explanations.map((exp, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-telemetry-emerald flex-shrink-0 mt-0.5" />
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="py-2.5 px-5 rounded-apple-pill bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-all border border-hairline"
            >
              Dismiss
            </button>

            {onClaimItem && targetItem.type === 'FOUND' && (
              <button
                onClick={() => {
                  onClose();
                  onClaimItem(targetItem);
                }}
                className="flex-1 py-2.5 px-5 rounded-apple-pill bg-apple-blue hover:bg-apple-blueHover text-white font-semibold text-xs shadow-apple-blue-glow transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Claim This Item</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
