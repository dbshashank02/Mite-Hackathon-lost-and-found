'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  MapPin,
  ShieldAlert,
  QrCode,
  BarChart3,
  Users,
  ChevronUp,
} from 'lucide-react';
import { UserRole } from '../../types';

export type ActiveTab = 'DISCOVERY' | 'MAP' | 'CLAIMS' | 'HANDOVER' | 'ANALYTICS';

interface BottomDockProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  pendingClaimsCount: number;
  matchAlertsCount: number;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  onRoleChange,
  pendingClaimsCount,
  matchAlertsCount,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = React.useState(false);

  const roles: { role: UserRole; label: string; desc: string; color: string }[] = [
    { role: 'STUDENT', label: 'Student', desc: 'Report & Claim items', color: 'from-indigo-500 to-blue-500' },
    { role: 'FINDER', label: 'Finder', desc: 'Good samaritan drop-off', color: 'from-emerald-500 to-teal-500' },
    { role: 'SECURITY', label: 'Security', desc: 'Staff depot & fraud verification', color: 'from-amber-500 to-orange-500' },
    { role: 'ADMIN', label: 'Admin', desc: 'Hotspots & custody analytics', color: 'from-violet-500 to-purple-500' },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 flex flex-col items-center pointer-events-none px-4">
      {/* Persona Switcher Floating Popup */}
      {showPersonaMenu && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          className="pointer-events-auto mb-3 p-2 rounded-3xl glass-panel-heavy shadow-2xl border border-white/10 w-full max-w-sm"
        >
          <div className="px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>DEMO PERSONA SWITCHER</span>
            <span className="text-[10px] text-emerald-400 font-mono">1-TAP SWITCH</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-1">
            {roles.map((r) => {
              const isSelected = currentRole === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => {
                    onRoleChange(r.role);
                    setShowPersonaMenu(false);
                  }}
                  className={`p-2.5 rounded-2xl text-left transition-all flex flex-col ${
                    isSelected
                      ? 'bg-white/15 dark:bg-white/15 border border-white/20 shadow-md'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${r.color}`} />
                    <span className="text-xs font-bold text-white">{r.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{r.desc}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Main Island Pill */}
      <nav className="pointer-events-auto flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-full glass-panel-heavy shadow-2xl border border-white/[0.12] max-w-2xl">
        {/* Discovery Tab */}
        <button
          onClick={() => onTabChange('DISCOVERY')}
          className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'DISCOVERY'
              ? 'text-white bg-gradient-to-r from-[#FF5E3A] to-[#FF7A00] shadow-glow-orange'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="hidden sm:inline">Discovery</span>
          {matchAlertsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#00E599] animate-ping" />
          )}
        </button>

        {/* Campus Map Tab */}
        <button
          onClick={() => onTabChange('MAP')}
          className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'MAP'
              ? 'text-white bg-gradient-to-r from-[#7000FF] to-[#9933FF] shadow-glow-violet'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">Map</span>
        </button>

        {/* Claims / Security Queue Tab */}
        <button
          onClick={() => onTabChange('CLAIMS')}
          className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'CLAIMS'
              ? 'text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span className="hidden sm:inline">
            {currentRole === 'SECURITY' || currentRole === 'ADMIN' ? 'Review Queue' : 'My Claims'}
          </span>
          {pendingClaimsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-[10px] font-bold text-slate-900 leading-none">
              {pendingClaimsCount}
            </span>
          )}
        </button>

        {/* QR Handover Tab */}
        <button
          onClick={() => onTabChange('HANDOVER')}
          className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'HANDOVER'
              ? 'text-white bg-gradient-to-r from-[#00E599] to-teal-500 shadow-glow-emerald text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Handover</span>
        </button>

        {/* Analytics & Pipeline Tab */}
        <button
          onClick={() => onTabChange('ANALYTICS')}
          className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'ANALYTICS'
              ? 'text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-glow-violet'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden md:inline">Custody</span>
        </button>

        {/* Vertical divider */}
        <div className="w-[1px] h-6 bg-white/10 mx-0.5" />

        {/* Persona Switcher Pill */}
        <button
          onClick={() => setShowPersonaMenu((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
          title="Instant Persona Switcher for Hackathon Demo"
        >
          <Users className="w-3.5 h-3.5 text-[#00E599]" />
          <span className="font-mono text-[11px] uppercase tracking-wider">{currentRole}</span>
          <ChevronUp
            className={`w-3 h-3 text-slate-400 transition-transform ${
              showPersonaMenu ? 'rotate-180' : ''
            }`}
          />
        </button>
      </nav>
    </div>
  );
};
