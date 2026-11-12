function parseJsonField(val, fallback) {
  if (val == null) return fallback;
  if (typeof val === "object") return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

function retentionDaysFor(category) {
  if (category === "Electronics") return 90;
  if (category === "Wallets/Bags" || category === "Identification") return 60;
  return 30;
}

function scrubMessage(text) {
  let out = String(text || "");
  out = out.replace(/\b(?:\+?\d[\d\s\-()]{7,}\d)\b/g, "[REDACTED FOR SAFETY]");
  out = out.replace(/\bhttps?:\/\/\S+|\bwww\.\S+/gi, "[REDACTED FOR SAFETY]");
  return out;
}

const ITEM_STATUS = [
  "REPORTED","LOGGED_IN_DEPOT","MATCH_SUGGESTED","CLAIM_PENDING","VERIFICATION_APPROVED",
  "AWAITING_PICKUP","RETURNED","UNCLAIMED_ARCHIVE","AUCTION_DONATED"
];

const ALLOWED_TRANSITIONS = {
  REPORTED: ["LOGGED_IN_DEPOT", "MATCH_SUGGESTED"],
  LOGGED_IN_DEPOT: ["MATCH_SUGGESTED", "CLAIM_PENDING", "UNCLAIMED_ARCHIVE"],
  MATCH_SUGGESTED: ["CLAIM_PENDING", "LOGGED_IN_DEPOT", "UNCLAIMED_ARCHIVE"],
  CLAIM_PENDING: ["VERIFICATION_APPROVED", "LOGGED_IN_DEPOT", "MATCH_SUGGESTED"],
  VERIFICATION_APPROVED: ["AWAITING_PICKUP", "CLAIM_PENDING"],
  AWAITING_PICKUP: ["RETURNED", "UNCLAIMED_ARCHIVE"],
  RETURNED: [],
  UNCLAIMED_ARCHIVE: ["AUCTION_DONATED"],
  AUCTION_DONATED: []
};

function canTransition(from, to) {
  if (from === to) return true;
  return (ALLOWED_TRANSITIONS[from] || []).includes(to);
}

module.exports = { parseJsonField, retentionDaysFor, scrubMessage, ITEM_STATUS, canTransition };
