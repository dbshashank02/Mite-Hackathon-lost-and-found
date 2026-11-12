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
  const categoryDotColor: Record<string, string> = {
    ALL: 'bg-slate-400',
    Electronics: 'bg-[#3B82F6]',
    'Wallets/Bags': 'bg-[#FBE74E]',
    Keys: 'bg-[#FF4A36]',
    Identification: 'bg-[#F866DB]',
    Apparel: 'bg-[#00D084]',
    Books: 'bg-[#A855F7]',
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Search, Segmented LOST/FOUND, and Category Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Minimalist Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search items by keyword, brand, or color..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-hairline text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#FF4A36] focus:ring-1 focus:ring-[#FF4A36] transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {/* Segmented LOST / FOUND Toggle */}
            <div className="flex items-center p-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-hairline">
              {(['ALL', 'LOST', 'FOUND'] as (ItemType | 'ALL')[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onSelectType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedType === t
                      ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* View Switcher: Bento Grid vs 3D Stack */}
            <div className="flex items-center p-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-hairline">
              <button
                onClick={() => setViewMode('BENTO')}
                className={`p-1.5 rounded-full text-xs transition-all ${
                  viewMode === 'BENTO'
                    ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Superlist Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('3D')}
                className={`p-1.5 rounded-full text-xs transition-all ${
                  viewMode === '3D'
                    ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
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
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              nearMeOnly
                ? 'bg-[#00D084] text-black border-transparent shadow-sm font-bold'
                : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-hairline'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${nearMeOnly ? 'animate-pulse text-black' : 'text-[#00D084]'}`} />
            <span>Near Me (&lt;200m)</span>
            {nearMeOnly && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/20">
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
                className={`px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white border-hairline font-semibold shadow-sm'
                    : 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-hairline'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${categoryDotColor[cat] || 'bg-slate-400'}`} />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Showcase Area: Superlist Cards Grid or 3D Showcase */}
      {viewMode === 'BENTO' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group rounded-2xl overflow-hidden studio-surface border border-hairline hover:border-[#FF4A36]/40 cursor-pointer transition-all duration-300 hover:shadow-lg"
            >
              {/* Product Visual */}
              <div className="relative h-52 w-full overflow-hidden bg-black/20">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Floating Metadata Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-sm ${
                      item.type === 'LOST'
                        ? 'bg-[#FF4A36] text-white'
                        : 'bg-[#00D084] text-black font-bold'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium text-white/90 bg-black/50 backdrop-blur-md border border-white/10">
                    {item.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-200">
                  <span className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/10">
                    {item.status.replace(/_/g, ' ')}
                  </span>
                  {item.lockerId && (
                    <span className="px-2 py-0.5 rounded-md bg-[#00D084]/20 text-[#00D084] font-bold border border-[#00D084]/40">
                      {item.lockerId}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2.5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-[#FF4A36] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.brand} &bull; <span className="capitalize">{item.color}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2.5 border-t border-hairline">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#FF4A36] flex-shrink-0" />
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
