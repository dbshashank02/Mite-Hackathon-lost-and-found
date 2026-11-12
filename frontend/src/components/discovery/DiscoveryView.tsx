'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Layers,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  MapPin,
  Calendar,
  Lock,
  ArrowRight,
  Clock,
  Radio,
} from 'lucide-react';
import { Item, ItemCategory, ItemType, UserRole } from '../../types';
import { CardStackCarousel } from './CardStackCarousel';
import { CAMPUS_BUILDINGS } from '../../lib/mockData';

interface DiscoveryViewProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
  onOpenMatch: (item: Item) => void;
  onOpenClaim: (item: Item) => void;
  onOpenReportModal: () => void;
  userRole: UserRole;
  selectedCategory: ItemCategory | 'ALL';
  onSelectCategory: (cat: ItemCategory | 'ALL') => void;
  selectedType: ItemType | 'ALL';
  onSelectType: (type: ItemType | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  items,
  onSelectItem,
  onOpenMatch,
  onOpenClaim,
  onOpenReportModal,
  userRole,
  selectedCategory,
  onSelectCategory,
  selectedType,
  onSelectType,
  searchQuery,
  onSearchChange,
}) => {
  const [viewMode, setViewMode] = useState<'BENTO' | '3D'>('BENTO');
  const [nearMeOnly, setNearMeOnly] = useState(false);

  // Student baseline GPS coords on campus
  const STUDENT_POS = { x: 450, y: 320 };
  const displayItems = nearMeOnly
    ? items.filter((i) => Math.hypot(i.coords.x - STUDENT_POS.x, i.coords.y - STUDENT_POS.y) <= 200)
    : items;

  const categories: (ItemCategory | 'ALL')[] = [
    'ALL',
    'Electronics',
    'Wallets/Bags',
    'Keys',
    'Identification',
    'Apparel',
    'Books',
  ];

  const getBuildingName = (id: string) => {
    return CAMPUS_BUILDINGS.find((b) => b.id === id)?.name || id;
  };

  // Top high-priority found item for Tesla-inspired Hero
  return (
    <div className="w-full space-y-6 pb-20">
      {/* Search, Segmented LOST/FOUND, and Category Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Minimalist Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search catalog by model, brand, or color..."
              className="w-full pl-10 pr-4 py-2 rounded-apple-pill bg-white/5 border border-hairline text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-apple-blue transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {/* Segmented LOST / FOUND Toggle */}
            <div className="flex items-center p-0.5 rounded-apple-pill bg-black/40 dark:bg-white/5 border border-hairline">
              {(['ALL', 'LOST', 'FOUND'] as (ItemType | 'ALL')[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onSelectType(t)}
                  className={`px-3 py-1 rounded-apple-pill text-xs font-medium transition-all ${
                    selectedType === t
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* View Switcher: Bento Grid vs 3D Stack */}
            <div className="flex items-center p-0.5 rounded-apple-pill bg-black/40 dark:bg-white/5 border border-hairline">
              <button
                onClick={() => setViewMode('BENTO')}
                className={`p-1.5 rounded-apple-pill text-xs transition-all ${
                  viewMode === 'BENTO'
                    ? 'bg-white text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Apple Bento Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('3D')}
                className={`p-1.5 rounded-apple-pill text-xs transition-all ${
                  viewMode === '3D'
                    ? 'bg-white text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="3D Spatial Stack"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Horizontal Pills & Near-Me Radar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setNearMeOnly(!nearMeOnly)}
            className={`px-3 py-1.5 rounded-apple-pill text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              nearMeOnly
                ? 'bg-telemetry-emerald text-black border-transparent shadow-sm font-bold'
                : 'bg-white/5 text-slate-300 hover:text-white border-hairline'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${nearMeOnly ? 'animate-pulse text-black' : 'text-telemetry-emerald'}`} />
            <span>Near Me (&lt;200m)</span>
            {nearMeOnly && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-apple-pill bg-black/20">
                {displayItems.length}
              </span>
            )}
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-1.5 rounded-apple-pill text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-white text-black border-transparent font-semibold shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white border-hairline'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Showcase Area: Bento Grid or 3D Showcase */}
      {viewMode === 'BENTO' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group rounded-apple-xl overflow-hidden studio-surface border border-hairline hover:border-white/25 cursor-pointer transition-all duration-300 hover:shadow-apple-glass"
            >
              {/* Product Visual */}
              <div className="relative h-56 w-full overflow-hidden bg-black/60">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Floating Apple Metadata Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-apple-pill text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md ${
                      item.type === 'LOST'
                        ? 'bg-tesla-crimson text-white'
                        : 'bg-telemetry-emerald text-black font-black'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-apple-pill text-[10px] font-mono text-slate-300 bg-black/60 backdrop-blur-md border border-hairline">
                    {item.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-hairline">
                    {item.status.replace(/_/g, ' ')}
                  </span>
                  {item.lockerId && (
                    <span className="px-2 py-0.5 rounded-md bg-telemetry-emerald/20 text-telemetry-emerald font-bold border border-telemetry-emerald/30">
                      {item.lockerId}
                    </span>
                  )}
                </div>
              </div>

              {/* Bento Card Body */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 group-hover:text-apple-blue transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.brand} • <span className="capitalize">{item.color}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-hairline">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-telemetry-emerald flex-shrink-0" />
                    <span className="truncate">{getBuildingName(item.buildingId)}</span>
                  </span>
                  <span className="font-mono text-[11px] flex-shrink-0">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CardStackCarousel
          items={displayItems}
          onSelectItem={onSelectItem}
          onOpenMatch={onOpenMatch}
          userRole={userRole}
        />
      )}
    </div>
  );
};
