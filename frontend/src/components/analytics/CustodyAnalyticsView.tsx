'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Download,
  ShieldCheck,
  Clock,
  Archive,
  TrendingUp,
  Percent,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { AnalyticsSummary, Item, ItemStatus } from '../../types';

interface CustodyAnalyticsViewProps {
  analytics: AnalyticsSummary;
  items: Item[];
  onExportCsv: () => void;
  onOpenFeedbackModal: () => void;
}

export const CustodyAnalyticsView: React.FC<CustodyAnalyticsViewProps> = ({
  analytics,
  items,
  onExportCsv,
  onOpenFeedbackModal,
}) => {
  const [selectedStage, setSelectedStage] = useState<ItemStatus | 'ALL'>('ALL');

  // The 9 Custody Status Pipeline Stages
  const pipelineStages: { status: ItemStatus; label: string; desc: string }[] = [
    { status: 'REPORTED', label: '1. Reported', desc: 'Initial intake logged' },
    { status: 'LOGGED_IN_DEPOT', label: '2. Logged Depot', desc: 'Physical item received' },
    { status: 'MATCH_SUGGESTED', label: '3. Match Found', desc: 'AI confidence score >85%' },
    { status: 'CLAIM_PENDING', label: '4. Claim Pending', desc: 'Secret traits submitted' },
    { status: 'VERIFICATION_APPROVED', label: '5. Staff Approved', desc: 'Evidence verified' },
    { status: 'AWAITING_PICKUP', label: '6. Awaiting Pickup', desc: 'QR & OTP pass active' },
    { status: 'RETURNED', label: '7. Custody Returned', desc: 'Claimant handover complete' },
    { status: 'UNCLAIMED_ARCHIVE', label: '8. Archive Depot', desc: 'Past retention window' },
    { status: 'AUCTION_DONATED', label: '9. Auction / Donated', desc: 'Final campus clearance' },
  ];

  // Retention counts
  const retentionCounts = {
    30: items.filter((i) => i.retentionDays === 30).length,
    60: items.filter((i) => i.retentionDays === 60).length,
    90: items.filter((i) => i.retentionDays === 90).length,
  };

  const filteredItems = selectedStage === 'ALL'
    ? items
    : items.filter((i) => i.status === selectedStage);

  return (
    <div className="w-full space-y-6 pb-24">
      {/* Top Banner with 1-Click CSV Audit Export */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Custody Pipeline & Admin Analytics
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-violet-500/15 text-violet-400 border border-violet-500/30">
              AUDIT COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, locker capacity, retention lifecycle, and regulatory CSV audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenFeedbackModal}
            className="px-4 py-2 rounded-2xl glass-panel text-amber-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all border border-amber-500/30"
          >
            ★ Test Feedback Modal
          </button>

          <button
            onClick={onExportCsv}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#00E599] to-teal-400 text-slate-950 font-black text-xs hover:brightness-110 shadow-glow-emerald transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-950" />
            <span>1-Click CSV Audit Export</span>
          </button>
        </div>
      </div>

      {/* 4 Real-Time KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Recovery Rate */}
        <div className="p-5 rounded-3xl glass-panel-heavy border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E599]/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
              Recovery Rate
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-white">{analytics.recoveryRate}%</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+8.4% vs last semester</span>
          </div>
        </div>

        {/* KPI 2: Median Return Time */}
        <div className="p-5 rounded-3xl glass-panel-heavy border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF5E3A]/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
              Median Return Time
            </span>
            <span className="p-2 rounded-xl bg-[#FF5E3A]/15 text-[#FF5E3A]">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-white">{analytics.medianReturnTimeHours} hrs</div>
          <div className="text-[11px] text-slate-400 mt-2">
            From initial drop-off to QR handover
          </div>
        </div>

        {/* KPI 3: Active Locker Capacity */}
        <div className="p-5 rounded-3xl glass-panel-heavy border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
              Locker Vault Capacity
            </span>
            <span className="p-2 rounded-xl bg-violet-500/15 text-violet-400">
              <Archive className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-white">
            {analytics.activeLockerCapacity.used} / {analytics.activeLockerCapacity.total}
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-[#00E599]"
              style={{ width: `${analytics.activeLockerCapacity.percentage}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Total Logged Items */}
        <div className="p-5 rounded-3xl glass-panel-heavy border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
              Active Inventory
            </span>
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-white">{items.length} Units</div>
          <div className="text-[11px] text-slate-400 mt-2">
            Campus custody verification cycle
          </div>
        </div>
      </div>

      {/* 9-Stage Custody Status Pipeline Tracker */}
      <div className="glass-panel-heavy p-6 sm:p-8 rounded-4xl border border-white/15 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-white">
              9-Stage Chain of Custody Pipeline
            </h3>
            <p className="text-xs text-slate-400">
              Strict audit trail preventing inventory shrinkage or unauthorized asset disposition
            </p>
          </div>
          {selectedStage !== 'ALL' && (
            <button
              onClick={() => setSelectedStage('ALL')}
              className="text-xs text-emerald-400 hover:underline font-mono"
            >
              Reset to All ({items.length})
            </button>
          )}
        </div>

        {/* Pipeline Horizontal Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {pipelineStages.map((stage, idx) => {
            const count = items.filter((i) => i.status === stage.status).length;
            const isSelected = selectedStage === stage.status;

            return (
              <button
                key={stage.status}
                onClick={() => setSelectedStage(stage.status)}
                className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between h-28 ${
                  isSelected
                    ? 'bg-white/20 border-[#FF5E3A] shadow-glow-orange/30'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">
                    STAGE {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white block mt-0.5 line-clamp-1">
                    {stage.label.split('. ')[1]}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                  <span className="text-[10px] text-slate-400 font-mono">Count</span>
                  <span
                    className={`text-xs font-black font-mono px-2 py-0.5 rounded-md ${
                      count > 0 ? 'bg-[#00E599]/20 text-[#00E599]' : 'text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Retention Countdown Pills & Weekly Volume Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retention Countdown Policies */}
        <div className="glass-panel p-6 rounded-4xl border border-white/10 space-y-4">
          <h3 className="text-sm font-extrabold text-white">
            Retention Windows & Disposition
          </h3>
          <p className="text-xs text-slate-400">
            Automated notifications sent prior to archive donation transfer.
          </p>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">30-Day Window (High Turnover)</span>
                <span className="text-[10px] text-slate-400">Books, Apparel, Notebooks</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {retentionCounts[30]} items
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">60-Day Window (Standard)</span>
                <span className="text-[10px] text-slate-400">Electronics, Keyfobs, Smartwatches</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {retentionCounts[60]} items
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">90-Day Window (High Value / Gov ID)</span>
                <span className="text-[10px] text-slate-400">Passports, Wallets, Certified IDs</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                {retentionCounts[90]} items
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Volume Trends Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-4xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">
              Weekly Volume Trends (Intake vs Returned)
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-[#FF5E3A]">
                <span className="w-2 h-2 rounded-full bg-[#FF5E3A]" /> Lost
              </span>
              <span className="flex items-center gap-1 text-[#7000FF]">
                <span className="w-2 h-2 rounded-full bg-[#7000FF]" /> Found
              </span>
              <span className="flex items-center gap-1 text-[#00E599]">
                <span className="w-2 h-2 rounded-full bg-[#00E599]" /> Returned
              </span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {analytics.weeklyVolumeTrends.map((trend) => (
              <div key={trend.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  {/* Lost bar */}
                  <div
                    className="w-2 sm:w-3 bg-[#FF5E3A] rounded-t-sm transition-all"
                    style={{ height: `${(trend.lost / 30) * 100}%` }}
                    title={`Lost: ${trend.lost}`}
                  />
                  {/* Found bar */}
                  <div
                    className="w-2 sm:w-3 bg-[#7000FF] rounded-t-sm transition-all"
                    style={{ height: `${(trend.found / 30) * 100}%` }}
                    title={`Found: ${trend.found}`}
                  />
                  {/* Returned bar */}
                  <div
                    className="w-2 sm:w-3 bg-[#00E599] rounded-t-sm transition-all"
                    style={{ height: `${(trend.returned / 30) * 100}%` }}
                    title={`Returned: ${trend.returned}`}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {trend.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
