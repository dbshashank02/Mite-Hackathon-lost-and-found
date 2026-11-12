'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Sparkles,
  Shield,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Item, UserRole } from '../../types';
import { CAMPUS_BUILDINGS } from '../../lib/mockData';

interface CardStackCarouselProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
  onOpenMatch: (item: Item) => void;
  userRole: UserRole;
}

export const CardStackCarousel: React.FC<CardStackCarouselProps> = ({
  items,
  onSelectItem,
  onOpenMatch,
  userRole,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!items || items.length === 0) {
    return (
      <div className="w-full py-16 text-center rounded-3xl glass-panel border border-white/10">
        <Layers className="w-10 h-10 mx-auto text-slate-500 mb-2 opacity-50" />
        <p className="text-slate-400 text-sm">No items in the active filter criteria.</p>
      </div>
    );
  }

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const getBuildingName = (id: string) => {
    return CAMPUS_BUILDINGS.find((b) => b.id === id)?.name || id;
  };

  const statusColors: Record<string, string> = {
    REPORTED: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    LOGGED_IN_DEPOT: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    MATCH_SUGGESTED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    CLAIM_PENDING: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    VERIFICATION_APPROVED: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    AWAITING_PICKUP: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    RETURNED: 'bg-green-500/15 text-green-400 border-green-500/30',
    UNCLAIMED_ARCHIVE: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    AUCTION_DONATED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="relative w-full py-6 flex flex-col items-center">
      {/* 3D Stack Container */}
      <div className="relative w-full max-w-md h-[430px] perspective-[1200px] flex items-center justify-center">
        <AnimatePresence initial={false}>
          {items.map((item, index) => {
            // Calculate relative offset from current index
            const offset = (index - currentIndex + items.length) % items.length;
            // Only render top 3 cards in the stack
            if (offset > 2) return null;

            const isCurrent = offset === 0;

            return (
              <motion.div
                key={item.id}
                initial={{ scale: 0.85, y: 40, opacity: 0 }}
                animate={{
                  scale: 1 - offset * 0.07,
                  y: offset * 22,
                  zIndex: 30 - offset,
                  opacity: 1 - offset * 0.22,
                  rotateX: offset * -4,
                }}
                exit={{ scale: 0.8, y: -60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 25 }}
                drag={isCurrent ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset: dragOffset, velocity }) => {
                  const swipe = Math.abs(dragOffset.x) * velocity.x;
                  if (swipe < -10000 || dragOffset.x < -100) {
                    nextCard();
                  } else if (swipe > 10000 || dragOffset.x > 100) {
                    prevCard();
                  }
                }}
                className={`absolute w-full h-full rounded-4xl glass-panel border overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl transition-shadow ${
                  isCurrent
                    ? 'border-white/20 shadow-glow-orange/15 hover:border-[#FF5E3A]/40'
                    : 'border-white/10'
                }`}
              >
                {/* Background image & gradient overlay */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />

                  {/* Floating Metadata Badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
                        item.type === 'LOST'
                          ? 'bg-[#FF5E3A] text-white shadow-glow-orange'
                          : 'bg-[#00E599] text-slate-950 shadow-glow-emerald font-extrabold'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white bg-black/50 backdrop-blur-md border border-white/15">
                      {item.category}
                    </span>
                  </div>

                  {/* Retention Countdown Pill */}
                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      {item.retentionDays}D Retention
                    </span>
                  </div>

                  {/* Animated Dot-Matrix Status Indicator */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md border ${
                        statusColors[item.status] || 'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {/* Dot-matrix style pulse */}
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                      </span>
                      <span>{item.status.replace(/_/g, ' ')}</span>
                    </div>

                    {item.lockerId && (
                      <span className="text-[10px] font-mono text-slate-300 bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                        🔒 {item.lockerId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body Info */}
                <div className="p-5 flex flex-col justify-between h-[190px] bg-white/5 dark:bg-[#0B0E14]/60">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mb-3">
                      <span className="font-semibold text-slate-300">{item.brand}</span>
                      <span>•</span>
                      <span className="capitalize">{item.color}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#00E599] flex-shrink-0" />
                        <span className="truncate">{getBuildingName(item.buildingId)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#FF5E3A] flex-shrink-0" />
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => onSelectItem(item)}
                      className="flex-1 py-2 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Inspect Details</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenMatch(item)}
                      className="py-2 px-3 rounded-2xl bg-gradient-to-r from-[#7000FF] to-[#00E599] text-white text-xs font-bold flex items-center justify-center gap-1 hover:brightness-110 shadow-glow-violet transition-all"
                      title="Run AI Matchmaker"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Match</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Controls & Pagination indicator */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={prevCard}
          aria-label="Previous card"
          className="p-3 rounded-2xl glass-panel text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 border border-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {items.slice(0, Math.min(items.length, 8)).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex
                  ? 'w-6 bg-gradient-to-r from-[#FF5E3A] to-[#00E599]'
                  : 'w-2 bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextCard}
          aria-label="Next card"
          className="p-3 rounded-2xl glass-panel text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 border border-white/10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
