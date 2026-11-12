'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { ItemDetailModal } from '../../../components/discovery/ItemDetailModal';
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
  const router = useRouter();
  const { user: authUser, token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!authUser || !token)) {
      router.replace('/');
    }
  }, [authUser, token, isLoading, router]);

  const currentUser: User = authUser || DEMO_USERS.ADMIN;

  const [items, setItems] = useState<Item[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [hotspots, setHotspots] = useState<HotspotZone[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HEATMAP' | 'LIFECYCLE_POLICIES' | 'AUDIT_LOGS'>('OVERVIEW');

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
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

  // Dynamic retention cohorts
  const eligible30 = items.filter(
    (i) => i.retentionDays === 30 && i.status !== 'AUCTION_DONATED' && i.status !== 'RETURNED'
  );
  const eligible60 = items.filter(
    (i) => i.retentionDays === 60 && i.status !== 'AUCTION_DONATED' && i.status !== 'RETURNED'
  );
  const eligible90 = items.filter(
    (i) => i.retentionDays === 90 && i.status !== 'AUCTION_DONATED' && i.status !== 'RETURNED'
  );

  const handleTriggerDisposition = async (dispositionType: 'DONATION' | 'AUCTION' | 'REGISTRAR', retentionDays: 30 | 60 | 90) => {
    const targets = items.filter(
      (i) => i.retentionDays === retentionDays && i.status !== 'AUCTION_DONATED' && i.status !== 'RETURNED'
    );
    if (targets.length === 0) {
      showToast(`No items currently pending disposition for ${dispositionType}`);
      return;
    }

    try {
      await Promise.all(
        targets.map((item) =>
          api.updateItemStatus(item.id, dispositionType === 'REGISTRAR' ? 'LOGGED_IN_DEPOT' : 'AUCTION_DONATED', undefined, 'ADMIN')
        )
      );
      await refreshData();
      showToast(`Successfully dispatched ${targets.length} units to ${dispositionType}!`);
    } catch (e: any) {
      showToast(e?.message || 'Disposition processing error');
    }
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
        {/* Admin Minimalist Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Campus Governance &amp; Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Campus-wide recovery metrics, loss heatmaps, and retention enforcement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-4 py-2 rounded-full bg-[#FF4A36] hover:bg-[#FF5C47] text-white font-medium text-xs transition-all shadow-md shadow-[#FF4A36]/20 flex items-center gap-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-hairline pb-2 flex-wrap">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'OVERVIEW'
                ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white border border-hairline shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('HEATMAP')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'HEATMAP'
                ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white border border-hairline shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#FF4A36]" />
            <span>Campus Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('LIFECYCLE_POLICIES')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'LIFECYCLE_POLICIES'
                ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white border border-hairline shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#FBE74E]" />
            <span>Retention Policies</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white border border-hairline shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00D084]" />
            <span>Audit Log ({items.length})</span>
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
              onSelectItem={(item) => setSelectedItem(item)}
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
                    <span className="text-xs font-mono text-slate-400">
                      Eligible: {eligible30.length} items
                    </span>
                    <button
                      onClick={() => handleTriggerDisposition('DONATION', 30)}
                      disabled={eligible30.length === 0}
                      className={`px-3 py-1 rounded-apple-pill text-xs font-semibold transition-all ${
                        eligible30.length === 0
                          ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
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
                    <span className="text-xs font-mono text-slate-400">
                      Eligible: {eligible60.length} items
                    </span>
                    <button
                      onClick={() => handleTriggerDisposition('AUCTION', 60)}
                      disabled={eligible60.length === 0}
                      className={`px-3 py-1 rounded-apple-pill text-xs font-semibold transition-all ${
                        eligible60.length === 0
                          ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
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
                    <span className="text-xs font-mono text-slate-400">
                      Eligible: {eligible90.length} items
                    </span>
                    <button
                      onClick={() => handleTriggerDisposition('REGISTRAR', 90)}
                      disabled={eligible90.length === 0}
                      className={`px-3 py-1 rounded-apple-pill text-xs font-semibold transition-all ${
                        eligible90.length === 0
                          ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
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

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onOpenClaim={() => showToast('Claim review opened in security queue.')}
          onOpenMatch={() => showToast('AI contour comparison stream opened.')}
          onOpenChat={() => showToast('Staff relay encrypted channel opened.')}
          userRole="ADMIN"
        />
      )}

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
