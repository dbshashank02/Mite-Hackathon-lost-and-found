'use client';

import React, { useState, useEffect } from 'react';
import {
  Item,
  User,
  UserRole,
  Claim,
  MatchResult,
  ChatMessage,
  ItemCategory,
  ItemType,
  AnalyticsSummary,
  HotspotZone,
} from '../types';
import { api } from '../lib/api';
import { DEMO_USERS } from '../lib/mockData';
import { Navbar } from '../components/layout/Navbar';
import { BottomDock, ActiveTab } from '../components/layout/BottomDock';
import { CampusGatekeeper } from '../components/auth/CampusGatekeeper';
import { DiscoveryView } from '../components/discovery/DiscoveryView';
import { ItemDetailModal } from '../components/discovery/ItemDetailModal';
import { ReportItemModal } from '../components/reporting/ReportItemModal';
import { AiMatchDrawer } from '../components/matching/AiMatchDrawer';
import { CampusMapView } from '../components/map/CampusMapView';
import { ClaimModal } from '../components/claims/ClaimModal';
import { ClaimsQueueView } from '../components/claims/ClaimsQueueView';
import { HandoverPassView } from '../components/handover/HandoverPassView';
import { RelayChatModal } from '../components/chat/RelayChatModal';
import { CustodyAnalyticsView } from '../components/analytics/CustodyAnalyticsView';
import { FeedbackModal } from '../components/feedback/FeedbackModal';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS.STUDENT);
  const [activeTab, setActiveTab] = useState<ActiveTab>('DISCOVERY');

  // Core Data
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [hotspots, setHotspots] = useState<HotspotZone[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<ItemType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isGatekeeperOpen, setIsGatekeeperOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // AI Match Drawer
  const [isMatchDrawerOpen, setIsMatchDrawerOpen] = useState(false);
  const [matchTargetItem, setMatchTargetItem] = useState<Item | null>(null);
  const [currentMatchResult, setCurrentMatchResult] = useState<MatchResult | null>(null);

  // Claim Modal
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimTargetItem, setClaimTargetItem] = useState<Item | null>(null);

  // Chat Modal
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetItem, setChatTargetItem] = useState<Item | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Feedback Modal
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackClaimId, setFeedbackClaimId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshData = async () => {
    const loadedItems = await api.getItems(
      {
        category: selectedCategory,
        type: selectedType,
        search: searchQuery,
      },
      currentUser.role
    );
    setItems(loadedItems);

    const loadedClaims = await api.getClaims(currentUser.role);
    setClaims(loadedClaims);

    const loadedHotspots = await api.getHotspots();
    setHotspots(loadedHotspots);

    const loadedAnalytics = await api.getAnalytics(currentUser.role);
    setAnalytics(loadedAnalytics);
  };

  useEffect(() => {
    refreshData();
  }, [selectedCategory, selectedType, searchQuery, currentUser.role]);

  const handleRoleChange = (role: UserRole) => {
    const newUser = DEMO_USERS[role] || {
      id: `usr_${role.toLowerCase()}`,
      email: `${role.toLowerCase()}@university.edu`,
      handle: `${role.charAt(0) + role.slice(1).toLowerCase()} User`,
      role,
      department: 'Campus User',
      verifiedBadge: true,
    };
    setCurrentUser(newUser);
    showToast(`Role switched to: ${role}`);
  };

  const handleGatekeeperLogin = async (email: string, role: UserRole) => {
    const res = await api.login(email, role);
    setCurrentUser(res.user);
    showToast(`Authenticated as ${res.user.handle} (${role})`);
  };

  const handleCreateItem = async (newItemData: Omit<Item, 'id' | 'timestamp' | 'status'>) => {
    const res = await api.createItem(newItemData, currentUser.role);
    await refreshData();
    showToast(`Item "${res.item.title}" registered in Depot`);
    if (res.matches && res.matches.length > 0) {
      setMatchTargetItem(res.item);
      setCurrentMatchResult(res.matches[0]);
      setIsMatchDrawerOpen(true);
    }
  };

  const handleOpenMatch = async (item: Item) => {
    setMatchTargetItem(item);
    const matches = await api.getItemMatches(item.id, currentUser.role);
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
    const newClaim = await api.createClaim(data, currentUser.role);
    await refreshData();
    showToast(`Claim #${newClaim.id} logged with Anti-Fraud Guard`);
  };

  const handleReviewClaim = async (
    claimId: string,
    action: 'APPROVE' | 'REQUEST_EVIDENCE' | 'DENY',
    lockerId?: string
  ) => {
    await api.reviewClaim(claimId, action, lockerId, currentUser.role);
    await refreshData();
    showToast(`Claim #${claimId}: ${action}`);
  };

  const handleVerifyHandover = async (data: { claimId?: string; qrToken?: string; otpCode?: string }) => {
    const res = await api.verifyHandover(data, currentUser.role);
    await refreshData();
    showToast(res.message);
    return res;
  };

  const handleOpenChat = async (item: Item) => {
    setChatTargetItem(item);
    const msgs = await api.getChat(item.id, currentUser.role);
    setChatMessages(msgs);
    setIsChatOpen(true);
  };

  const handleSendMessage = async (rawMessage: string) => {
    if (!chatTargetItem) throw new Error('No target item');
    const newMsg = await api.sendChatMessage(chatTargetItem.id, rawMessage, currentUser.role);
    setChatMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  const handleExportCsv = () => {
    const csvContent = api.getAuditExportCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FindIt_Campus_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit CSV downloaded');
  };

  const handleFeedbackTrigger = (claimId: string) => {
    setFeedbackClaimId(claimId);
    setIsFeedbackOpen(true);
  };

  const handleSubmitFeedback = async (data: { claimId: string; rating: number; comment: string }) => {
    await api.submitFeedback(data, currentUser.role);
    showToast('Recovery feedback logged');
  };

  const pendingClaimsCount = claims.filter((c) => c.status === 'PENDING').length;

  return (
    <main className="min-h-screen relative flex flex-col bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Apple-Style Glass Top Header */}
      <Navbar
        currentUser={currentUser}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenGatekeeper={() => setIsGatekeeperOpen(true)}
        onRoleChange={handleRoleChange}
      />

      {/* Main Body Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {activeTab === 'DISCOVERY' && (
          <DiscoveryView
            items={items}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenMatch={handleOpenMatch}
            onOpenClaim={handleOpenClaim}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            userRole={currentUser.role}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {activeTab === 'MAP' && (
          <CampusMapView
            items={items}
            hotspots={hotspots}
            onSelectItem={(item) => setSelectedItem(item)}
            userRole={currentUser.role}
          />
        )}

        {activeTab === 'CLAIMS' && (
          <ClaimsQueueView
            claims={claims}
            items={items}
            onReviewClaim={handleReviewClaim}
            onOpenHandoverPass={() => setActiveTab('HANDOVER')}
            userRole={currentUser.role}
          />
        )}

        {activeTab === 'HANDOVER' && (
          <HandoverPassView
            claims={claims}
            items={items}
            activeClaim={claims.find((c) => c.status === 'APPROVED') || null}
            onVerifyHandover={handleVerifyHandover}
            onFeedbackTrigger={handleFeedbackTrigger}
            userRole={currentUser.role}
          />
        )}

        {activeTab === 'ANALYTICS' && analytics && (
          <CustodyAnalyticsView
            analytics={analytics}
            items={items}
            onExportCsv={handleExportCsv}
            onOpenFeedbackModal={() => {
              setFeedbackClaimId('demo_claim_test');
              setIsFeedbackOpen(true);
            }}
          />
        )}
      </div>

      {/* 2. Apple Minimalist Floating Pill Dock */}
      <BottomDock
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        currentRole={currentUser.role}
        pendingClaimsCount={pendingClaimsCount}
      />

      {/* Modals & Drawers */}
      <CampusGatekeeper
        isOpen={isGatekeeperOpen}
        onClose={() => setIsGatekeeperOpen(false)}
        currentUser={currentUser}
        onLogin={handleGatekeeperLogin}
      />

      <ReportItemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleCreateItem}
        userRole={currentUser.role}
      />

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenClaim={handleOpenClaim}
        onOpenMatch={handleOpenMatch}
        onOpenChat={handleOpenChat}
        userRole={currentUser.role}
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
        userRole={currentUser.role}
      />

      <RelayChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        targetItem={chatTargetItem}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        userRole={currentUser.role}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        claimId={feedbackClaimId}
        onSubmitFeedback={handleSubmitFeedback}
      />

      {/* Apple-style floating toast */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2 rounded-apple-pill bg-black/80 dark:bg-white/90 text-white dark:text-black text-xs font-medium border border-hairline shadow-2xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-apple-blue" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
