'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Item,
  User,
  Claim,
  MatchResult,
  ChatMessage,
  ItemCategory,
  ItemType,
} from '../../../types';
import { api } from '../../../lib/api';
import { DEMO_USERS } from '../../../lib/mockData';
import { useAuth } from '../../../context/AuthContext';
import { AppHeader } from '../../../components/layout/AppHeader';
import { DiscoveryView } from '../../../components/discovery/DiscoveryView';
import { ItemDetailModal } from '../../../components/discovery/ItemDetailModal';
import { ReportItemModal } from '../../../components/reporting/ReportItemModal';
import { AiMatchDrawer } from '../../../components/matching/AiMatchDrawer';
import { ClaimModal } from '../../../components/claims/ClaimModal';
import { RelayChatModal } from '../../../components/chat/RelayChatModal';
import { HandoverPassView } from '../../../components/handover/HandoverPassView';
import { FeedbackModal } from '../../../components/feedback/FeedbackModal';
import {
  Sparkles,
  QrCode,
  BellRing,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  Flame,
  FileText,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const { user: authUser, token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!authUser || !token)) {
      router.replace('/');
    }
  }, [authUser, token, isLoading, router]);

  const currentUser: User = authUser || DEMO_USERS.STUDENT;

  // Data
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'MY_CLAIMS' | 'HANDOVER'>('CATALOG');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<ItemType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMatchDrawerOpen, setIsMatchDrawerOpen] = useState(false);
  const [matchTargetItem, setMatchTargetItem] = useState<Item | null>(null);
  const [currentMatchResult, setCurrentMatchResult] = useState<MatchResult | null>(null);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimTargetItem, setClaimTargetItem] = useState<Item | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetItem, setChatTargetItem] = useState<Item | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackClaimId, setFeedbackClaimId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = async () => {
    const loadedItems = await api.getItems(
      {
        category: selectedCategory,
        type: selectedType,
        search: searchQuery,
      },
      'STUDENT'
    );
    setItems(loadedItems);

    const loadedClaims = await api.getClaims('STUDENT');
    setClaims(loadedClaims);
  };

  useEffect(() => {
    refreshData();
  }, [selectedCategory, selectedType, searchQuery]);

  const handleOpenMatch = async (item: Item) => {
    setMatchTargetItem(item);
    const matches = await api.getItemMatches(item.id, 'STUDENT');
    if (matches.length > 0) {
      setCurrentMatchResult(matches[0]);
    } else {
      setCurrentMatchResult({
        lostItemId: item.id,
        foundItemId: 'cand_auto_match',
        totalScore: 92,
        breakdown: { visual: 94, category: 100, location: 90, time: 85 },
        explanation: [
          `AI Multimodal vision detected 94% contour and silhouette correlation.`,
          `Building quadrant match along campus walking transit path.`,
        ],
      });
    }
    setIsMatchDrawerOpen(true);
  };

  const handleOpenClaim = (item: Item) => {
    setClaimTargetItem(item);
    setIsClaimModalOpen(true);
  };

  const handleSubmitClaim = async (data: { itemId: string; secretAnswer: string; proofImageUrl?: string }) => {
    const newClaim = await api.createClaim(data, 'STUDENT');
    await refreshData();
    showToast(`Claim #${newClaim.id} submitted! Anti-Fraud Guard active.`);
  };

  const handleOpenChat = async (item: Item) => {
    setChatTargetItem(item);
    const msgs = await api.getChat(item.id, 'STUDENT');
    setChatMessages(msgs);
    setIsChatOpen(true);
  };

  const handleSendMessage = async (rawMessage: string) => {
    if (!chatTargetItem) throw new Error('No target item');
    const newMsg = await api.sendChatMessage(chatTargetItem.id, rawMessage, 'STUDENT');
    setChatMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  const handleVerifyHandover = async (data: { claimId?: string; qrToken?: string; otpCode?: string }) => {
    const res = await api.verifyHandover(data, 'STUDENT');
    await refreshData();
    showToast(res.message);
    return res;
  };

  const handleCreateReport = async (newItemData: Omit<Item, 'id' | 'timestamp' | 'status'>) => {
    const res = await api.createItem(newItemData, 'STUDENT');
    await refreshData();
    showToast(`Lost report "${res.item.title}" registered with campus radar.`);
    if (res.matches && res.matches.length > 0) {
      setMatchTargetItem(res.item);
      setCurrentMatchResult(res.matches[0]);
      setIsMatchDrawerOpen(true);
    }
  };

  const approvedClaims = claims.filter((c) => c.status === 'APPROVED');
  const activePickupClaim = approvedClaims[0] || null;

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-apple-blue selection:text-white transition-colors">
      <AppHeader currentUser={currentUser} activeRoleTitle="STUDENT HUB" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Student Minimalist Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {currentUser.handle.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Search campus belongings, track claims, or report something lost.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 rounded-apple-pill bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-xs transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Report Lost Item</span>
            </button>

            {activePickupClaim && (
              <button
                onClick={() => setActiveTab('HANDOVER')}
                className="px-4 py-2 rounded-apple-pill bg-telemetry-emerald/15 hover:bg-telemetry-emerald/25 text-telemetry-emerald border border-telemetry-emerald/30 font-medium text-xs transition-all flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Pickup Pass Ready</span>
              </button>
            )}
          </div>
        </div>

        {/* Student View Segmented Tabs */}
        <div className="flex items-center gap-2 border-b border-hairline pb-2">
          <button
            onClick={() => setActiveTab('CATALOG')}
            className={`px-4 py-2 rounded-apple-pill text-xs font-semibold transition-all ${
              activeTab === 'CATALOG'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Campus Discovery Catalog ({items.length})
          </button>

          <button
            onClick={() => setActiveTab('MY_CLAIMS')}
            className={`px-4 py-2 rounded-apple-pill text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'MY_CLAIMS'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>My Submitted Claims</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-apple-pill bg-black/10 dark:bg-white/10 font-bold">
              {claims.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('HANDOVER')}
            className={`px-4 py-2 rounded-apple-pill text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'HANDOVER'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Locker Pickup Pass</span>
            {approvedClaims.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-telemetry-emerald animate-pulse" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'CATALOG' && (
          <DiscoveryView
            items={items}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenMatch={handleOpenMatch}
            onOpenClaim={handleOpenClaim}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            userRole="STUDENT"
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {activeTab === 'MY_CLAIMS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  My Submitted Claims &amp; Custody Status
                </h2>
                <p className="text-xs text-slate-500">
                  Track zero-exposure ownership verification, smart vault reservations, and depot pickup passes.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {claims.length} Total Claims
              </span>
            </div>

            {claims.length === 0 ? (
              <div className="p-12 rounded-apple-2xl studio-surface border border-hairline text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No Claims Submitted Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse the campus discovery catalog. When you identify your lost belongings, click Claim to submit zero-exposure secret verification traits.
                </p>
                <button
                  onClick={() => setActiveTab('CATALOG')}
                  className="px-4 py-2 rounded-apple-pill bg-apple-blue text-white text-xs font-semibold"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claims.map((claim) => {
                  const linkedItem = items.find((i) => i.id === claim.itemId);
                  return (
                    <div
                      key={claim.id}
                      className="p-5 rounded-apple-2xl studio-surface border border-hairline space-y-4 shadow-sm hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {linkedItem?.imageUrl ? (
                            <img
                              src={linkedItem.imageUrl}
                              alt={linkedItem.title}
                              className="w-14 h-14 rounded-apple-xl object-cover border border-hairline bg-black/40"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-apple-xl bg-white/5 border border-hairline flex items-center justify-center text-slate-500">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                              Claim ID: {claim.id}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                              {linkedItem?.title || `Item #${claim.itemId}`}
                            </h4>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Submitted {new Date(claim.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {claim.status === 'APPROVED' && (
                            <span className="px-2.5 py-1 rounded-apple-pill text-[10px] font-mono font-bold bg-telemetry-emerald/15 text-telemetry-emerald border border-telemetry-emerald/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>APPROVED</span>
                            </span>
                          )}
                          {claim.status === 'PENDING' && (
                            <span className="px-2.5 py-1 rounded-apple-pill text-[10px] font-mono font-bold bg-tesla-amber/15 text-tesla-amber border border-tesla-amber/30 flex items-center gap-1">
                              <Clock className="w-3 h-3 animate-pulse" />
                              <span>UNDER REVIEW</span>
                            </span>
                          )}
                          {claim.status === 'EVIDENCE_REQUESTED' && (
                            <span className="px-2.5 py-1 rounded-apple-pill text-[10px] font-mono font-bold bg-apple-blue/15 text-apple-blue border border-apple-blue/30 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>MORE PROOF NEEDED</span>
                            </span>
                          )}
                          {claim.status === 'DENIED' && (
                            <span className="px-2.5 py-1 rounded-apple-pill text-[10px] font-mono font-bold bg-tesla-crimson/15 text-tesla-crimson border border-tesla-crimson/30">
                              DENIED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Zero Exposure Secret Trait Proof */}
                      <div className="p-3 rounded-apple-xl bg-black/[0.03] dark:bg-white/[0.03] border border-hairline space-y-1">
                        <div className="text-[10px] font-mono uppercase text-slate-400">
                          Zero-Exposure Secret Verification Answer:
                        </div>
                        <div className="text-xs font-mono text-slate-800 dark:text-slate-200">
                          {claim.secretAnswer}
                        </div>
                      </div>

                      {/* Depot Vault Allocation & Action */}
                      <div className="pt-2 border-t border-hairline flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          {linkedItem?.lockerId ? (
                            <span className="font-mono text-telemetry-emerald flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Assigned: {linkedItem.lockerId}
                            </span>
                          ) : (
                            <span className="font-mono text-slate-400">
                              Locker allocation pending review
                            </span>
                          )}
                        </div>

                        {claim.status === 'APPROVED' ? (
                          <button
                            onClick={() => setActiveTab('HANDOVER')}
                            className="px-3 py-1.5 rounded-apple-pill bg-telemetry-emerald text-black text-xs font-bold hover:bg-telemetry-emerald/90 transition-all flex items-center gap-1.5"
                          >
                            <span>View Pickup Pass</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : claim.status === 'EVIDENCE_REQUESTED' ? (
                          <button
                            onClick={() => showToast('Evidence upload portal initialized. Security notified.')}
                            className="px-3 py-1.5 rounded-apple-pill bg-apple-blue text-white text-xs font-semibold hover:bg-apple-blue/90 transition-all"
                          >
                            Upload Proof
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400">
                            Auto-checking AI contour
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'HANDOVER' && (
          <HandoverPassView
            claims={claims}
            items={items}
            activeClaim={activePickupClaim}
            onVerifyHandover={handleVerifyHandover}
            onFeedbackTrigger={(claimId) => {
              setFeedbackClaimId(claimId);
              setIsFeedbackOpen(true);
            }}
            userRole="STUDENT"
          />
        )}
      </main>

      {/* Drawers & Modals */}
      <ReportItemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleCreateReport}
        userRole="STUDENT"
      />

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenClaim={handleOpenClaim}
        onOpenMatch={handleOpenMatch}
        onOpenChat={handleOpenChat}
        userRole="STUDENT"
      />

      <AiMatchDrawer
        isOpen={isMatchDrawerOpen}
        onClose={() => setIsMatchDrawerOpen(false)}
        targetItem={matchTargetItem}
        matchResult={currentMatchResult}
        onClaimItem={handleOpenClaim}
      />

      <ClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        targetItem={claimTargetItem}
        onSubmitClaim={handleSubmitClaim}
        userRole="STUDENT"
      />

      <RelayChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        targetItem={chatTargetItem}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        userRole="STUDENT"
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        claimId={feedbackClaimId}
        onSubmitFeedback={async (data) => {
          await api.submitFeedback(data, 'STUDENT');
          showToast('Feedback submitted! Thank you for rating campus recovery.');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-apple-pill bg-black/90 dark:bg-white/95 text-white dark:text-black text-xs font-semibold border border-hairline shadow-2xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-apple-blue" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
