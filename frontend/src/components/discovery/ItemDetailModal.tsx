'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Lock,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl rounded-apple-2xl studio-surface border border-hairline overflow-hidden shadow-2xl my-8"
        >
          {/* Close Pill */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-hairline flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Studio Image Header */}
          <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-black/60">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            <div className="absolute top-5 left-5 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-apple-pill text-xs font-mono font-bold uppercase tracking-wider ${
                  item.type === 'LOST'
                    ? 'bg-tesla-crimson text-white'
                    : 'bg-telemetry-emerald text-black'
                }`}
              >
                {item.type}
              </span>
              <span className="px-3 py-1 rounded-apple-pill text-xs font-mono text-slate-300 bg-black/60 backdrop-blur-md border border-hairline">
                {item.category}
              </span>
            </div>

            <div className="absolute bottom-5 left-6 right-6">
              <span className="text-[11px] font-mono text-slate-400 block mb-0.5">
                INVENTORY ID: {item.id}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {item.title}
              </h2>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-apple-md apple-glass">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Brand</span>
                <span className="text-sm font-semibold text-white">{item.brand}</span>
              </div>
              <div className="p-3.5 rounded-apple-md apple-glass">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Color</span>
                <span className="text-sm font-semibold text-white capitalize">{item.color}</span>
              </div>
              <div className="p-3.5 rounded-apple-md apple-glass">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Location</span>
                <span className="text-sm font-semibold text-white truncate block">
                  {building?.name || item.buildingId}
                </span>
              </div>
              <div className="p-3.5 rounded-apple-md apple-glass">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Retention</span>
                <span className="text-sm font-semibold text-amber-400 font-mono">
                  {item.retentionDays} Days
                </span>
              </div>
            </div>

            {/* Custody Depot Info */}
            <div className="p-4 rounded-apple-lg bg-black/50 border border-hairline flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Archive className="w-5 h-5 text-apple-blue" />
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">
                    Custody State
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white font-mono">
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              {item.lockerId && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">
                    Depot Vault
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-telemetry-emerald">
                    {item.lockerId}
                  </span>
                </div>
              )}
            </div>

            {/* Privacy Shield Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-tesla-amber" />
                  <span>Zero-Exposure Protected Attributes</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {userRole === 'SECURITY' || userRole === 'ADMIN' ? 'UNMASKED FOR STAFF' : 'SHIELDED'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PrivacyShield
                  label="Serial Number"
                  value={item.sensitive.serialNumber}
                  userRole={userRole}
                />
                <PrivacyShield
                  label="Private Traits"
                  value={item.sensitive.privateTraits}
                  userRole={userRole}
                  fallbackText="Secret Markings Masked"
                />
                <PrivacyShield
                  label="Wallet Contents"
                  value={item.sensitive.walletContents}
                  userRole={userRole}
                  fallbackText="Private Contents Masked"
                />
                <PrivacyShield
                  label="Finder Contact"
                  value={item.sensitive.finderPhone}
                  userRole={userRole}
                  fallbackText="Phone Guard Active"
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-hairline flex flex-wrap items-center gap-3">
              {item.type === 'FOUND' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenClaim(item);
                  }}
                  className="flex-1 py-3 px-5 rounded-apple-pill bg-white text-black font-semibold text-xs hover:bg-slate-200 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-apple-blue" />
                  <span>Claim Item</span>
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onOpenMatch(item);
                }}
                className="flex-1 py-3 px-5 rounded-apple-pill bg-apple-blue hover:bg-apple-blueHover text-white font-semibold text-xs transition-all active:scale-95 shadow-apple-blue-glow flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Match Telemetry</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenChat(item);
                }}
                className="py-3 px-4 rounded-apple-pill bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-hairline transition-all active:scale-95 flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-slate-300" />
                <span>Relay Chat</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
