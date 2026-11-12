'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Flame,
  Radio,
  Layers,
  Sparkles,
  Info,
  Navigation,
  Eye,
} from 'lucide-react';
import { Item, HotspotZone, UserRole } from '../../types';
import { CAMPUS_BUILDINGS } from '../../lib/mockData';

interface CampusMapViewProps {
  items: Item[];
  hotspots: HotspotZone[];
  onSelectItem: (item: Item) => void;
  userRole: UserRole;
}

export const CampusMapView: React.FC<CampusMapViewProps> = ({
  items,
  hotspots,
  onSelectItem,
  userRole,
}) => {
  const [nearMeActive, setNearMeActive] = useState(false);
  const [heatmapActive, setHeatmapActive] = useState(userRole === 'ADMIN');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // Student position for Near Me (200m radius) - centered at Student Union (450, 320)
  const userPosition = { x: 450, y: 320 };
  const radiusPixels = 180; // Represents 200m radius in map coordinates

  const filteredItems = nearMeActive
    ? items.filter((item) => {
        const dx = item.coords.x - userPosition.x;
        const dy = item.coords.y - userPosition.y;
        return Math.sqrt(dx * dx + dy * dy) <= radiusPixels;
      })
    : items;

  const selectedBuilding = CAMPUS_BUILDINGS.find((b) => b.id === selectedBuildingId);
  const buildingItems = items.filter((i) => i.buildingId === selectedBuildingId);

  return (
    <div className="w-full space-y-6 pb-24">
      {/* Top Map Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              Interactive Campus Spatial Radar
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              LIVE PINS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time item clustering, perimeter radar, and administrative hotspot zones
          </p>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Near Me Toggle */}
          <button
            onClick={() => setNearMeActive((prev) => !prev)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all border ${
              nearMeActive
                ? 'bg-[#00E599] text-slate-950 font-black border-transparent shadow-glow-emerald'
                : 'glass-panel text-slate-300 hover:text-white border-white/10'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${nearMeActive ? 'animate-pulse' : ''}`} />
            <span>Near Me (200m)</span>
          </button>

          {/* Heatmap Overlay Toggle */}
          <button
            onClick={() => setHeatmapActive((prev) => !prev)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all border ${
              heatmapActive
                ? 'bg-gradient-to-r from-[#FF5E3A] to-[#7000FF] text-white border-transparent shadow-glow-orange'
                : 'glass-panel text-slate-300 hover:text-white border-white/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Loss Hotspot Heatmap</span>
          </button>
        </div>
      </div>

      {/* SVG Campus Layout Area */}
      <div className="relative w-full rounded-4xl overflow-hidden glass-panel-heavy border border-white/15 p-2 sm:p-4 shadow-2xl bg-[#0B0E14]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 dot-matrix-bg opacity-30 pointer-events-none" />

        <svg
          viewBox="0 0 960 680"
          className="w-full h-auto max-h-[620px] select-none"
        >
          <defs>
            {/* Heatmap radial glow gradients */}
            <radialGradient id="heat-high" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF5E3A" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#7000FF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7000FF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heat-med" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFB800" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#00E599" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00E599" stopOpacity="0" />
            </radialGradient>

            {/* Radar wave pattern */}
            <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00E599" stopOpacity="0.2" />
              <stop offset="85%" stopColor="#00E599" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#00E599" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Campus Grounds / Lawn Zones */}
          <rect x="60" y="60" width="840" height="560" rx="36" fill="#121824" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          
          {/* Green lawn patches */}
          <path d="M 120 120 Q 200 80 340 100 T 400 240 Q 300 300 160 260 Z" fill="rgba(0, 229, 153, 0.05)" />
          <path d="M 520 120 Q 680 90 800 140 T 780 280 Q 650 320 540 250 Z" fill="rgba(0, 229, 153, 0.05)" />
          <path d="M 160 380 Q 300 350 420 420 T 360 580 Q 200 600 140 480 Z" fill="rgba(0, 229, 153, 0.05)" />
          <path d="M 560 360 Q 720 330 840 400 T 780 600 Q 640 620 520 500 Z" fill="rgba(0, 229, 153, 0.05)" />

          {/* Campus Walkways & Roads */}
          <path d="M 100 330 L 860 330" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="8" strokeDasharray="10 8" />
          <path d="M 450 90 L 450 600" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="8" strokeDasharray="10 8" />
          <circle cx="450" cy="330" r="45" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="4" />

          {/* Heatmap Overlays (Admin Mode) */}
          {heatmapActive &&
            hotspots.map((zone) => {
              const r = zone.intensity * 110 + 40;
              return (
                <g key={`heat-${zone.buildingId}`}>
                  <circle
                    cx={zone.coords.x}
                    cy={zone.coords.y}
                    r={r}
                    fill={zone.intensity > 0.7 ? 'url(#heat-high)' : 'url(#heat-med)'}
                    className="animate-pulse"
                  />
                  {/* Heatmap count pill */}
                  <rect
                    x={zone.coords.x - 30}
                    y={zone.coords.y - 75}
                    width="60"
                    height="22"
                    rx="11"
                    fill="rgba(0, 0, 0, 0.85)"
                    stroke="#FF5E3A"
                    strokeWidth="1.5"
                  />
                  <text
                    x={zone.coords.x}
                    y={zone.coords.y - 60}
                    textAnchor="middle"
                    fill="#FF8058"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    🔥 {zone.count} Lost
                  </text>
                </g>
              );
            })}

          {/* Near Me 200m Radius Indicator */}
          {nearMeActive && (
            <g>
              <circle
                cx={userPosition.x}
                cy={userPosition.y}
                r={radiusPixels}
                fill="url(#radar-glow)"
                stroke="#00E599"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              {/* Radar pulse animation */}
              <circle
                cx={userPosition.x}
                cy={userPosition.y}
                r={radiusPixels * 0.7}
                fill="none"
                stroke="#00E599"
                strokeWidth="1"
                opacity="0.4"
                className="animate-ping"
              />
              {/* Student beacon */}
              <circle cx={userPosition.x} cy={userPosition.y} r="8" fill="#00E599" />
              <circle cx={userPosition.x} cy={userPosition.y} r="16" fill="none" stroke="#00E599" strokeWidth="2" opacity="0.6" />
              <text
                x={userPosition.x}
                y={userPosition.y + 30}
                textAnchor="middle"
                fill="#00E599"
                fontSize="11"
                fontWeight="bold"
              >
                You Are Here (Near 200m)
              </text>
            </g>
          )}

          {/* Buildings SVG Graphics */}
          {CAMPUS_BUILDINGS.map((b) => {
            const isSelected = selectedBuildingId === b.id;
            const count = items.filter((i) => i.buildingId === b.id).length;

            return (
              <g
                key={b.id}
                onClick={() => setSelectedBuildingId(b.id)}
                className="cursor-pointer group"
              >
                {/* Building Base Footprint */}
                <rect
                  x={b.x - 70}
                  y={b.y - 45}
                  width="140"
                  height="90"
                  rx="18"
                  fill={isSelected ? '#1B2234' : '#161D2B'}
                  stroke={isSelected ? '#00E599' : 'rgba(255, 255, 255, 0.15)'}
                  strokeWidth={isSelected ? '3' : '1.5'}
                  filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.5))"
                  className="transition-all duration-300"
                />

                {/* Building Architectural Top Details */}
                <rect
                  x={b.x - 55}
                  y={b.y - 30}
                  width="110"
                  height="30"
                  rx="8"
                  fill="rgba(255, 255, 255, 0.05)"
                />

                {/* Building Code Badge */}
                <rect
                  x={b.x - 22}
                  y={b.y - 40}
                  width="44"
                  height="16"
                  rx="6"
                  fill={b.color}
                />
                <text
                  x={b.x}
                  y={b.y - 28}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="9"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  {b.code}
                </text>

                {/* Building Name */}
                <text
                  x={b.x}
                  y={b.y + 18}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {b.name}
                </text>

                {/* Clustered Count Pill */}
                <rect
                  x={b.x - 35}
                  y={b.y + 26}
                  width="70"
                  height="16"
                  rx="8"
                  fill="rgba(0, 0, 0, 0.7)"
                  stroke="rgba(255, 255, 255, 0.2)"
                />
                <text
                  x={b.x}
                  y={b.y + 38}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {count} {count === 1 ? 'Item' : 'Items'}
                </text>
              </g>
            );
          })}

          {/* Individual Item Glowing Pins */}
          {filteredItems.map((item) => {
            const isLost = item.type === 'LOST';
            const pinColor = isLost ? '#FF5E3A' : '#00E599';

            return (
              <g
                key={`pin-${item.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem(item);
                }}
                className="cursor-pointer transform hover:scale-125 transition-transform"
              >
                {/* Glowing Outer Ring */}
                <circle
                  cx={item.coords.x + 40}
                  cy={item.coords.y - 20}
                  r="12"
                  fill={pinColor}
                  opacity="0.3"
                  className="animate-ping"
                />
                {/* Pin Core */}
                <circle
                  cx={item.coords.x + 40}
                  cy={item.coords.y - 20}
                  r="8"
                  fill={pinColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x={item.coords.x + 40}
                  y={item.coords.y - 17}
                  textAnchor="middle"
                  fill={isLost ? '#FFFFFF' : '#000000'}
                  fontSize="7"
                  fontWeight="bold"
                >
                  {isLost ? 'L' : 'F'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Building Detail Inspector Drawer */}
      {selectedBuilding && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedBuilding.color }} />
              <h3 className="text-base font-extrabold text-white">
                {selectedBuilding.name} — Depot Zone Cluster
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {buildingItems.length} active inventory logs
            </span>
          </div>

          {buildingItems.length === 0 ? (
            <p className="text-xs text-slate-400">No active lost or found items reported in this building.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {buildingItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold text-white block truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.type} • {item.category}
                      </span>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
