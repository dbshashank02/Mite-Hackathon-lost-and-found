'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Item,
  User,
  Claim,
  UserRole,
} from '../../../types';
import { api } from '../../../lib/api';
import { DEMO_USERS, CAMPUS_BUILDINGS } from '../../../lib/mockData';
import { useAuth } from '../../../context/AuthContext';
import { AppHeader } from '../../../components/layout/AppHeader';
import { ClaimsQueueView } from '../../../components/claims/ClaimsQueueView';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Lock,
  Unlock,
  QrCode,
  Scan,
  AlertTriangle,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Search,
  RefreshCw,
} from 'lucide-react';

interface VaultLocker {
  id: string; // e.g. "L-01"
  status: 'AVAILABLE' | 'OCCUPIED' | 'AWAITING_PICKUP' | 'MAINTENANCE';
  itemTitle?: string;
  itemId?: string;
  claimId?: string;
  assignedTo?: string;
}

export default function SecurityDashboard() {
  const router = useRouter();
  const { user: authUser, token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!authUser || !token)) {
      router.replace('/');
    }
  }, [authUser, token, isLoading, router]);

  const currentUser: User = authUser || DEMO_USERS.SECURITY;

  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<'CLAIMS_QUEUE' | 'VAULT_GRID' | 'HANDOVER_SCANNER' | 'UNMASKED_INVENTORY'>('CLAIMS_QUEUE');

  // Scanner Terminal State
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    item?: any;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // 50-Locker Vault Status Grid
  const [lockers, setLockers] = useState<VaultLocker[]>(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const id = `L-${(i + 1).toString().padStart(2, '0')}`;
      if (i === 3) {
        return {
          id,
          status: 'AWAITING_PICKUP',
          itemTitle: 'Apple AirPods Pro Gen 2',
          itemId: 'item_2',
          claimId: 'claim_1',
          assignedTo: 'alex.rivera@university.edu',
        };
      }
      if (i === 7) {
        return {
          id,
          status: 'OCCUPIED',
          itemTitle: 'HydroFlask Obsidian 32oz',
          itemId: 'item_4',
        };
      }
      if (i === 13) {
        return {
          id,
          status: 'AWAITING_PICKUP',
          itemTitle: 'Casio Vintage Digital Watch',
          itemId: 'item_5',
          claimId: 'claim_2',
          assignedTo: 'marcus.chen@university.edu',
        };
      }
      if (i % 6 === 0) {
        return {
          id,
          status: 'OCCUPIED',
          itemTitle: `Found Belonging Depot Unit #${i + 10}`,
        };
      }
      return { id, status: 'AVAILABLE' };
    });
  });

  const [selectedLocker, setSelectedLocker] = useState<VaultLocker | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = async () => {
    const loadedItems = await api.getItems({}, 'SECURITY');
    setItems(loadedItems);

    const loadedClaims = await api.getClaims('SECURITY');
    setClaims(loadedClaims);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleReviewClaim = async (
    claimId: string,
    action: 'APPROVE' | 'REQUEST_EVIDENCE' | 'DENY',
    lockerId?: string
  ) => {
    await api.reviewClaim(claimId, action, lockerId, 'SECURITY');
    await refreshData();
    showToast(`Claim #${claimId}: ${action} successfully`);

    if (action === 'APPROVE' && lockerId) {
      setLockers((prev) =>
        prev.map((l) =>
          l.id === lockerId || lockerId.includes(l.id)
            ? { ...l, status: 'AWAITING_PICKUP', claimId }
            : l
        )
      );
    }
  };

  // Handover Scanner Verification
  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    try {
      setIsScanning(true);
      const isOtp = /^\d{6}$/.test(scanInput.trim());
      const payload = isOtp
        ? { otpCode: scanInput.trim() }
        : { qrToken: scanInput.trim() };

      const res = await api.verifyHandover(payload, 'SECURITY');
      setScanResult({
        success: true,
        message: res.message,
        item: res.item,
      });

      // Automatically release and free the locker upon successful handover
      const releasedLockerId = res.item?.lockerId;
      if (releasedLockerId) {
        setLockers((prev) =>
          prev.map((l) =>
            l.id === releasedLockerId || releasedLockerId.includes(l.id)
              ? { ...l, status: 'AVAILABLE', itemTitle: undefined, itemId: undefined, claimId: undefined, assignedTo: undefined }
              : l
          )
        );
      }

      await refreshData();
      showToast(`Verification SUCCESS! Item marked RETURNED & locker unlatched.`);
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err?.message || 'Verification token invalid or expired.',
      });
      showToast('Handover verification failed: Invalid Token');
    } finally {
      setIsScanning(false);
    }
  };

  // Dedicated Locker Override Controller
  const handleLockerAction = (lockerId: string, newStatus: VaultLocker['status'], note?: string) => {
    setLockers((prev) =>
      prev.map((l) => {
        if (l.id === lockerId) {
          const updated: VaultLocker = {
            ...l,
            status: newStatus,
            itemTitle: newStatus === 'AVAILABLE' ? undefined : (note || l.itemTitle),
            itemId: newStatus === 'AVAILABLE' ? undefined : l.itemId,
            claimId: newStatus === 'AVAILABLE' ? undefined : l.claimId,
            assignedTo: newStatus === 'AVAILABLE' ? undefined : l.assignedTo,
          };
          if (selectedLocker?.id === lockerId) {
            setSelectedLocker(updated);
          }
          return updated;
        }
        return l;
      })
    );
    showToast(`Locker ${lockerId} status transitioned to ${newStatus}`);
  };

  const occupiedCount = lockers.filter((l) => l.status === 'OCCUPIED' || l.status === 'AWAITING_PICKUP').length;
  const availableCount = lockers.filter((l) => l.status === 'AVAILABLE').length;

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-tesla-amber selection:text-black transition-colors">
      <AppHeader currentUser={currentUser} activeRoleTitle="CAMPUS SECURITY VAULT" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Security Minimalist Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Campus Security &amp; Vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verify claims, authenticate pickup passes, and manage depot lockers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-apple-pill bg-black/5 dark:bg-white/5 border border-hairline text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-tesla-amber" />
              <span>{occupiedCount}/50 Lockers Occupied</span>
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-hairline pb-2 flex-wrap">
          <button
            onClick={() => setActiveTab('CLAIMS_QUEUE')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'CLAIMS_QUEUE'
                ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white border border-hairline shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF4A36]" />
            <span>Review Claims ({claims.length})</span>
            {claims.some((c) => c.status === 'PENDING') && (
              <span className="w-2 h-2 rounded-full bg-[#FF4A36] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('HANDOVER_SCANNER')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'HANDOVER_SCANNER'
                ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white border border-hairline shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scan className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Handover Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('VAULT_GRID')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'VAULT_GRID'
                ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white border border-hairline shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#FBE74E]" />
            <span>Smart Lockers</span>
          </button>

          <button
            onClick={() => setActiveTab('UNMASKED_INVENTORY')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'UNMASKED_INVENTORY'
                ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white border border-hairline shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#00D084]" />
            <span>Depot Inventory</span>
          </button>
        </div>

        {/* TAB 1: Claims Verification Queue */}
        {activeTab === 'CLAIMS_QUEUE' && (
          <ClaimsQueueView
            claims={claims}
            items={items}
            onReviewClaim={handleReviewClaim}
            onOpenHandoverPass={() => setActiveTab('HANDOVER_SCANNER')}
            userRole="SECURITY"
          />
        )}

        {/* TAB 2: Physical Handover Scanner Terminal */}
        {activeTab === 'HANDOVER_SCANNER' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 space-y-4">
              <div className="p-6 rounded-apple-2xl studio-surface border border-hairline shadow-lg space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-apple-md bg-tesla-amber/10 border border-tesla-amber/20 flex items-center justify-center text-tesla-amber">
                    <Scan className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                      Physical Handover Terminal
                    </h2>
                    <p className="text-xs text-slate-500">
                      Validate claimant QR token or 6-digit rotating OTP code at physical depot locker.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleScanSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                      Scan QR Token or Enter 6-Digit OTP
                    </label>
                    <div className="relative">
                      <QrCode className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. OTP 849201 or QR pass string"
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-apple-md bg-black/[0.02] dark:bg-white/5 border border-hairline font-mono text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-tesla-amber"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isScanning}
                      className="flex-1 py-3 rounded-apple-pill bg-tesla-amber hover:bg-tesla-amber/90 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Scan className="w-4 h-4" />
                      <span>{isScanning ? 'Verifying...' : 'Verify Token & Release Handover'}</span>
                    </button>

                    {/* Preload sample button for quick hackathon demo */}
                    <button
                      type="button"
                      onClick={() => setScanInput('849201')}
                      className="px-3 py-3 rounded-apple-pill bg-white/5 hover:bg-white/10 border border-hairline text-slate-400 hover:text-white text-xs font-mono"
                      title="Load demo OTP"
                    >
                      Demo OTP
                    </button>
                  </div>
                </form>

                {/* Scan Result Feedback Card */}
                {scanResult && (
                  <div
                    className={`p-4 rounded-apple-xl border transition-all ${
                      scanResult.success
                        ? 'bg-telemetry-emerald/10 border-telemetry-emerald/30 text-telemetry-emerald'
                        : 'bg-tesla-crimson/10 border-tesla-crimson/30 text-tesla-crimson'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      {scanResult.success ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span>{scanResult.success ? 'HANDOVER VERIFIED' : 'VERIFICATION REJECTED'}</span>
                    </div>
                    <p className="text-xs opacity-90">{scanResult.message}</p>
                    {scanResult.item && (
                      <div className="mt-2 text-xs font-mono text-slate-300">
                        Item Status: <strong>{scanResult.item.status}</strong> &middot; Custody marked as RETURNED.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4 p-6 rounded-apple-2xl studio-surface border border-hairline">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Handover Verification Protocol
              </h3>
              <p className="text-xs text-slate-500">
                Staff procedure for physical depot return and contactless smart locker custody:
              </p>
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-apple-lg bg-black/[0.02] dark:bg-white/[0.02] border border-hairline text-xs">
                  <span className="font-bold text-white block mb-0.5">1. Physical Photo ID Check</span>
                  <span className="text-slate-400">Match claimant photo against university SSO registrar profile before locker door release.</span>
                </div>
                <div className="p-3 rounded-apple-lg bg-black/[0.02] dark:bg-white/[0.02] border border-hairline text-xs">
                  <span className="font-bold text-white block mb-0.5">2. Token Cryptographic Audit</span>
                  <span className="text-slate-400">The 6-digit OTP expires 48 hours post-approval. Scan executes atomic state transition to RETURNED.</span>
                </div>
                <div className="p-3 rounded-apple-lg bg-black/[0.02] dark:bg-white/[0.02] border border-hairline text-xs">
                  <span className="font-bold text-white block mb-0.5">3. Vault Latch Self-Audit</span>
                  <span className="text-slate-400">Once item is removed, the smart locker latch sensor auto-resets locker status to AVAILABLE.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Visual 50-Locker Smart Vault Grid */}
        {activeTab === 'VAULT_GRID' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-apple-xl studio-surface border border-hairline">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Student Union Smart Vault Depot (50 Lockers)
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time status of automated magnetic lock bays. Click any locker for manual override or release.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-telemetry-emerald" />
                  <span className="text-slate-400">Available ({availableCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-tesla-amber" />
                  <span className="text-slate-400">Awaiting Pickup</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <span className="text-slate-400">Occupied</span>
                </div>
              </div>
            </div>

            {/* 50-Locker Grid (10x5) */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {lockers.map((locker) => {
                const isAvail = locker.status === 'AVAILABLE';
                const isPickup = locker.status === 'AWAITING_PICKUP';
                const isOcc = locker.status === 'OCCUPIED';

                return (
                  <div
                    key={locker.id}
                    onClick={() => setSelectedLocker(locker)}
                    className={`p-3 rounded-apple-lg border cursor-pointer transition-all flex flex-col justify-between aspect-square group relative ${
                      isAvail
                        ? 'bg-telemetry-emerald/5 hover:bg-telemetry-emerald/15 border-telemetry-emerald/20 text-telemetry-emerald'
                        : isPickup
                        ? 'bg-tesla-amber/10 hover:bg-tesla-amber/20 border-tesla-amber/30 text-tesla-amber'
                        : 'bg-black/40 hover:bg-black/60 border-hairline text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold">{locker.id}</span>
                      {isAvail ? (
                        <Unlock className="w-3 h-3 opacity-60" />
                      ) : (
                        <Lock className="w-3 h-3 opacity-80" />
                      )}
                    </div>

                    <div className="truncate text-[9px] font-mono leading-tight">
                      {isAvail ? 'FREE' : isPickup ? 'READY' : 'HELD'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Unmasked Forensic Telemetry */}
        {activeTab === 'UNMASKED_INVENTORY' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Unmasked Security Forensic Telemetry
                </h2>
                <p className="text-xs text-slate-500">
                  Privileged staff view: Hidden serial numbers, private engravings, and sensitive traits revealed.
                </p>
              </div>
              <span className="text-xs font-mono text-tesla-amber font-bold px-2.5 py-0.5 rounded-apple-pill bg-tesla-amber/10 border border-tesla-amber/20">
                UNMASKED PRIVILEGE
              </span>
            </div>

            <div className="rounded-apple-xl studio-surface border border-hairline overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-hairline text-[10px] font-mono uppercase text-slate-400">
                  <tr>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Unmasked Serial / IMEI</th>
                    <th className="p-3.5">Private Markings</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-10 h-10 rounded-apple-sm object-cover border border-hairline"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            ID: {item.id}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{item.category}</td>
                      <td className="p-3.5 text-slate-300">
                        {CAMPUS_BUILDINGS.find((b) => b.id === item.buildingId)?.name || item.buildingId}
                      </td>
                      <td className="p-3.5 font-mono text-apple-blue font-bold">
                        {item.sensitive.serialNumber}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 text-[11px] max-w-xs">
                        {item.sensitive.privateTraits}
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

      {/* Smart Locker Detail Modal */}
      {selectedLocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-apple-2xl studio-surface border border-hairline p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-apple-md bg-tesla-amber/15 text-tesla-amber flex items-center justify-center font-mono font-bold text-xs">
                  {selectedLocker.id}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Vault Bay {selectedLocker.id}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Magnetic Lock Controller
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedLocker(null)}
                className="p-1 rounded-apple-pill hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Locker Status & Telemetry */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-apple-xl bg-black/[0.02] dark:bg-white/[0.03] border border-hairline">
                <span className="text-xs text-slate-400 font-mono">Current Latch State</span>
                <span
                  className={`px-2.5 py-0.5 rounded-apple-pill text-[10px] font-mono font-bold uppercase ${
                    selectedLocker.status === 'AVAILABLE'
                      ? 'bg-telemetry-emerald/15 text-telemetry-emerald border border-telemetry-emerald/30'
                      : selectedLocker.status === 'AWAITING_PICKUP'
                      ? 'bg-tesla-amber/15 text-tesla-amber border border-tesla-amber/30'
                      : selectedLocker.status === 'MAINTENANCE'
                      ? 'bg-tesla-crimson/15 text-tesla-crimson border border-tesla-crimson/30'
                      : 'bg-white/10 text-slate-300 border border-white/20'
                  }`}
                >
                  {selectedLocker.status}
                </span>
              </div>

              {selectedLocker.itemTitle ? (
                <div className="p-3.5 rounded-apple-xl bg-black/[0.02] dark:bg-white/[0.03] border border-hairline space-y-2">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    Stored Item
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedLocker.itemTitle}
                  </div>
                  {selectedLocker.assignedTo && (
                    <div className="text-xs font-mono text-telemetry-emerald">
                      Claimant: {selectedLocker.assignedTo}
                    </div>
                  )}
                  {selectedLocker.claimId && (
                    <div className="text-[11px] font-mono text-slate-400">
                      Linked Claim: #{selectedLocker.claimId}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-apple-xl bg-black/[0.02] dark:bg-white/[0.03] border border-hairline text-center text-xs text-slate-500 font-mono">
                  Bay is currently empty and unreserved. Ready for custody deposit.
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-hairline">
              <button
                onClick={() => handleLockerAction(selectedLocker.id, 'AVAILABLE')}
                className="w-full py-2.5 rounded-apple-pill bg-telemetry-emerald hover:bg-telemetry-emerald/90 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Manual Latch Release (Mark Available)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleLockerAction(selectedLocker.id, 'OCCUPIED', 'Manual Vault Hold')}
                  className="py-2 rounded-apple-pill bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-hairline text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3 h-3" />
                  <span>Force Occupied</span>
                </button>

                <button
                  onClick={() => handleLockerAction(selectedLocker.id, 'MAINTENANCE')}
                  className="py-2 rounded-apple-pill bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-hairline text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3 h-3 text-tesla-crimson" />
                  <span>Maintenance Lock</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-apple-pill bg-black/90 dark:bg-white/95 text-white dark:text-black text-xs font-semibold border border-hairline shadow-2xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-tesla-amber" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
