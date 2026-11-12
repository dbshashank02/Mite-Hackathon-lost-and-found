'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  Lock,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Upload,
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
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'
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

  const handleSimulateFastCapture = () => {
    setFastLogCameraActive(true);
    setTimeout(() => {
      setFastLogCameraActive(false);
      setImageUrl(
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'
      );
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
        brand: brand || 'Unspecified',
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl rounded-apple-2xl studio-surface border border-hairline p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Pill */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <span className="text-[10px] font-mono uppercase tracking-wider text-apple-blue font-bold block mb-1">
              FAST-LOG TELEMETRY
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Log Campus Inventory
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Rapid intake with AI vision hashing and zero-exposure encrypted traits.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Type Segmented Pill */}
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1.5">
                Catalog Direction
              </label>
              <div className="grid grid-cols-2 p-1 rounded-apple-pill bg-black/50 border border-hairline">
                <button
                  type="button"
                  onClick={() => setType('LOST')}
                  className={`py-2 rounded-apple-pill text-xs font-semibold transition-all ${
                    type === 'LOST'
                      ? 'bg-tesla-crimson text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  I Lost An Item
                </button>
                <button
                  type="button"
                  onClick={() => setType('FOUND')}
                  className={`py-2 rounded-apple-pill text-xs font-semibold transition-all ${
                    type === 'FOUND'
                      ? 'bg-telemetry-emerald text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  I Found An Item
                </button>
              </div>
            </div>

            {/* Camera Dropzone */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-slate-400 block">
                Visual Capture
              </label>
              <div className="p-4 rounded-apple-xl bg-black/50 border border-dashed border-hairline flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-apple-md overflow-hidden bg-slate-900 border border-hairline flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {fastLogCameraActive && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] font-mono text-apple-blue">
                      Calibrating...
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateFastCapture}
                      className="px-3.5 py-1.5 rounded-apple-pill bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 text-apple-blue" />
                      <span>Snap Photo</span>
                    </button>
                    <label className="px-3.5 py-1.5 rounded-apple-pill bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-telemetry-emerald" />
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste image URL..."
                    className="w-full px-3 py-1.5 rounded-apple-md bg-white/5 border border-hairline text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-apple-blue"
                  />
                </div>
              </div>
            </div>

            {/* Title & Taxonomy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MacBook Pro 14, Bifold Wallet"
                  className="w-full px-3.5 py-2 rounded-apple-md bg-white/5 border border-hairline text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-apple-blue"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full px-3.5 py-2 rounded-apple-md bg-[#111114] border border-hairline text-white text-xs focus:outline-none focus:border-apple-blue"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brand, Color, Building Pin */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Brand / Model
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Apple, Sony, Bellroy"
                  className="w-full px-3.5 py-2 rounded-apple-md bg-white/5 border border-hairline text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-apple-blue"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Space Gray, Black, Tan"
                  className="w-full px-3.5 py-2 rounded-apple-md bg-white/5 border border-hairline text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-apple-blue"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Campus Pin
                </label>
                <select
                  value={buildingId}
                  onChange={(e) => setBuildingId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-apple-md bg-[#111114] border border-hairline text-white text-xs focus:outline-none focus:border-apple-blue"
                >
                  {CAMPUS_BUILDINGS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} ({b.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dedicated Encrypted "Private Distinctive Traits" Box */}
            <div className="p-4 rounded-apple-xl bg-black/70 border border-hairline space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-tesla-crimson" />
                  <span>Private Distinctive Traits (Zero-Exposure Shield)</span>
                </span>
                <span className="text-[9px] font-mono text-telemetry-emerald">
                  ENCRYPTED AT REST
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Provide private identifying marks (stickers, scratches, serial hints, contents) known only to the true owner.
              </p>
              <textarea
                required
                rows={2}
                value={privateTraits}
                onChange={(e) => setPrivateTraits(e.target.value)}
                placeholder="e.g. Holographic GitHub sticker on lid, minor scratch on left bezel..."
                className="w-full px-3.5 py-2 rounded-apple-md bg-white/5 border border-hairline text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-apple-blue"
              />
            </div>

            {/* Hardware Serial Number */}
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Hardware Serial Number (Optional Masked)
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. C02G4050MD6M"
                className="w-full px-3.5 py-2 rounded-apple-md bg-white/5 border border-hairline text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:border-apple-blue"
              />
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-apple-pill bg-white text-black font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-apple-blue" />
              <span>{isSubmitting ? 'Registering...' : 'Register Item to Campus Depot'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
