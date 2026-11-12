'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Layers,
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
      <div className="w-full py-16 text-center rounded-apple-xl apple-glass">
        <Layers className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-50" />
        <p className="text-slate-400 text-xs">No catalog items matching filter criteria.</p>
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

  return (
    <div className="relative w-full py-6 flex flex-col items-center">
      <div className="relative w-full max-w-md h-[440px] perspective-[1200px] flex items-center justify-center">
        <AnimatePresence initial={false}>
          {items.map((item, index) => {
            const offset = (index - currentIndex + items.length) % items.length;
            if (offset > 2) return null;
            const isCurrent = offset === 0;

            return (
              <motion.div
                key={item.id}
                initial={{ scale: 0.88, y: 30, opacity: 0 }}
                animate={{
                  scale: 1 - offset * 0.06,
                  y: offset * 20,
                  zIndex: 30 - offset,
                  opacity: 1 - offset * 0.25,
                  rotateX: offset * -3,
                }}
                exit={{ scale: 0.8, y: -50, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                drag={isCurrent ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset: dragOffset, velocity }) => {
                  const swipe = Math.abs(dragOffset.x) * velocity.x;
                  if (swipe < -10000 || dragOffset.x < -80) nextCard();
                  else if (swipe > 10000 || dragOffset.x > 80) prevCard();
                }}
                className={`absolute w-full h-full rounded-apple-2xl studio-surface border overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl transition-all ${
                  isCurrent ? 'border-white/25 shadow-apple-glass' : 'border-hairline'
                }`}
              >
                {/* Visual */}
                <div className="relative h-60 w-full overflow-hidden bg-black/60">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-apple-pill text-xs font-mono font-bold uppercase ${
                        item.type === 'LOST'
                          ? 'bg-tesla-crimson text-white'
                          : 'bg-telemetry-emerald text-black'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-apple-pill text-xs font-mono text-slate-300 bg-black/60 backdrop-blur-md border border-hairline">
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-hairline">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    {item.lockerId && (
                      <span className="text-telemetry-emerald font-bold">
                        🔒 {item.lockerId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col justify-between h-[180px]">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.brand} • <span className="capitalize">{item.color}</span>
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-telemetry-emerald flex-shrink-0" />
                        <span className="truncate">{getBuildingName(item.buildingId)}</span>
                      </span>
                      <span className="font-mono text-[11px] flex items-center gap-1 flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-hairline">
                    <button
                      onClick={() => onSelectItem(item)}
                      className="flex-1 py-2 rounded-apple-pill bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onOpenMatch(item)}
                      className="px-4 py-2 rounded-apple-pill bg-apple-blue hover:bg-apple-blueHover text-white text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AI Match</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={prevCard}
          aria-label="Previous"
          className="p-2.5 rounded-full border border-hairline bg-white/5 hover:bg-white/15 text-slate-300 transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {items.slice(0, Math.min(items.length, 8)).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-slate-600'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextCard}
          aria-label="Next"
          className="p-2.5 rounded-full border border-hairline bg-white/5 hover:bg-white/15 text-slate-300 transition-all active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
