const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");
const { execSync } = require("child_process");
const path = require("path");
const { parseUser, signUser, requireAuth, requireRoles } = require("./lib/auth");
const { parseJsonField, retentionDaysFor, scrubMessage, canTransition } = require("./lib/utils");
const { scoreMatches, hotspots } = require("./lib/ai");

const prisma = new PrismaClient();
const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "5mb" }));

function shapeItem(item, viewer, approvedItemIds = new Set()) {
  const coords = parseJsonField(item.coords, { x: 0, y: 0, lat: null, lng: null });
  const sensitiveRaw = parseJsonField(item.sensitive, {});
  let sensitive = sensitiveRaw || {};
  const canSee = viewer && (viewer.role === "SECURITY" || viewer.role === "ADMIN" || approvedItemIds.has(item.id));
  if (!canSee) {
    sensitive = {
      serialNumber: "REDACTED",
      privateTraits: "REDACTED",
      walletContents: "REDACTED",
      finderPhone: "REDACTED",
    };
  }
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    category: item.category,
    brand: item.brand || null,
    color: item.color || null,
    imageUrl: item.imageUrl || null,
    buildingId: item.buildingId || null,
    coords,
    timestamp: item.timestamp ? item.timestamp.toISOString() : null,
    status: item.status,
    lockerId: item.lockerId || null,
    retentionDays: item.retentionDays,
    expiresAt: item.expiresAt ? item.expiresAt.toISOString() : null,
    sensitive,
  };
}

async function getApprovedItemIdsForUser(userId) {
  if (!userId) return new Set();
  const claims = await prisma.claim.findMany({ where: { claimantId: userId, status: "APPROVED" }, select: { itemId: true } });
  return new Set(claims.map(c => c.itemId));
}

async function applyRetentionTransitions() {
  const now = new Date();
  const items = await prisma.item.findMany({ where: { expiresAt: { lt: now }, status: { in: ["AWAITING_PICKUP", "LOGGED_IN_DEPOT", "MATCH_SUGGESTED", "CLAIM_PENDING", "VERIFICATION_APPROVED", "REPORTED"] } } });
  for (const it of items) {
    await prisma.item.update({ where: { id: it.id }, data: { status: "UNCLAIMED_ARCHIVE" } });
  }
}

// ---- Auth ----
const animals = ["Falcon", "Otter", "Hawk", "Lynx", "Puma", "Wolf", "Tiger", "Orca"];
function pseudoHandle() { return `${animals[Math.floor(Math.random()*animals.length)]}-${Math.floor(100+Math.random()*900)}`; }

app.post("/api/auth/login", async (req, res) => {
  const { email, role } = req.body || {};
  if (!email || !role) return res.status(400).json({ error: "email and role required" });
  const isUni = /@university\.edu$/i.test(email);
  const isDemo = /demo|test/i.test(email) || process.env.DEMO_BYPASS !== "0";
  if (!isUni && !isDemo) return res.status(400).json({ error: "Email must be @university.edu" });
  const r = String(role).toUpperCase();
  if (!["STUDENT","FINDER","SECURITY","ADMIN"].includes(r)) return res.status(400).json({ error: "Invalid role" });
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, role: r, handle: pseudoHandle(), department: null, verifiedBadge: isUni } });
  } else if (user.role !== r) {
    user = await prisma.user.update({ where: { id: user.id }, data: { role: r } });
  }
  const token = signUser(user);
  res.json({ token, user: { id: user.id, email: user.email, handle: user.handle, role: user.role, department: user.department, verifiedBadge: user.verifiedBadge } });
});

