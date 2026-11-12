'use client';

import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Layers,
  Sparkles,
  Camera,
  MapPin,
  Calendar,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { Item, ItemCategory, ItemType, UserRole } from '../../types';
import { CardStackCarousel } from './CardStackCarousel';
import { CAMPUS_BUILDINGS } from '../../lib/mockData';

interface DiscoveryViewProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
  onOpenMatch: (item: Item) => void;
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
  onOpenReportModal,
  userRole,
  selectedCategory,
  onSelectCategory,
  selectedType,
  onSelectType,
  searchQuery,
  onSearchChange,
}) => {
  const [viewMode, setViewMode] = useState<'3D' | 'GRID'>('3D');

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

  return (
    <div className="w-full space-y-6 pb-24">
      {/* Hero Headline & Fast-Log Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-heavy p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-[#FF5E3A]/25 via-[#7000FF]/20 to-[#00E599]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Deep Learning Pipeline Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Instant AI Vision Recovery across Campus Grounds
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Lost an item or found misplaced property? Our multimodal matching engine clusters items
              by visual traits, geo-pins, and timestamp correlations.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5E3A] via-[#FF7A00] to-[#7000FF] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 hover:brightness-110 shadow-glow-orange transition-all active:scale-95 flex-shrink-0"
          >
            <Camera className="w-5 h-5" />
            <span>Fast-Log Camera Mode</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by brand, item title, color, or traits..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-panel text-sm text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-[#FF5E3A] transition-all"
            />
          </div>

          {/* Type Selector (ALL, LOST, FOUND) */}
          <div className="flex items-center p-1 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 self-center">
            {(['ALL', 'LOST', 'FOUND'] as (ItemType | 'ALL')[]).map((t) => (
              <button
                key={t}
                onClick={() => onSelectType(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedType === t
                    ? t === 'LOST'
                      ? 'bg-[#FF5E3A] text-white shadow-glow-orange'
                      : t === 'FOUND'
                      ? 'bg-[#00E599] text-slate-950 font-extrabold shadow-glow-emerald'
                      : 'bg-white/20 dark:bg-white/20 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* View Mode Toggle (3D Stack vs Grid) */}
          <div className="flex items-center p-1 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 self-center">
            <button
              onClick={() => setViewMode('3D')}
              aria-label="3D Stack View"
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === '3D'
                  ? 'bg-gradient-to-r from-[#7000FF] to-[#00E599] text-white shadow-glow-violet'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="3D Card Stack Carousel"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              aria-label="Grid View"
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'GRID'
                  ? 'bg-gradient-to-r from-[#7000FF] to-[#00E599] text-white shadow-glow-violet'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Modern Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FF5E3A] to-[#7000FF] text-white border-transparent shadow-glow-orange/30'
                    : 'glass-panel text-slate-400 hover:text-slate-200 border-slate-200 dark:border-white/10 hover:border-white/25'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === '3D' ? (
        <CardStackCarousel
          items={items}
          onSelectItem={onSelectItem}
          onOpenMatch={onOpenMatch}
          userRole={userRole}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group rounded-3xl glass-panel border border-slate-200 dark:border-white/10 hover:border-[#FF5E3A]/40 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                      item.type === 'LOST'
                        ? 'bg-[#FF5E3A] text-white shadow-glow-orange'
                        : 'bg-[#00E599] text-slate-950 font-extrabold shadow-glow-emerald'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-black/60 backdrop-blur-md border border-white/15">
                    {item.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-300 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
                    {item.status.replace(/_/g, ' ')}
                  </span>
                  {item.lockerId && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      🔒 {item.lockerId}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#00E599]" />
                    {getBuildingName(item.buildingId)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#FF5E3A]" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
