'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  MapPin,
  Plus,
  QrCode,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '../../types';

export type ActiveTab = 'DISCOVERY' | 'MAP' | 'CLAIMS' | 'HANDOVER' | 'ANALYTICS';

interface BottomDockProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenReportModal: () => void;
  currentRole: UserRole;
  pendingClaimsCount: number;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeTab,
  onTabChange,
  onOpenReportModal,
  currentRole,
  pendingClaimsCount,
}) => {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
      <nav className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-apple-pill apple-dock shadow-2xl border-hairline">
        {/* Discover */}
        <button
          onClick={() => onTabChange('DISCOVERY')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-apple-pill text-xs font-medium transition-all ${
            activeTab === 'DISCOVERY'
              ? 'bg-white dark:bg-white text-black font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Discover</span>
        </button>

        {/* Campus Map */}
        <button
          onClick={() => onTabChange('MAP')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-apple-pill text-xs font-medium transition-all ${
            activeTab === 'MAP'
              ? 'bg-white dark:bg-white text-black font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>

        {/* Center Report Action Button */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-apple-pill bg-apple-blue hover:bg-apple-blueHover text-white text-xs font-semibold shadow-apple-blue-glow transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>

        {/* Verification & Claims Queue */}
        <button
          onClick={() => onTabChange('CLAIMS')}
          className={`relative flex items-center gap-2 px-3.5 py-2 rounded-apple-pill text-xs font-medium transition-all ${
            activeTab === 'CLAIMS'
              ? 'bg-white dark:bg-white text-black font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Queue</span>
          {pendingClaimsCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-tesla-crimson text-white text-[9px] font-mono font-bold flex items-center justify-center">
              {pendingClaimsCount}
            </span>
          )}
        </button>

        {/* Handover & QR Pass */}
        <button
          onClick={() => onTabChange('HANDOVER')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-apple-pill text-xs font-medium transition-all ${
            activeTab === 'HANDOVER'
              ? 'bg-white dark:bg-white text-black font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Pass</span>
        </button>

        {/* Telemetry / Admin */}
        <button
          onClick={() => onTabChange('ANALYTICS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-apple-pill text-xs font-medium transition-all ${
            activeTab === 'ANALYTICS'
              ? 'bg-white dark:bg-white text-black font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Telemetry</span>
        </button>
      </nav>
    </div>
  );
};
