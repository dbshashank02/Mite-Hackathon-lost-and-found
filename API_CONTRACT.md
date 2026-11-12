# FindIt Campus — Shared API & Port Contract
- Frontend: http://localhost:3000 | Backend: http://localhost:5000 | AI Engine: http://localhost:8000
- Auth Header: `Authorization: Bearer <token>` and `x-demo-role: STUDENT | FINDER | SECURITY | ADMIN`

## Core Data Models
- **User:** `{ id, email, handle, role, department, verifiedBadge }`
- **Item:** `{ id, type: "LOST"|"FOUND", title, category: "Electronics"|"Wallets/Bags"|"Keys"|"Identification"|"Apparel"|"Books", brand, color, imageUrl, buildingId, coords: {x, y, lat, lng}, timestamp, status, lockerId, retentionDays: 30|60|90, expiresAt, sensitive: { serialNumber, privateTraits, walletContents, finderPhone } }`
  *Note: Backend MUST mask `sensitive` fields as `"REDACTED"` unless requester is SECURITY/ADMIN or has an APPROVED claim.*
- **Item Status Enum:** `REPORTED` | `LOGGED_IN_DEPOT` | `MATCH_SUGGESTED` | `CLAIM_PENDING` | `VERIFICATION_APPROVED` | `AWAITING_PICKUP` | `RETURNED` | `UNCLAIMED_ARCHIVE` | `AUCTION_DONATED`
- **MatchResult:** `{ lostItemId, foundItemId, totalScore, breakdown: { visual: 0-100, category: 0-100, location: 0-100, time: 0-100 }, explanation: string[] }`
- **Claim:** `{ id, itemId, claimantId, secretAnswer, proofImageUrl, status: "PENDING"|"EVIDENCE_REQUESTED"|"APPROVED"|"DENIED", fraudFlags: string[], qrToken, otpCode, otpExpiresAt }`

## Endpoints
- Backend (`:5000`):
  - `POST /api/auth/login` -> `{ email, role }` -> `{ token, user }`
  - `GET /api/items` (query: `?type=&category=&nearLat=&nearLng=&radius=200`) -> `Item[]`
  - `POST /api/items` -> creates item, calls AI Engine `/score-matches`, returns `{ item, matches }`
  - `GET /api/items/:id/matches` -> `MatchResult[]`
  - `POST /api/claims` -> `{ itemId, secretAnswer, proofImageUrl }` (runs Fraud Guard)
  - `PATCH /api/claims/:id/review` -> `{ action: "APPROVE"|"REQUEST_EVIDENCE"|"DENY", lockerId? }` (generates QR + 6-digit OTP on APPROVE)
  - `POST /api/handover/verify` -> `{ claimId, qrToken?, otpCode? }` -> marks item `RETURNED`
  - `GET /api/chat/:itemId` & `POST /api/chat/:itemId` (`{ message }` -> scrubs phones/URLs)
  - `GET /api/analytics` & `GET /api/analytics/export.csv`
  - `POST /api/feedback` -> `{ claimId, rating: 1-5, comment }`
- AI Engine (`:8000`):
  - `POST /score-matches` -> `{ targetItem, candidateItems }` -> `MatchResult[]`
  - `POST /hotspots` -> `{ items }` -> `{ zones: [{ buildingId, name, count, intensity }] }`
