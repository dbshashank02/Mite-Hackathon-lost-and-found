'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Calendar,
  Sparkles,
  ShieldAlert,
  MessageSquare,
  Lock,
  Building,
  Archive,
  ArrowRight,
} from 'lucide-react';
import { Item, UserRole } from '../../types';
import { PrivacyShield } from '../common/PrivacyShield';
import { CAMPUS_BUILDINGS } from '../../lib/mockData';

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  onOpenClaim: (item: Item) => void;
  onOpenMatch: (item: Item) => void;
  onOpenChat: (item: Item) => void;
  userRole: UserRole;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onOpenClaim,
  onOpenMatch,
  onOpenChat,
  userRole,
}) => {
  if (!item) return null;

  const building = CAMPUS_BUILDINGS.find((b) => b.id === item.buildingId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="relative w-full max-w-2xl rounded-4xl glass-panel-heavy border border-white/15 overflow-hidden shadow-2xl my-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Image */}
          <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-900">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />

            <div className="absolute top-5 left-5 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg ${
                  item.type === 'LOST'
                    ? 'bg-[#FF5E3A] text-white shadow-glow-orange'
                    : 'bg-[#00E599] text-slate-950 font-extrabold shadow-glow-emerald'
                }`}
              >
                {item.type}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-black/60 backdrop-blur-md border border-white/15">
                {item.category}
              </span>
            </div>

            <div className="absolute bottom-5 left-5 right-5">
              <span className="text-xs font-mono text-[#00E599] uppercase tracking-wider">
                ID: {item.id}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                {item.title}
              </h2>
            </div>
          </div>

          {/* Details Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Brand</span>
                <span className="text-sm font-bold text-white">{item.brand}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Color</span>
                <span className="text-sm font-bold text-white capitalize">{item.color}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Location</span>
                <span className="text-sm font-bold text-white truncate block">
                  {building?.name || item.buildingId}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Retention</span>
                <span className="text-sm font-bold text-amber-400">{item.retentionDays} Days</span>
              </div>
            </div>

            {/* Custody Depot Info */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-mono">Custody Status</span>
                  <span className="text-sm font-bold text-white">
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              {item.lockerId && (
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">Locker Vault</span>
                  <span className="text-sm font-mono font-extrabold text-[#00E599]">
                    {item.lockerId}
                  </span>
                </div>
              )}
            </div>

            {/* Privacy-First Masking Shield Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Privacy-First Sensitive Attributes
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {userRole === 'SECURITY' || userRole === 'ADMIN'
                    ? 'UNMASKED FOR STAFF'
                    : 'BLUR SHIELD ENABLED'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PrivacyShield
                  label="Hardware Serial Number"
                  value={item.sensitive.serialNumber}
                  userRole={userRole}
                />
                <PrivacyShield
                  label="Private Distinctive Traits"
                  value={item.sensitive.privateTraits}
                  userRole={userRole}
                  fallbackText="Secret Markings Masked"
                />
                <PrivacyShield
                  label="Wallet / Internal Contents"
                  value={item.sensitive.walletContents}
                  userRole={userRole}
                  fallbackText="Valuable Contents Masked"
                />
                <PrivacyShield
                  label="Finder Contact Phone"
                  value={item.sensitive.finderPhone}
                  userRole={userRole}
                  fallbackText="Phone Guard Active"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
              {item.type === 'FOUND' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenClaim(item);
                  }}
                  className="flex-1 min-w-[160px] py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF5E3A] to-[#FF7A00] text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-glow-orange transition-all"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>File Ownership Claim</span>
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onOpenMatch(item);
                }}
                className="flex-1 min-w-[160px] py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7000FF] to-[#00E599] text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-glow-violet transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Vision Matching</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenChat(item);
                }}
                className="py-3 px-4 rounded-2xl glass-panel text-slate-200 hover:text-white hover:bg-white/10 text-sm font-semibold flex items-center gap-2 transition-all border border-white/15"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Relay Chat</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
