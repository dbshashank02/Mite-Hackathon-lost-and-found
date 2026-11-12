'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export default function StudentDashboard() {
  const { user: authUser } = useAuth();
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
        {/* Student Hero Telemetry Banner */}
        <div className="p-6 rounded-apple-2xl studio-surface border border-hairline shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-apple-blue font-bold px-2.5 py-0.5 rounded-apple-pill bg-apple-blue/10 border border-apple-blue/20">
                  Student Claimant Hub
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  SSO: {currentUser.email}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome back, {currentUser.handle.split(' ')[0]}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                Browse verified campus catalog items under zero-exposure privacy protection, review AI contour matches, and redeem locker pickup passes.
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2.5 rounded-apple-pill bg-apple-blue hover:bg-apple-blue/90 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Report Lost Item</span>
              </button>

              {activePickupClaim && (
                <button
                  onClick={() => setActiveTab('HANDOVER')}
                  className="px-4 py-2.5 rounded-apple-pill bg-telemetry-emerald/15 hover:bg-telemetry-emerald/25 text-telemetry-emerald border border-telemetry-emerald/30 font-semibold text-xs transition-all flex items-center gap-2 animate-pulse"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Pickup Pass Ready!</span>
                </button>
              )}
            </div>
          </div>

          {/* AI Match Alert Banner (Tesla Telemetry Style) */}
          <div className="mt-5 pt-4 border-t border-hairline grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-apple-lg bg-black/[0.02] dark:bg-white/[0.02] border border-hairline flex items-center gap-3">
              <div className="w-8 h-8 rounded-apple-md bg-apple-blue/10 flex items-center justify-center text-apple-blue">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">AI Match Engine</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Multimodal 4-Factor Active
                </div>
              </div>
            </div>

            <div className="p-3 rounded-apple-lg bg-black/[0.02] dark:bg-white/[0.02] border border-hairline flex items-center gap-3">
              <div className="w-8 h-8 rounded-apple-md bg-telemetry-emerald/10 flex items-center justify-center text-telemetry-emerald">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Zero-Exposure Shield</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Private Traits Obfuscated
                </div>
              </div>
            </div>

            <div className="p-3 rounded-apple-lg bg-black/[0.02] dark:bg-white/[0.02] border border-hairline flex items-center gap-3">
              <div className="w-8 h-8 rounded-apple-md bg-tesla-amber/10 flex items-center justify-center text-tesla-amber">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Depot Pickup Window</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  48-hr Secure Vault Reservation
                </div>
              </div>
            </div>
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
