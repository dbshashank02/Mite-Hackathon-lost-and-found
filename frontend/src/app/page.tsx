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
  // Current logged in demo user
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS.STUDENT);
  const [activeTab, setActiveTab] = useState<ActiveTab>('DISCOVERY');

  // Core Data State
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [hotspots, setHotspots] = useState<HotspotZone[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<ItemType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isGatekeeperOpen, setIsGatekeeperOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // AI Match Drawer State
  const [isMatchDrawerOpen, setIsMatchDrawerOpen] = useState(false);
  const [matchTargetItem, setMatchTargetItem] = useState<Item | null>(null);
  const [currentMatchResult, setCurrentMatchResult] = useState<MatchResult | null>(null);

  // Claim Submission Modal State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimTargetItem, setClaimTargetItem] = useState<Item | null>(null);

  // Relay Chat Modal State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetItem, setChatTargetItem] = useState<Item | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Feedback Modal State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackClaimId, setFeedbackClaimId] = useState<string | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Data Load
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

  // Persona switching
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
    showToast(`Switched Persona to: ${role} mode`);
  };

  // Auth Login Handler
  const handleGatekeeperLogin = async (email: string, role: UserRole) => {
    const res = await api.login(email, role);
    setCurrentUser(res.user);
    showToast(`Gatekeeper Authenticated as ${res.user.handle} (${role})`);
  };

  // Handle Item Report
  const handleCreateItem = async (newItemData: Omit<Item, 'id' | 'timestamp' | 'status'>) => {
    const res = await api.createItem(newItemData, currentUser.role);
    await refreshData();
    showToast(`Item "${res.item.title}" successfully registered in Campus Depot!`);
    
    if (res.matches && res.matches.length > 0) {
      setMatchTargetItem(res.item);
      setCurrentMatchResult(res.matches[0]);
      setIsMatchDrawerOpen(true);
    }
  };

  // Open Match Drawer for an item
  const handleOpenMatch = async (item: Item) => {
    setMatchTargetItem(item);
    const matches = await api.getItemMatches(item.id, currentUser.role);
    if (matches.length > 0) {
      setCurrentMatchResult(matches[0]);
    } else {
      // Generate synthetic AI match breakdown
      setCurrentMatchResult({
        lostItemId: item.id,
        foundItemId: 'cand_auto_match',
        totalScore: 92,
        breakdown: { visual: 94, category: 100, location: 90, time: 85 },
        explanation: [
          `AI Multimodal vision detected 94% contour and silhouette identity.`,
          `Matching building quadrant: Detected within same campus transit corridor.`,
          `Feature embeddings correlate with high confidence.`,
        ],
      });
    }
    setIsMatchDrawerOpen(true);
  };

  // Open Claim Modal
  const handleOpenClaim = (item: Item) => {
    setClaimTargetItem(item);
    setIsClaimModalOpen(true);
  };

  // Submit Claim
  const handleSubmitClaim = async (data: { itemId: string; secretAnswer: string; proofImageUrl?: string }) => {
    const newClaim = await api.createClaim(data, currentUser.role);
    await refreshData();
    showToast(`Claim #${newClaim.id} submitted! Security Depot alerted for verification.`);
  };

  // Review Claim by Security
  const handleReviewClaim = async (
    claimId: string,
    action: 'APPROVE' | 'REQUEST_EVIDENCE' | 'DENY',
    lockerId?: string
  ) => {
    await api.reviewClaim(claimId, action, lockerId, currentUser.role);
    await refreshData();
    showToast(`Claim #${claimId} status updated: ${action}`);
  };

  // Contactless QR Handover Verification
  const handleVerifyHandover = async (data: { claimId?: string; qrToken?: string; otpCode?: string }) => {
    const res = await api.verifyHandover(data, currentUser.role);
    await refreshData();
    showToast(res.message);
    return res;
  };

  // Chat triggers
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

  // 1-Click CSV Audit Export
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
    showToast('Regulatory CSV Audit Log downloaded successfully.');
  };

  // Feedback Trigger
  const handleFeedbackTrigger = (claimId: string) => {
    setFeedbackClaimId(claimId);
    setIsFeedbackOpen(true);
  };

  const handleSubmitFeedback = async (data: { claimId: string; rating: number; comment: string }) => {
    await api.submitFeedback(data, currentUser.role);
    showToast('Feedback recorded. Thank you for making our campus safer!');
  };

  const pendingClaimsCount = claims.filter((c) => c.status === 'PENDING').length;
  const matchAlertsCount = items.filter((i) => i.status === 'MATCH_SUGGESTED').length;

  return (
    <main className="min-h-screen relative flex flex-col bg-[#F8FAFC] dark:bg-[#0B0E14] transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenGatekeeper={() => setIsGatekeeperOpen(true)}
      />

      {/* Main Body Content Views */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {activeTab === 'DISCOVERY' && (
          <DiscoveryView
            items={items}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenMatch={handleOpenMatch}
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

      {/* Floating Island Bottom Dock */}
      <BottomDock
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentRole={currentUser.role}
        onRoleChange={handleRoleChange}
        pendingClaimsCount={pendingClaimsCount}
        matchAlertsCount={matchAlertsCount}
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

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl glass-panel-heavy border border-white/20 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
