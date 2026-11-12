'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  FileSpreadsheet,
  Clock,
  Archive,
  TrendingUp,
  Percent,
  Layers,
  CheckCircle,
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

  const pipelineStages: { status: ItemStatus; label: string; stageNum: number }[] = [
    { status: 'REPORTED', label: 'Reported', stageNum: 1 },
    { status: 'LOGGED_IN_DEPOT', label: 'Depot Intake', stageNum: 2 },
    { status: 'MATCH_SUGGESTED', label: 'AI Matched', stageNum: 3 },
    { status: 'CLAIM_PENDING', label: 'Claim Pending', stageNum: 4 },
    { status: 'VERIFICATION_APPROVED', label: 'Staff Approved', stageNum: 5 },
    { status: 'AWAITING_PICKUP', label: 'Pass Ready', stageNum: 6 },
    { status: 'RETURNED', label: 'Returned', stageNum: 7 },
    { status: 'UNCLAIMED_ARCHIVE', label: 'Archived', stageNum: 8 },
    { status: 'AUCTION_DONATED', label: 'Disposed', stageNum: 9 },
  ];

  const retentionCounts = {
    30: items.filter((i) => i.retentionDays === 30).length,
    60: items.filter((i) => i.retentionDays === 60).length,
    90: items.filter((i) => i.retentionDays === 90).length,
  };

  return (
    <div className="w-full space-y-6 pb-28">
      {/* Top Banner with 1-Click CSV Export */}
      <div className="p-5 sm:p-6 rounded-apple-xl studio-surface border border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Custody Pipeline & Admin Telemetry
            </h2>
            <span className="px-2 py-0.5 rounded-apple-pill text-[10px] font-mono text-apple-blue bg-apple-blue/10 border border-apple-blue/20">
              AUDIT COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time custody lifecycle stepper, locker capacity monitor, and audit log exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenFeedbackModal}
            className="px-3.5 py-2 rounded-apple-pill bg-white/5 hover:bg-white/10 text-amber-300 text-xs font-medium border border-hairline transition-all"
          >
            ★ Test Feedback
          </button>

          <button
            onClick={onExportCsv}
            className="px-4 py-2 rounded-apple-pill bg-white text-black font-semibold text-xs hover:bg-slate-200 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-black" />
            <span>1-Click CSV Audit Export</span>
          </button>
        </div>
      </div>

      {/* 4 Real-Time KPI Cards (Tesla Telemetry Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-apple-xl studio-surface border border-hairline">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
            Recovery Rate
          </span>
          <div className="text-3xl font-bold tracking-tight text-white tabular-numbers">
            {analytics.recoveryRate}%
          </div>
          <div className="flex items-center gap-1 text-[11px] text-telemetry-emerald mt-2 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+8.4% vs last semester</span>
          </div>
        </div>

        <div className="p-5 rounded-apple-xl studio-surface border border-hairline">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
            Median Return Time
          </span>
          <div className="text-3xl font-bold tracking-tight text-white tabular-numbers">
            {analytics.medianReturnTimeHours} hrs
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Intake to contactless handover
          </div>
        </div>

        <div className="p-5 rounded-apple-xl studio-surface border border-hairline">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
            Vault Locker Capacity
          </span>
          <div className="text-3xl font-bold tracking-tight text-white tabular-numbers">
            {analytics.activeLockerCapacity.used} / {analytics.activeLockerCapacity.total}
          </div>
          <div className="mt-2.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-telemetry-emerald"
              style={{ width: `${analytics.activeLockerCapacity.percentage}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-apple-xl studio-surface border border-hairline">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
            Active Vault Inventory
          </span>
          <div className="text-3xl font-bold tracking-tight text-white tabular-numbers">
            {items.length} Units
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Managed across 6 campus nodes
          </div>
        </div>
      </div>

      {/* 9-Stage Custody Lifecycle Stepper */}
      <div className="p-6 sm:p-8 rounded-apple-2xl studio-surface border border-hairline space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              9-Stage Chain of Custody Lifecycle
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict campus custody tracking from intake log to verified release or disposition.
            </p>
          </div>
          {selectedStage !== 'ALL' && (
            <button
              onClick={() => setSelectedStage('ALL')}
              className="text-xs text-apple-blue font-mono hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 pt-2">
          {pipelineStages.map((st) => {
            const count = items.filter((i) => i.status === st.status).length;
            const isSelected = selectedStage === st.status;

            return (
              <button
                key={st.status}
                onClick={() => setSelectedStage(st.status)}
                className={`p-3 rounded-apple-md text-left transition-all border flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'border-apple-blue bg-white/10 shadow-sm'
                    : 'bg-black/40 hover:bg-black/70 border-hairline'
                }`}
              >
                <span className="text-[9px] font-mono text-slate-500 font-bold block">
                  STAGE 0{st.stageNum}
                </span>
                <span className="text-xs font-semibold text-white block truncate">
                  {st.label}
                </span>
                <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-hairline">
                  <span className="text-slate-500">Units</span>
                  <span className={`font-bold ${count > 0 ? 'text-white' : 'text-slate-600'}`}>
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Retention Windows & Weekly Volume Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-apple-xl studio-surface border border-hairline space-y-3">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Retention Windows
          </h3>
          <p className="text-xs text-slate-400">
            Automated disposition timer policies.
          </p>

          <div className="space-y-2 pt-2">
            <div className="p-3 rounded-apple-md bg-black/50 border border-hairline flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white block">30 Days</span>
                <span className="text-[10px] text-slate-400">Books, Apparel, Notebooks</span>
              </div>
              <span className="font-mono font-bold text-amber-400">{retentionCounts[30]} items</span>
            </div>

            <div className="p-3 rounded-apple-md bg-black/50 border border-hairline flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white block">60 Days</span>
                <span className="text-[10px] text-slate-400">Electronics, Keyfobs</span>
              </div>
              <span className="font-mono font-bold text-apple-blue">{retentionCounts[60]} items</span>
            </div>

            <div className="p-3 rounded-apple-md bg-black/50 border border-hairline flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white block">90 Days</span>
                <span className="text-[10px] text-slate-400">Wallets, Gov IDs, Passports</span>
              </div>
              <span className="font-mono font-bold text-purple-400">{retentionCounts[90]} items</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 p-6 rounded-apple-xl studio-surface border border-hairline space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Weekly Volume Telemetry
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-tesla-crimson" /> Lost
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white" /> Found
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-telemetry-emerald" /> Returned
              </span>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {analytics.weeklyVolumeTrends.map((trend) => (
              <div key={trend.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  <div
                    className="w-2 sm:w-2.5 bg-tesla-crimson rounded-t-sm"
                    style={{ height: `${(trend.lost / 30) * 100}%` }}
                    title={`Lost: ${trend.lost}`}
                  />
                  <div
                    className="w-2 sm:w-2.5 bg-white rounded-t-sm"
                    style={{ height: `${(trend.found / 30) * 100}%` }}
                    title={`Found: ${trend.found}`}
                  />
                  <div
                    className="w-2 sm:w-2.5 bg-telemetry-emerald rounded-t-sm"
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
