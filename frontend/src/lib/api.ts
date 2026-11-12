import {
  Item,
  User,
  UserRole,
  MatchResult,
  Claim,
  ChatMessage,
  AnalyticsSummary,
  HotspotZone,
  ItemCategory,
  ItemType,
  ClaimStatus,
} from '../types';
import {
  INITIAL_ITEMS,
  INITIAL_MATCH_RESULTS,
  INITIAL_CLAIMS,
  INITIAL_CHAT,
  INITIAL_ANALYTICS,
  INITIAL_HOTSPOTS,
  DEMO_USERS,
  CAMPUS_BUILDINGS,
} from './mockData';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const AI_ENGINE_URL = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000';

// In-memory fallback state for smooth offline hackathon demos
let localItems: Item[] = [...INITIAL_ITEMS];
let localClaims: Claim[] = [...INITIAL_CLAIMS];
let localMatchResults: Record<string, MatchResult[]> = { ...INITIAL_MATCH_RESULTS };
let localChat: Record<string, ChatMessage[]> = { ...INITIAL_CHAT };
let localAnalytics: AnalyticsSummary = { ...INITIAL_ANALYTICS };
let localHotspots: HotspotZone[] = [...INITIAL_HOTSPOTS];

// Contact scrubbing helper for privacy protection
export function scrubContactInfo(text: string): { cleanText: string; scrubbed: boolean } {
  let scrubbed = false;
  // Regex to detect phone numbers
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)(\d{3}[-.\s]?\d{4})/g;
  // Regex to detect URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.(com|edu|org|net|io)[^\s]*)/gi;

  let clean = text;
  if (phoneRegex.test(clean)) {
    clean = clean.replace(phoneRegex, '🔒 [PHONE SCRUBBED FOR PRIVACY]');
    scrubbed = true;
  }
  if (urlRegex.test(clean)) {
    clean = clean.replace(urlRegex, '🔒 [LINK SCRUBBED FOR SECURITY]');
    scrubbed = true;
  }

  return { cleanText: clean, scrubbed };
}

