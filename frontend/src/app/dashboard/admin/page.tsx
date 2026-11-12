'use client';

import React, { useState, useEffect } from 'react';
import {
  Item,
  User,
  AnalyticsSummary,
  HotspotZone,
  ItemStatus,
} from '../../../types';
import { api } from '../../../lib/api';
import { DEMO_USERS, CAMPUS_BUILDINGS } from '../../../lib/mockData';
import { useAuth } from '../../../context/AuthContext';
import { AppHeader } from '../../../components/layout/AppHeader';
import { CustodyAnalyticsView } from '../../../components/analytics/CustodyAnalyticsView';
import { CampusMapView } from '../../../components/map/CampusMapView';
import { FeedbackModal } from '../../../components/feedback/FeedbackModal';
import {
  BarChart3,
  Flame,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  TrendingUp,
  Clock,
  Lock,
  ArrowRight,
  Gavel,
  Gift,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user: authUser } = useAuth();
  const currentUser: User = authUser || DEMO_USERS.ADMIN;

  const [items, setItems] = useState<Item[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [hotspots, setHotspots] = useState<HotspotZone[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HEATMAP' | 'LIFECYCLE_POLICIES' | 'AUDIT_LOGS'>('OVERVIEW');

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = async () => {
    const loadedItems = await api.getItems({}, 'ADMIN');
    setItems(loadedItems);

    const loadedAnalytics = await api.getAnalytics('ADMIN');
    setAnalytics(loadedAnalytics);

    const loadedHotspots = await api.getHotspots();
    setHotspots(loadedHotspots);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleExportCsv = () => {
    const csvContent = api.getAuditExportCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FindIt_Campus_Executive_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Compliance audit CSV successfully downloaded');
  };

  const handleTriggerDisposition = (dispositionType: 'DONATION' | 'AUCTION', count: number) => {
    showToast(`Dispatched ${count} expired inventory units to campus ${dispositionType}!`);
  };

  const quadrantStats = [
    { name: 'North Lab Quad', code: 'QUAD-NL', lostCount: 14, primaryCluster: 'Science Complex' },
    { name: 'South Library Quad', code: 'QUAD-SL', lostCount: 22, primaryCluster: 'Main Library 2F' },
    { name: 'West Student Quad', code: 'QUAD-WQ', lostCount: 18, primaryCluster: 'Student Union Hub' },
    { name: 'East Sports Quad', code: 'QUAD-EQ', lostCount: 9, primaryCluster: 'Varsity Arena' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white transition-colors">
      <AppHeader currentUser={currentUser} activeRoleTitle="EXECUTIVE GOVERNANCE" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Admin Hero Telemetry Banner */}
        <div className="p-6 rounded-apple-2xl studio-surface border border-hairline shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold px-2.5 py-0.5 rounded-apple-pill bg-purple-500/10 border border-purple-500/20">
                  Campus Executive IAM
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Administrator: {currentUser.email}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Institutional Telemetry & Governance
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                Campus-wide recovery analytics, thermal loss quadrant clustering, 9-stage custody compliance, and automated retention enforcement.
              </p>
            </div>

            {/* Quick CSV Export */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCsv}
                className="px-4 py-2.5 rounded-apple-pill bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-hairline pb-2 flex-wrap">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-apple-pill text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'OVERVIEW'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Executive KPI Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('HEATMAP')}
            className={`px-4 py-2 rounded-apple-pill text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'HEATMAP'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Thermal Loss Heatmap & Quadrants</span>
          </button>

          <button
            onClick={() => setActiveTab('LIFECYCLE_POLICIES')}
            className={`px-4 py-2 rounded-apple-pill text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'LIFECYCLE_POLICIES'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Custody Lifecycle & Retention Policies</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-4 py-2 rounded-apple-pill text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Compliance Audit Log ({items.length})</span>
          </button>
        </div>

        {/* TAB 1: Executive KPI Overview */}
        {activeTab === 'OVERVIEW' && analytics && (
          <CustodyAnalyticsView
            analytics={analytics}
            items={items}
            onExportCsv={handleExportCsv}
            onOpenFeedbackModal={() => setIsFeedbackOpen(true)}
          />
        )}

        {/* TAB 2: Thermal Heatmap & Quadrants */}
        {activeTab === 'HEATMAP' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quadrantStats.map((quad) => (
                <div key={quad.code} className="p-4 rounded-apple-xl studio-surface border border-hairline shadow-sm">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase mb-1">
                    <span>{quad.code}</span>
                    <Flame className="w-3 h-3 text-tesla-crimson" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {quad.lostCount} Items
                  </div>
                  <div className="text-xs font-medium text-slate-300 mt-1 truncate">
                    {quad.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
                    Hotspot: {quad.primaryCluster}
                  </div>
                </div>
              ))}
            </div>

            <CampusMapView
              items={items}
              hotspots={hotspots}
              onSelectItem={() => {}}
              userRole="ADMIN"
            />
          </div>
        )}

        {/* TAB 3: Custody Lifecycle & Retention Policies */}
        {activeTab === 'LIFECYCLE_POLICIES' && (
          <div className="space-y-6">
            <div className="p-6 rounded-apple-2xl studio-surface border border-hairline shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Retention Policies & Automated Disposition Triggers
                  </h3>
                  <p className="text-xs text-slate-500">
                    Statutory holding periods before automated transfer to Student Union Charity Donation or Annual Surplus Auction.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* 30 Days: General Goods */}
                <div className="p-5 rounded-apple-xl bg-black/[0.02] dark:bg-white/[0.03] border border-hairline space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">30-Day Policy</span>
                    <Gift className="w-4 h-4 text-amber-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">General Goods & Apparel</h4>
                  <p className="text-xs text-slate-500">Water bottles, umbrellas, jackets, notebooks, and sports gear.</p>
                  <div className="pt-2 border-t border-hairline flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Eligible: 6 items</span>
                    <button
                      onClick={() => handleTriggerDisposition('DONATION', 6)}
                      className="px-3 py-1 rounded-apple-pill bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
                    >
                      Dispatch Donation
                    </button>
                  </div>
                </div>

                {/* 60 Days: Electronics */}
                <div className="p-5 rounded-apple-xl bg-black/[0.02] dark:bg-white/[0.03] border border-hairline space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-apple-blue uppercase">60-Day Policy</span>
                    <Gavel className="w-4 h-4 text-apple-blue" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Electronics & Gadgets</h4>
                  <p className="text-xs text-slate-500">Earbuds, calculators, tablets, chargers, and Bluetooth accessories.</p>
                  <div className="pt-2 border-t border-hairline flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Eligible: 3 items</span>
                    <button
                      onClick={() => handleTriggerDisposition('AUCTION', 3)}
                      className="px-3 py-1 rounded-apple-pill bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
                    >
                      Dispatch Auction
                    </button>
                  </div>
                </div>

                {/* 90 Days: High-Value / Credentials */}
                <div className="p-5 rounded-apple-xl bg-black/[0.02] dark:bg-white/[0.03] border border-hairline space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-400 uppercase">90-Day Policy</span>
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">High Value & Credentials</h4>
                  <p className="text-xs text-slate-500">Government IDs, passports, student smartcards, and sealed jewelry.</p>
                  <div className="pt-2 border-t border-hairline flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Eligible: 2 items</span>
                    <button
                      onClick={() => showToast('Transferred to Registrar permanent vault vault')}
                      className="px-3 py-1 rounded-apple-pill bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
                    >
                      Archive Registrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Compliance Audit Log */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Compliance Audit Trail
                </h2>
                <p className="text-xs text-slate-500">
                  Full immutable transaction log of item reports, matching algorithms, claim reviews, and handover receipts.
                </p>
              </div>
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-1.5 rounded-apple-pill bg-white/10 hover:bg-white/15 border border-hairline text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-apple-blue" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="rounded-apple-xl studio-surface border border-hairline overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-hairline text-[10px] font-mono uppercase text-slate-400">
                  <tr>
                    <th className="p-3.5">Log ID / Timestamp</th>
                    <th className="p-3.5">Item Record</th>
                    <th className="p-3.5">Actor Privilege</th>
                    <th className="p-3.5">Campus Node</th>
                    <th className="p-3.5">Retention Window</th>
                    <th className="p-3.5">Custody State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-mono text-slate-400">
                        <div className="text-slate-200 font-bold">{item.id}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {item.category} &middot; {item.type}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-xs">
                        <span className="text-apple-blue font-semibold">{item.sensitive?.finderPhone || 'Verified Academic Member'}</span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono text-xs">
                        {CAMPUS_BUILDINGS.find((b) => b.id === item.buildingId)?.name || item.buildingId}
                      </td>
                      <td className="p-3.5 font-mono text-xs text-amber-400">
                        {item.retentionDays} Days
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-apple-pill text-[10px] font-mono font-bold uppercase bg-white/5 border border-hairline text-slate-300">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        claimId="admin_test_claim"
        onSubmitFeedback={async (data) => {
          await api.submitFeedback(data, 'ADMIN');
          showToast('Administrative recovery satisfaction rating saved.');
        }}
      />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-apple-pill bg-black/90 dark:bg-white/95 text-white dark:text-black text-xs font-semibold border border-hairline shadow-2xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