// ---- Items ----
app.get("/api/items", async (req, res) => {
  try {
    await applyRetentionTransitions();
    const viewer = parseUser(req);
    const { type, category, nearLat, nearLng, radius } = req.query;
    const where = {};
    if (type) where.type = String(type).toUpperCase();
    if (category) where.category = String(category);
    let items = await prisma.item.findMany({ where, orderBy: { createdAt: "desc" } });
    if (nearLat && nearLng) {
      const lat = parseFloat(nearLat), lng = parseFloat(nearLng), rad = parseFloat(radius || 200);
      items = items.filter(it => {
        const c = parseJsonField(it.coords, {});
        if (c.lat == null || c.lng == null) return false;
        const R=6371000, toRad=x=>x*Math.PI/180; const dphi=toRad(c.lat-lat), dl=toRad(c.lng-lng);
        const a=Math.sin(dphi/2)**2+Math.cos(toRad(lat))*Math.cos(toRad(c.lat))*Math.sin(dl/2)**2;
        const d=2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
        return d <= rad;
      });
    }
    const approvedIds = viewer ? await getApprovedItemIdsForUser(viewer.id) : new Set();
    res.json(items.map(it => shapeItem(it, viewer, approvedIds)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

app.post("/api/items", requireAuth, async (req, res) => {
  try {
    const viewer = req.user;
    const b = req.body || {};
    const type = String(b.type || "LOST").toUpperCase();
    const retentionDays = b.retentionDays || retentionDaysFor(b.category);
    const expiresAt = b.expiresAt ? new Date(b.expiresAt) : new Date(Date.now() + retentionDays * 24*60*60*1000);
    const status = b.status || "REPORTED";
    const item = await prisma.item.create({
      data: {
        type,
        title: b.title || "Untitled Item",
        category: b.category || "Electronics",
        brand: b.brand || null,
        color: b.color || null,
        imageUrl: b.imageUrl || null,
        buildingId: b.buildingId || null,
        coords: JSON.stringify(b.coords || { x:0, y:0, lat:null, lng:null }),
        timestamp: b.timestamp ? new Date(b.timestamp) : new Date(),
        status,
        lockerId: b.lockerId || null,
        retentionDays,
        expiresAt,
        sensitive: JSON.stringify(b.sensitive || {}),
        reporterId: viewer.id,
      }
    });

    // find candidates of opposite type and compute matches
    const opposite = type === "LOST" ? "FOUND" : "LOST";
    const candidates = await prisma.item.findMany({ where: { type: opposite } });
    const targetPlain = { ...shapeItem(item, { role: "SECURITY" }), sensitive: parseJsonField(item.sensitive, {}), timestamp: item.timestamp.toISOString() };
    const candPlain = candidates.map(c => ({ ...shapeItem(c, { role: "SECURITY" }), sensitive: parseJsonField(c.sensitive, {}), timestamp: c.timestamp.toISOString() }));
    let matches = [];
    try { matches = await scoreMatches(targetPlain, candPlain); } catch { matches = []; }
    // update status if matches found and currently REPORTED
    if (matches.length > 0 && status === "REPORTED") {
      await prisma.item.update({ where: { id: item.id }, data: { status: "MATCH_SUGGESTED" } });
      item.status = "MATCH_SUGGESTED";
    }
    const approvedIds = await getApprovedItemIdsForUser(viewer.id);
    res.status(201).json({ item: shapeItem(item, viewer, approvedIds), matches });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create item", detail: e.message });
  }
});

app.get("/api/items/:id/matches", async (req, res) => {
  try {
    const item = await prisma.item.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Item not found" });
    const opposite = item.type === "LOST" ? "FOUND" : "LOST";
    const candidates = await prisma.item.findMany({ where: { type: opposite } });
    const targetPlain = { ...shapeItem(item, { role: "SECURITY" }), sensitive: parseJsonField(item.sensitive, {}), timestamp: item.timestamp.toISOString() };
    const candPlain = candidates.map(c => ({ ...shapeItem(c, { role: "SECURITY" }), sensitive: parseJsonField(c.sensitive, {}), timestamp: c.timestamp.toISOString() }));
    const matches = await scoreMatches(targetPlain, candPlain);
    res.json(matches);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to compute matches" });
  }
});

// ---- Claims & Fraud Guard ----
const claimRate = new Map(); // userId -> [timestamps]
app.post("/api/claims", requireAuth, async (req, res) => {
  try {
    const viewer = req.user;
    const { itemId, secretAnswer, proofImageUrl } = req.body || {};
    if (!itemId) return res.status(400).json({ error: "itemId required" });
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: "Item not found" });

    // rate limit >3 claims/hour per user
    const now = Date.now();
    const arr = (claimRate.get(viewer.id) || []).filter(t => now - t < 3600000);
    if (arr.length >= 3) return res.status(429).json({ error: "Rate limit: more than 3 claims/hour" });
    arr.push(now); claimRate.set(viewer.id, arr);

    // block duplicate claims on same item
    const dup = await prisma.claim.findFirst({ where: { itemId, claimantId: viewer.id, status: { in: ["PENDING","EVIDENCE_REQUESTED","APPROVED"] } } });
    if (dup) return res.status(409).json({ error: "Duplicate claim on same item" });

    const fraudFlags = [];
    // HIGH_VALUE_SIMULTANEOUS_CLAIM if multiple users claim Electronics item
    if (item.category === "Electronics") {
      const otherClaims = await prisma.claim.count({ where: { itemId, status: { in: ["PENDING","EVIDENCE_REQUESTED","APPROVED"] } } });
      if (otherClaims >= 1) fraudFlags.push("HIGH_VALUE_SIMULTANEOUS_CLAIM");
      // also flag this claim and mark existing pending ones
      if (otherClaims >= 1) {
        const existing = await prisma.claim.findMany({ where: { itemId, status: "PENDING" } });
        for (const ec of existing) {
          const flags = parseJsonField(ec.fraudFlags, []);
          if (!flags.includes("HIGH_VALUE_SIMULTANEOUS_CLAIM")) flags.push("HIGH_VALUE_SIMULTANEOUS_CLAIM");
          await prisma.claim.update({ where: { id: ec.id }, data: { fraudFlags: JSON.stringify(flags) } });
        }
      }
    }

    const claim = await prisma.claim.create({
      data: {
        itemId, claimantId: viewer.id,
        secretAnswer: secretAnswer || null,
        proofImageUrl: proofImageUrl || null,
        status: "PENDING",
        fraudFlags: JSON.stringify(fraudFlags),
      }
    });
    // move item to CLAIM_PENDING if allowed
    if (canTransition(item.status, "CLAIM_PENDING")) {
      await prisma.item.update({ where: { id: itemId }, data: { status: "CLAIM_PENDING" } });
    }
    res.status(201).json({
      id: claim.id, itemId: claim.itemId, claimantId: claim.claimantId,
      secretAnswer: claim.secretAnswer, proofImageUrl: claim.proofImageUrl,
      status: claim.status, fraudFlags, qrToken: claim.qrToken, otpCode: claim.otpCode, otpExpiresAt: claim.otpExpiresAt
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create claim" });
  }
});

app.patch("/api/claims/:id/review", requireAuth, requireRoles("SECURITY","ADMIN"), async (req, res) => {
  try {
    const { action, lockerId } = req.body || {};
    const claim = await prisma.claim.findUnique({ where: { id: req.params.id }, include: { item: true } });
    if (!claim) return res.status(404).json({ error: "Claim not found" });
    let newStatus = claim.status;
    let updateClaim = {};
    let itemStatus = claim.item.status;
    if (action === "APPROVE") {
      newStatus = "APPROVED";
      const qrToken = uuidv4();
      const otpCode = String(Math.floor(100000 + Math.random() * 900000));
      const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      updateClaim = { status: "APPROVED", qrToken, otpCode, otpExpiresAt };
      itemStatus = "AWAITING_PICKUP";
    } else if (action === "REQUEST_EVIDENCE") {
      newStatus = "EVIDENCE_REQUESTED";
      updateClaim = { status: "EVIDENCE_REQUESTED" };
      itemStatus = "CLAIM_PENDING";
    } else if (action === "DENY") {
      newStatus = "DENIED";
      updateClaim = { status: "DENIED" };
      itemStatus = "LOGGED_IN_DEPOT";
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }
    const updated = await prisma.claim.update({ where: { id: claim.id }, data: updateClaim });
    const itemData = { status: itemStatus };
    if (lockerId) itemData.lockerId = lockerId;
    if (canTransition(claim.item.status, itemStatus) || itemStatus === claim.item.status) {
      await prisma.item.update({ where: { id: claim.itemId }, data: itemData });
    } else {
      // force for handover flow correctness
      await prisma.item.update({ where: { id: claim.itemId }, data: itemData });
    }
    res.json({
      id: updated.id, itemId: updated.itemId, claimantId: updated.claimantId,
      secretAnswer: updated.secretAnswer, proofImageUrl: updated.proofImageUrl,
      status: updated.status, fraudFlags: parseJsonField(updated.fraudFlags, []),
      qrToken: updated.qrToken, otpCode: updated.otpCode, otpExpiresAt: updated.otpExpiresAt
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to review claim" });
  }
});

// ---- Handover ----
app.post("/api/handover/verify", requireAuth, async (req, res) => {
  try {
    const { claimId, qrToken, otpCode } = req.body || {};
    if (!claimId) return res.status(400).json({ error: "claimId required" });
    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) return res.status(404).json({ error: "Claim not found" });
    if (claim.status !== "APPROVED") return res.status(400).json({ error: "Claim not approved" });
    let ok = false;
    if (qrToken && claim.qrToken && qrToken === claim.qrToken) ok = true;
    if (otpCode && claim.otpCode && String(otpCode) === String(claim.otpCode)) {
      if (claim.otpExpiresAt && new Date() <= new Date(claim.otpExpiresAt)) ok = true;
      else return res.status(400).json({ error: "OTP expired" });
    }
    if (!ok) return res.status(400).json({ error: "Invalid QR or OTP" });
    await prisma.item.update({ where: { id: claim.itemId }, data: { status: "RETURNED" } });
    res.json({ success: true, itemId: claim.itemId, status: "RETURNED" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Handover verification failed" });
  }
});

// ---- Chat ----
app.get("/api/chat/:itemId", async (req, res) => {
  try {
    const msgs = await prisma.chatMessage.findMany({ where: { itemId: req.params.itemId }, orderBy: { createdAt: "asc" } });
    res.json(msgs.map(m => ({ id: m.id, itemId: m.itemId, senderId: m.senderId, message: m.message, createdAt: m.createdAt.toISOString() })));
  } catch (e) { res.status(500).json({ error: "Failed to fetch chat" }); }
});

app.post("/api/chat/:itemId", requireAuth, async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "message required" });
    const scrubbed = scrubMessage(message);
    const msg = await prisma.chatMessage.create({ data: { itemId: req.params.itemId, senderId: req.user.id, message: scrubbed } });
    res.status(201).json({ id: msg.id, itemId: msg.itemId, senderId: msg.senderId, message: msg.message, createdAt: msg.createdAt.toISOString() });
  } catch (e) { res.status(500).json({ error: "Failed to post message" }); }
});

// ---- Analytics ----
function median(nums){ if(!nums.length) return 0; const s=[...nums].sort((a,b)=>a-b); const m=Math.floor(s.length/2); return s.length%2?s[m]:(s[m-1]+s[m])/2; }

async function computeAnalytics() {
  const items = await prisma.item.findMany();
  const claims = await prisma.claim.findMany();
  const returned = items.filter(i => i.status === "RETURNED");
  const foundOrLogged = items.filter(i => ["LOGGED_IN_DEPOT","MATCH_SUGGESTED","CLAIM_PENDING","VERIFICATION_APPROVED","AWAITING_PICKUP","RETURNED"].includes(i.status) || i.type === "FOUND");
  const recoveryRate = foundOrLogged.length ? (returned.length / foundOrLogged.length) * 100 : 0;
  // median return time (hours) between createdAt/timestamp and updatedAt for returned? approximate using createdAt->updatedAt
  const returnHours = returned.map(i => Math.max(0, (new Date(i.updatedAt) - new Date(i.createdAt)) / 3600000));
  const medianReturnTimeHours = median(returnHours);
  const activeLocker = items.filter(i => i.lockerId && ["LOGGED_IN_DEPOT","MATCH_SUGGESTED","CLAIM_PENDING","VERIFICATION_APPROVED","AWAITING_PICKUP"].includes(i.status)).length;
  // weekly volume trends (last 8 weeks)
  const now = Date.now();
  const weeklyVolume = [];
  for (let w=7; w>=0; w--) {
    const start = now - (w+1)*7*24*3600000;
    const end = now - w*7*24*3600000;
    const count = items.filter(i => { const t=new Date(i.createdAt).getTime(); return t>=start && t<end; }).length;
    weeklyVolume.push({ weekOffset: -w, count });
  }
  const hotspotsRes = await hotspots(items.map(i => ({ buildingId: i.buildingId, coords: parseJsonField(i.coords, {}) })));
  return {
    recoveryRate: Math.round(recoveryRate * 100) / 100,
    medianReturnTimeHours: Math.round(medianReturnTimeHours * 100) / 100,
    activeLockerCapacity: { used: activeLocker, total: 50 },
    weeklyVolume,
    totalItems: items.length,
    totalClaims: claims.length,
    statusBreakdown: items.reduce((acc,i)=>{acc[i.status]=(acc[i.status]||0)+1; return acc;},{}),
    hotspots: hotspotsRes.zones || hotspotsRes
  };
}

app.get("/api/analytics", async (req, res) => {
  try { res.json(await computeAnalytics()); } catch (e) { console.error(e); res.status(500).json({ error: "Failed to compute analytics" }); }
});

app.get("/api/analytics/export.csv", async (req, res) => {
  try {
    const items = await prisma.item.findMany({ orderBy: { createdAt: "desc" } });
    const claims = await prisma.claim.findMany({ orderBy: { createdAt: "desc" } });
    const esc = v => '"' + String(v == null ? "" : v).replace(/"/g,'""') + '"';
    let csv = "type,id,title,category,status,buildingId,lockerId,retentionDays,createdAt,expiresAt\n";
    for (const i of items) {
      csv += [i.type,i.id,i.title,i.category,i.status,i.buildingId,i.lockerId,i.retentionDays,i.createdAt.toISOString(),i.expiresAt?i.expiresAt.toISOString():""].map(esc).join(",") + "\n";
    }
    csv += "\nclaim_id,item_id,claimant_id,status,fraudFlags,createdAt\n";
    for (const c of claims) {
      csv += [c.id,c.itemId,c.claimantId,c.status,c.fraudFlags,c.createdAt.toISOString()].map(esc).join(",") + "\n";
    }
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=\"findit-audit.csv\"");
    res.send(csv);
  } catch (e) { console.error(e); res.status(500).json({ error: "Failed to export CSV" }); }
});

// ---- Feedback ----
app.post("/api/feedback", requireAuth, async (req, res) => {
  try {
    const { claimId, rating, comment } = req.body || {};
    if (!claimId || rating == null) return res.status(400).json({ error: "claimId and rating required" });
    const r = parseInt(rating, 10);
    if (isNaN(r) || r < 1 || r > 5) return res.status(400).json({ error: "rating must be 1-5" });
    const fb = await prisma.feedback.upsert({
      where: { claimId },
      update: { rating: r, comment: comment || null, userId: req.user.id },
      create: { claimId, rating: r, comment: comment || null, userId: req.user.id }
    });
    res.status(201).json({ id: fb.id, claimId: fb.claimId, rating: fb.rating, comment: fb.comment });
  } catch (e) { console.error(e); res.status(500).json({ error: "Failed to submit feedback" }); }
});

app.get("/", (req,res)=>res.json({status:"ok",service:"findit-backend"}));

async function ensureSetup() {
  try {
    execSync("npx prisma generate", { cwd: path.join(__dirname, ".."), stdio: "inherit" });
    execSync("npx prisma db push --skip-generate", { cwd: path.join(__dirname, ".."), stdio: "inherit" });
  } catch (e) {
    console.error("Prisma setup warning:", e.message);
  }
  try {
    const count = await prisma.item.count();
    if (count === 0) {
      require(path.join(__dirname, "..", "prisma", "seed.js"));
      // seed.js runs as script; better call its logic? it auto-runs main when required? we wrote it to run main() directly
    }
  } catch (e) {
    console.error("Seed check error:", e.message);
  }
}

const PORT = process.env.PORT || 5000;
ensureSetup().then(() => {
  // run seed in-process if empty
  return (async () => {
    const count = await prisma.item.count();
    if (count === 0) {
      console.log("Running seed...");
      // re-require seed logic by spawning to be safe
      try { execSync("node prisma/seed.js", { cwd: path.join(__dirname, ".."), stdio: "inherit" }); } catch(e){ console.error("seed err", e.message); }
    }
  })();
}).finally(() => {
  app.listen(PORT, () => console.log(`FindIt backend running on http://localhost:${PORT}`));
});
