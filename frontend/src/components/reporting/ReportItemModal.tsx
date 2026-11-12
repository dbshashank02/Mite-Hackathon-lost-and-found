'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  Upload,
  Lock,
  Sparkles,
  MapPin,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Item, ItemCategory, ItemType, UserRole } from '../../types';
import { CAMPUS_BUILDINGS } from '../../lib/mockData';

interface ReportItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newItem: Omit<Item, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  userRole: UserRole;
}

export const ReportItemModal: React.FC<ReportItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userRole,
}) => {
  const [type, setType] = useState<ItemType>(userRole === 'FINDER' ? 'FOUND' : 'LOST');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('Space Gray');
  const [buildingId, setBuildingId] = useState(CAMPUS_BUILDINGS[0].id);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'
  );
  const [retentionDays, setRetentionDays] = useState<30 | 60 | 90>(30);

  // Sensitive & Privacy Fields
  const [serialNumber, setSerialNumber] = useState('');
  const [privateTraits, setPrivateTraits] = useState('');
  const [walletContents, setWalletContents] = useState('');
  const [finderPhone, setFinderPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fastLogCameraActive, setFastLogCameraActive] = useState(false);

  if (!isOpen) return null;

  const categories: ItemCategory[] = [
    'Electronics',
    'Wallets/Bags',
    'Keys',
    'Identification',
    'Apparel',
    'Books',
  ];

  const colorPresets = [
    { label: 'Space Gray', hex: '#4B5563' },
    { label: 'Midnight Black', hex: '#111827' },
    { label: 'Silver / White', hex: '#E5E7EB' },
    { label: 'Caramel Tan', hex: '#D97706' },
    { label: 'Navy Blue', hex: '#1E3A8A' },
    { label: 'Forest Green', hex: '#065F46' },
    { label: 'Crimson Red', hex: '#DC2626' },
  ];

  const handleSimulateFastCapture = () => {
    setFastLogCameraActive(true);
    setTimeout(() => {
      setFastLogCameraActive(false);
      setImageUrl(
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
      );
    }, 1200);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const selectedBuilding = CAMPUS_BUILDINGS.find((b) => b.id === buildingId) || CAMPUS_BUILDINGS[0];

    try {
      await onSubmit({
        type,
        title,
        category,
        brand: brand || 'Unbranded',
        color,
        imageUrl,
        buildingId,
        coords: {
          x: selectedBuilding.x,
          y: selectedBuilding.y,
          lat: selectedBuilding.lat,
          lng: selectedBuilding.lng,
        },
        retentionDays,
        expiresAt: new Date(Date.now() + retentionDays * 86400000).toISOString(),
        sensitive: {
          serialNumber: serialNumber || 'N/A',
          privateTraits: privateTraits || 'None specified',
          walletContents: walletContents || 'N/A',
          finderPhone: finderPhone || '+1 (555) 000-0000',
        },
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          className="relative w-full max-w-2xl rounded-4xl glass-panel-heavy p-6 sm:p-8 shadow-2xl border border-white/15 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5E3A] via-[#7000FF] to-[#00E599] p-[2px]">
              <div className="w-full h-full bg-[#0B0E14] rounded-2xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-[#00E599]" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Rapid Reporting Flow
              </h2>
              <p className="text-xs text-slate-400">
                Log a Lost or Misplaced Item with AI Vision & Privacy Shielding
              </p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Type Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Report Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('LOST')}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                    type === 'LOST'
                      ? 'bg-[#FF5E3A] text-white border-transparent shadow-glow-orange'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>I Lost Something</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('FOUND')}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                    type === 'FOUND'
                      ? 'bg-[#00E599] text-slate-950 font-extrabold border-transparent shadow-glow-emerald'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>I Found an Item</span>
                </button>
              </div>
            </div>

            {/* Fast-Log Camera / Photo Upload Simulator */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Item Photo (Fast-Log Camera Mode)
              </label>
              <div className="relative rounded-3xl overflow-hidden border border-dashed border-white/20 bg-white/5 p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {fastLogCameraActive && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-emerald-400">
                      <Camera className="w-6 h-6 animate-pulse mb-1" />
                      <span className="text-[10px] font-mono">Calibrating...</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <p className="text-xs text-slate-300 font-medium">
                    Upload or snap a clear photo. AI vision extracts geometry and color signatures.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateFastCapture}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#00E599]" />
                      <span>Snap Fast-Log Photo</span>
                    </button>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or paste image URL"
                      className="flex-1 min-w-[180px] px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Structured Taxonomy & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MacBook Pro 14, Leather Wallet"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#FF5E3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Category Taxonomy
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#121824] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF5E3A]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brand & Color Swatch Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Brand / Manufacturer
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple, Bellroy, Sony, Nike"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#00E599]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Color / Finish
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {colorPresets.map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setColor(c.label)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          color === c.label ? 'scale-125 border-white ring-2 ring-[#00E599]' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                  </div>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-28 px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Building Pin Selector & Retention Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#00E599]" />
                  <span>Campus Building Pin</span>
                </label>
                <select
                  value={buildingId}
                  onChange={(e) => setBuildingId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#121824] border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E599]"
                >
                  {CAMPUS_BUILDINGS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Custody Retention Policy
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([30, 60, 90] as (30 | 60 | 90)[]).map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setRetentionDays(days)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        retentionDays === days
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* HIGHLIGHTED HIDDEN INPUT FOR "Private Distinctive Traits" */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-emerald-500/10 border-2 border-amber-500/40 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Private Distinctive Traits (Anti-Fraud Proof)
                </span>
                <span className="text-[10px] text-amber-300 font-mono bg-amber-500/20 px-2 py-0.5 rounded-full">
                  SHIELDED AT REST
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mb-2">
                Specify subtle details (scratches, stickers, engravings, contents) known only to the true owner.
                This is strictly masked behind the frosted shield and verified during claim review.
              </p>
              <textarea
                required
                rows={2}
                value={privateTraits}
                onChange={(e) => setPrivateTraits(e.target.value)}
                placeholder="e.g. Holographic GitHub sticker on bottom lid, scratched corner, exact cash denominations..."
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-all font-mono"
              />
            </div>

            {/* Other Sensitive Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Serial Number (Masked)
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. C02G4050MD6M"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Finder Phone (Redacted)
                </label>
                <input
                  type="text"
                  value={finderPhone}
                  onChange={(e) => setFinderPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5E3A] via-[#7000FF] to-[#00E599] text-white font-extrabold text-sm hover:brightness-110 shadow-glow-orange transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Hashing & Running AI Match...' : 'Publish Item to Campus Depot'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
