'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Radio,
  Flame,
  Layers,
  Eye,
  Navigation,
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

  const userPosition = { x: 450, y: 320 }; // Student Union
  const radiusPixels = 180;

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
    <div className="w-full space-y-6 pb-28">
      {/* Top Map Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-apple-xl studio-surface border border-hairline shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Campus Spatial Telemetry
            </h2>
            <span className="px-2 py-0.5 rounded-apple-pill text-[10px] font-mono text-telemetry-emerald bg-telemetry-emerald/10 border border-telemetry-emerald/20">
              VEHICLE-MAP MODE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tesla-grade vector topology with perimeter radar and loss clustering.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setNearMeActive((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-apple-pill text-xs font-medium flex items-center gap-1.5 transition-all border ${
              nearMeActive
                ? 'bg-telemetry-emerald text-black font-bold border-transparent'
                : 'bg-white/5 text-slate-300 hover:text-white border-hairline'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${nearMeActive ? 'animate-pulse' : ''}`} />
            <span>Near Me (200m)</span>
          </button>

          <button
            onClick={() => setHeatmapActive((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-apple-pill text-xs font-medium flex items-center gap-1.5 transition-all border ${
              heatmapActive
                ? 'bg-tesla-crimson text-white font-bold border-transparent shadow-tesla-glow'
                : 'bg-white/5 text-slate-300 hover:text-white border-hairline'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Hotspot Heatmap</span>
          </button>
        </div>
      </div>

      {/* High-Contrast Tesla Vehicle-Map SVG */}
      <div className="relative w-full rounded-apple-2xl overflow-hidden studio-surface border border-hairline p-3 sm:p-5 shadow-2xl bg-black">
        <svg
          viewBox="0 0 960 680"
          className="w-full h-auto max-h-[620px] select-none"
        >
          <defs>
            <radialGradient id="heat-crimson" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E82127" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#E82127" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#E82127" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="radar-pulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0071E3" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#0071E3" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0071E3" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Base Grid / Campus Perimeter */}
          <rect x="50" y="50" width="860" height="580" rx="28" fill="#0A0A0C" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

          {/* Minimalist Vector Transit Lines */}
          <line x1="80" y1="330" x2="880" y2="330" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="4" strokeDasharray="8 6" />
          <line x1="450" y1="80" x2="450" y2="600" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="4" strokeDasharray="8 6" />
          <circle cx="450" cy="330" r="42" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="2" />

          {/* Heatmap Overlay (Admin Mode) */}
          {heatmapActive &&
            hotspots.map((zone) => {
              const r = zone.intensity * 105 + 40;
              return (
                <g key={`heat-${zone.buildingId}`}>
                  <circle
                    cx={zone.coords.x}
                    cy={zone.coords.y}
                    r={r}
                    fill="url(#heat-crimson)"
                  />
                  <rect
                    x={zone.coords.x - 30}
                    y={zone.coords.y - 70}
                    width="60"
                    height="20"
                    rx="10"
                    fill="rgba(0,0,0,0.85)"
                    stroke="#E82127"
                    strokeWidth="1"
                  />
                  <text
                    x={zone.coords.x}
                    y={zone.coords.y - 56}
                    textAnchor="middle"
                    fill="#FF4D2D"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    🔥 {zone.count} Lost
                  </text>
                </g>
              );
            })}

          {/* Near Me 200m Radar Pulse */}
          {nearMeActive && (
            <g>
              <circle
                cx={userPosition.x}
                cy={userPosition.y}
                r={radiusPixels}
                fill="url(#radar-pulse)"
                stroke="#0071E3"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <circle cx={userPosition.x} cy={userPosition.y} r="6" fill="#0071E3" />
              <circle cx={userPosition.x} cy={userPosition.y} r="14" fill="none" stroke="#0071E3" strokeWidth="1.5" opacity="0.6" className="animate-ping" />
              <text
                x={userPosition.x}
                y={userPosition.y + 26}
                textAnchor="middle"
                fill="#0071E3"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                TELEMETRY BEACON (200m)
              </text>
            </g>
          )}

          {/* Buildings Footprint */}
          {CAMPUS_BUILDINGS.map((b) => {
            const isSelected = selectedBuildingId === b.id;
            const count = items.filter((i) => i.buildingId === b.id).length;

            return (
              <g
                key={b.id}
                onClick={() => setSelectedBuildingId(b.id)}
                className="cursor-pointer group"
              >
                <rect
                  x={b.x - 65}
                  y={b.y - 40}
                  width="130"
                  height="80"
                  rx="16"
                  fill={isSelected ? '#18181C' : '#111114'}
                  stroke={isSelected ? '#0071E3' : 'rgba(255, 255, 255, 0.12)'}
                  strokeWidth={isSelected ? '2.5' : '1'}
                  className="transition-all duration-300"
                />

                {/* Building Code Badge */}
                <rect
                  x={b.x - 20}
                  y={b.y - 32}
                  width="40"
                  height="14"
                  rx="7"
                  fill="rgba(255, 255, 255, 0.1)"
                />
                <text
                  x={b.x}
                  y={b.y - 22}
                  textAnchor="middle"
                  fill="#F5F5F7"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {b.code}
                </text>

                {/* Building Name */}
                <text
                  x={b.x}
                  y={b.y + 12}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="bold"
                  letterSpacing="-0.02em"
                >
                  {b.name}
                </text>

                {/* Count Pill */}
                <rect
                  x={b.x - 28}
                  y={b.y + 20}
                  width="56"
                  height="14"
                  rx="7"
                  fill="rgba(0, 0, 0, 0.7)"
                  stroke="rgba(255, 255, 255, 0.15)"
                />
                <text
                  x={b.x}
                  y={b.y + 30}
                  textAnchor="middle"
                  fill="#AEAEB2"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {count} Units
                </text>
              </g>
            );
          })}

          {/* Individual Glowing Telemetry Pins */}
          {filteredItems.map((item) => {
            const isLost = item.type === 'LOST';
            const color = isLost ? '#E82127' : '#10B981';

            return (
              <g
                key={`pin-${item.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem(item);
                }}
                className="cursor-pointer hover:scale-125 transition-transform"
              >
                <circle
                  cx={item.coords.x + 35}
                  cy={item.coords.y - 18}
                  r="6"
                  fill={color}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Building Details Drawer */}
      {selectedBuilding && (
        <div className="p-5 rounded-apple-xl studio-surface border border-hairline shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">
              {selectedBuilding.name} ({selectedBuilding.code})
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {buildingItems.length} active inventory logs
            </span>
          </div>

          {buildingItems.length === 0 ? (
            <p className="text-xs text-slate-400">No active inventory items logged at this node.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {buildingItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="p-3 rounded-apple-md bg-white/5 hover:bg-white/10 border border-hairline cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-9 h-9 rounded-apple-sm object-cover"
                    />
                    <div className="truncate">
                      <span className="text-xs font-semibold text-white block truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.type} • {item.category}
                      </span>
                    </div>
                  </div>
                  <Eye className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