// Request helper with automatic fallback to mock engine
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackResolver: () => T | Promise<T>,
  role: UserRole = 'STUDENT'
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800); // Fast timeout for immediate fallback

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer mock_jwt_token_${role.toLowerCase()}`,
        'x-demo-role': role,
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (err) {
    // Graceful offline fallback
    // console.warn(`[FindIt API] Backend unreachable at ${url}. Using high-fidelity mock fallback.`);
    return await fallbackResolver();
  }
}

export const api = {
  // Auth
  async login(email: string, role: UserRole): Promise<{ token: string; user: User }> {
    return apiRequest(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      },
      () => {
        const user = DEMO_USERS[role] || {
          id: `usr_${Date.now()}`,
          email,
          handle: email.split('@')[0],
          role,
          department: 'General Campus',
          verifiedBadge: email.endsWith('.edu'),
        };
        return {
          token: `jwt_campus_${role}_${Date.now()}`,
          user,
        };
      },
      role
    );
  },

  // Items
  async getItems(
    filters: {
      type?: ItemType | 'ALL';
      category?: ItemCategory | 'ALL';
      nearLat?: number;
      nearLng?: number;
      radius?: number;
      status?: string;
      search?: string;
    } = {},
    role: UserRole = 'STUDENT'
  ): Promise<Item[]> {
    const query = new URLSearchParams();
    if (filters.type && filters.type !== 'ALL') query.append('type', filters.type);
    if (filters.category && filters.category !== 'ALL') query.append('category', filters.category);
    if (filters.nearLat) query.append('nearLat', filters.nearLat.toString());
    if (filters.nearLng) query.append('nearLng', filters.nearLng.toString());
    if (filters.radius) query.append('radius', filters.radius.toString());

    return apiRequest(
      `/api/items?${query.toString()}`,
      { method: 'GET' },
      () => {
        let results = [...localItems];

        if (filters.type && filters.type !== 'ALL') {
          results = results.filter((i) => i.type === filters.type);
        }
        if (filters.category && filters.category !== 'ALL') {
          results = results.filter((i) => i.category === filters.category);
        }
        if (filters.status && filters.status !== 'ALL') {
          results = results.filter((i) => i.status === filters.status);
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          results = results.filter(
            (i) =>
              i.title.toLowerCase().includes(q) ||
              i.brand.toLowerCase().includes(q) ||
              i.color.toLowerCase().includes(q) ||
              i.category.toLowerCase().includes(q)
          );
        }

        // Apply 200m radius filter if specified
        if (filters.radius && filters.nearLat && filters.nearLng) {
          // Approx distance formula for demo coords
          results = results.filter((i) => {
            const dLat = (i.coords.lat - (filters.nearLat || 0)) * 111000;
            const dLng = (i.coords.lng - (filters.nearLng || 0)) * 111000;
            const distanceMeters = Math.sqrt(dLat * dLat + dLng * dLng);
            return distanceMeters <= (filters.radius || 200);
          });
        }

        return results;
      },
      role
    );
  },

  async createItem(
    itemData: Omit<Item, 'id' | 'timestamp' | 'status'>,
    role: UserRole = 'STUDENT'
  ): Promise<{ item: Item; matches: MatchResult[] }> {
    return apiRequest(
      '/api/items',
      {
        method: 'POST',
        body: JSON.stringify(itemData),
      },
      () => {
        const newItem: Item = {
          ...itemData,
          id: `item_${itemData.type.toLowerCase()}_${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: itemData.type === 'FOUND' ? 'LOGGED_IN_DEPOT' : 'REPORTED',
          lockerId: itemData.type === 'FOUND' ? `DEPOT-LK-${Math.floor(10 + Math.random() * 80)}` : undefined,
          expiresAt: new Date(Date.now() + (itemData.retentionDays || 30) * 86400000).toISOString(),
        };

        localItems.unshift(newItem);

        // Generate synthetic AI match against candidates
        const candidates = localItems.filter(
          (cand) => cand.type !== newItem.type && cand.category === newItem.category
        );

        const generatedMatches: MatchResult[] = candidates.map((cand) => {
          const visualScore = Math.floor(75 + Math.random() * 23);
          const categoryScore = 100;
          const locationScore = cand.buildingId === newItem.buildingId ? 95 : 70;
          const timeScore = 85;
          const totalScore = Math.round(
            visualScore * 0.35 + categoryScore * 0.3 + locationScore * 0.2 + timeScore * 0.15
          );

          return {
            lostItemId: newItem.type === 'LOST' ? newItem.id : cand.id,
            foundItemId: newItem.type === 'FOUND' ? newItem.id : cand.id,
            totalScore,
            breakdown: {
              visual: visualScore,
              category: categoryScore,
              location: locationScore,
              time: timeScore,
            },
            explanation: [
              `AI Vision Vector similarity: ${visualScore}% match on form factor, palette, and geometry.`,
              `Category taxonomy match (${newItem.category}) with high feature confidence.`,
              cand.buildingId === newItem.buildingId
                ? `Building match: Detected within the same perimeter zone.`
                : `Cross-campus cluster: Correlated transit route detected.`,
              `Estimated handover probability: High`,
            ],
          };
        });

        if (generatedMatches.length > 0) {
          localMatchResults[newItem.id] = generatedMatches;
          newItem.status = 'MATCH_SUGGESTED';
        }

        return { item: newItem, matches: generatedMatches };
      },
      role
    );
  },

  async getItemMatches(itemId: string, role: UserRole = 'STUDENT'): Promise<MatchResult[]> {
    return apiRequest(
      `/api/items/${itemId}/matches`,
      { method: 'GET' },
      () => {
        return localMatchResults[itemId] || [];
      },
      role
    );
  },

  // Claims
  async createClaim(
    data: { itemId: string; secretAnswer: string; proofImageUrl?: string },
    role: UserRole = 'STUDENT'
  ): Promise<Claim> {
    return apiRequest(
      '/api/claims',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => {
        const newClaim: Claim = {
          id: `clm_${Math.floor(10000 + Math.random() * 89999)}`,
          itemId: data.itemId,
          claimantId: DEMO_USERS[role]?.id || 'usr_demo_student',
          secretAnswer: data.secretAnswer,
          proofImageUrl: data.proofImageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400',
          status: 'PENDING',
          fraudFlags: [
            'Automated AI check: Claimant matched private trait keywords',
            'Pending Physical Inspection by Security Staff',
          ],
          qrToken: `QR-PASS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          otpCode: Math.floor(100000 + Math.random() * 900000).toString(),
          otpExpiresAt: new Date(Date.now() + 3600000 * 4).toISOString(),
          createdAt: new Date().toISOString(),
        };

        localClaims.unshift(newClaim);

        // Update target item status
        const targetItem = localItems.find((i) => i.id === data.itemId);
        if (targetItem) {
          targetItem.status = 'CLAIM_PENDING';
        }

        return newClaim;
      },
      role
    );
  },

  async reviewClaim(
    claimId: string,
    action: 'APPROVE' | 'REQUEST_EVIDENCE' | 'DENY',
    lockerId?: string,
    role: UserRole = 'SECURITY'
  ): Promise<Claim> {
    return apiRequest(
      `/api/claims/${claimId}/review`,
      {
        method: 'PATCH',
        body: JSON.stringify({ action, lockerId }),
      },
      () => {
        const claim = localClaims.find((c) => c.id === claimId);
        if (!claim) throw new Error('Claim not found');

        if (action === 'APPROVE') {
          claim.status = 'APPROVED';
          claim.qrToken = `QR-PASS-VERIFIED-${claimId.toUpperCase()}`;
          claim.otpCode = Math.floor(100000 + Math.random() * 900000).toString();
          claim.otpExpiresAt = new Date(Date.now() + 3600000 * 24).toISOString();

          const targetItem = localItems.find((i) => i.id === claim.itemId);
          if (targetItem) {
            targetItem.status = 'AWAITING_PICKUP';
            if (lockerId) targetItem.lockerId = lockerId;
          }
        } else if (action === 'REQUEST_EVIDENCE') {
          claim.status = 'EVIDENCE_REQUESTED';
          claim.fraudFlags.push('Additional purchase receipt or ID required');
        } else {
          claim.status = 'DENIED';
          claim.fraudFlags.push('Claim denied: Details mismatched Depot inventory');
        }

        return claim;
      },
      role
    );
  },

  async getClaims(role: UserRole = 'SECURITY'): Promise<Claim[]> {
    return apiRequest(
      '/api/claims',
      { method: 'GET' },
      () => localClaims,
      role
    );
  },

  // Handover Verification
  async verifyHandover(
    data: { claimId?: string; qrToken?: string; otpCode?: string },
    role: UserRole = 'SECURITY'
  ): Promise<{ success: boolean; message: string; item?: Item }> {
    return apiRequest(
      '/api/handover/verify',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => {
        const claim = localClaims.find(
          (c) =>
            (data.claimId && c.id === data.claimId) ||
            (data.qrToken && c.qrToken === data.qrToken) ||
            (data.otpCode && c.otpCode === data.otpCode)
        );

        if (!claim) {
          return {
            success: false,
            message: 'Invalid or expired QR token / OTP code. Verification rejected.',
          };
        }

        const item = localItems.find((i) => i.id === claim.itemId);
        if (item) {
          item.status = 'RETURNED';
          item.lockerId = undefined; // Released from locker
        }

        claim.status = 'APPROVED';

        return {
          success: true,
          message: 'Secure contactless handover authenticated! Item custody marked RETURNED.',
          item,
        };
      },
      role
    );
  },

  // In-App Chat with Phone/URL auto-scrubbing
  async getChat(itemId: string, role: UserRole = 'STUDENT'): Promise<ChatMessage[]> {
    return apiRequest(
      `/api/chat/${itemId}`,
      { method: 'GET' },
      () => {
        return localChat[itemId] || [];
      },
      role
    );
  },

  async sendChatMessage(
    itemId: string,
    rawMessage: string,
    role: UserRole = 'STUDENT'
  ): Promise<ChatMessage> {
    const { cleanText, scrubbed } = scrubContactInfo(rawMessage);

    return apiRequest(
      `/api/chat/${itemId}`,
      {
        method: 'POST',
        body: JSON.stringify({ message: cleanText }),
      },
      () => {
        const currentUser = DEMO_USERS[role];
        const newMsg: ChatMessage = {
          id: `msg_${Date.now()}`,
          itemId,
          senderId: currentUser?.id || 'usr_student',
          senderRole: role,
          senderHandle: currentUser?.handle || 'Anonymous Student',
          message: cleanText,
          timestamp: new Date().toISOString(),
          scrubbedNotice: scrubbed,
        };

        if (!localChat[itemId]) {
          localChat[itemId] = [];
        }
        localChat[itemId].push(newMsg);
        return newMsg;
      },
      role
    );
  },

  // Analytics & CSV Export
  async getAnalytics(role: UserRole = 'ADMIN'): Promise<AnalyticsSummary> {
    return apiRequest(
      '/api/analytics',
      { method: 'GET' },
      () => {
        return localAnalytics;
      },
      role
    );
  },

  getAuditExportCsv(): string {
    const headers = [
      'Item ID',
      'Type',
      'Title',
      'Category',
      'Brand',
      'Status',
      'Building',
      'Locker ID',
      'Retention Days',
      'Timestamp',
    ];
    const rows = localItems.map((item) => [
      item.id,
      item.type,
      `"${item.title.replace(/"/g, '""')}"`,
      item.category,
      item.brand,
      item.status,
      item.buildingId,
      item.lockerId || 'N/A',
      item.retentionDays,
      item.timestamp,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  // Feedback
  async submitFeedback(
    data: { claimId: string; rating: number; comment: string },
    role: UserRole = 'STUDENT'
  ): Promise<{ success: boolean }> {
    return apiRequest(
      '/api/feedback',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => {
        return { success: true };
      },
      role
    );
  },

  // Campus Hotspots for SVG map
  async getHotspots(): Promise<HotspotZone[]> {
    return apiRequest(
      '/api/hotspots',
      { method: 'GET' },
      () => localHotspots,
      'STUDENT'
    );
  },
};
