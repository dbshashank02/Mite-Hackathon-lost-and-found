const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

function daysFromNow(d) {
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000);
}
function hoursAgo(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

async function main() {
  const count = await prisma.item.count();
  if (count > 0) {
    console.log("DB already seeded");
    return;
  }

  const users = await prisma.$transaction([
    prisma.user.create({ data: { id: "u-student1", email: "alex@university.edu", handle: "Falcon-482", role: "STUDENT", department: "CSE", verifiedBadge: true } }),
    prisma.user.create({ data: { id: "u-finder1", email: "sam@university.edu", handle: "Otter-103", role: "FINDER", department: "ECE", verifiedBadge: true } }),
    prisma.user.create({ data: { id: "u-sec1", email: "guard@university.edu", handle: "Hawk-001", role: "SECURITY", department: "Security", verifiedBadge: true } }),
    prisma.user.create({ data: { id: "u-admin1", email: "admin@university.edu", handle: "Eagle-900", role: "ADMIN", department: "Admin", verifiedBadge: true } }),
    prisma.user.create({ data: { id: "u-student2", email: "mira@university.edu", handle: "Lynx-227", role: "STUDENT", department: "ME", verifiedBadge: false } }),
  ]);

  const itemsData = [
    { id: "item-mbp", type: "LOST", title: "MacBook Pro M3 14-inch", category: "Electronics", brand: "Apple", color: "Space Gray", imageUrl: "/img/macbook.jpg", buildingId: "LIB", coords: JSON.stringify({x:120,y:80,lat:12.9141,lng:74.8560}), timestamp: hoursAgo(6), status: "REPORTED", lockerId: null, retentionDays: 90, expiresAt: daysFromNow(90), sensitive: JSON.stringify({serialNumber:"C02X9MBP3", privateTraits:"Sticker on lid", walletContents:null, finderPhone:null}), reporterId: "u-student1" },
    { id: "item-airpods", type: "FOUND", title: "AirPods Pro (2nd Gen)", category: "Electronics", brand: "Apple", color: "White", imageUrl: "/img/airpods.jpg", buildingId: "CAF", coords: JSON.stringify({x:200,y:140,lat:12.9148,lng:74.8568}), timestamp: hoursAgo(4), status: "LOGGED_IN_DEPOT", lockerId: "L-12", retentionDays: 60, expiresAt: daysFromNow(60), sensitive: JSON.stringify({serialNumber:"AP2-7781", privateTraits:"Engraved initials A.K.", walletContents:null, finderPhone:"+91-9876543210"}), reporterId: "u-finder1" },
    { id: "item-wallet", type: "FOUND", title: "Brown Leather Wallet", category: "Wallets/Bags", brand: "Wildcraft", color: "Brown", imageUrl: "/img/wallet.jpg", buildingId: "ENG", coords: JSON.stringify({x:300,y:210,lat:12.9152,lng:74.8555}), timestamp: hoursAgo(30), status: "MATCH_SUGGESTED", lockerId: "L-03", retentionDays: 60, expiresAt: daysFromNow(60), sensitive: JSON.stringify({serialNumber:null, privateTraits:"Small tear on corner", walletContents:"Student ID, 2 cards, cash", finderPhone:"+91-9123456780"}), reporterId: "u-finder1" },
    { id: "item-keys", type: "FOUND", title: "Dorm Keys with Blue Keychain", category: "Keys", brand: "Yale", color: "Silver/Blue", imageUrl: "/img/keys.jpg", buildingId: "HOST", coords: JSON.stringify({x:80,y:300,lat:12.9135,lng:74.8572}), timestamp: hoursAgo(10), status: "CLAIM_PENDING", lockerId: "L-07", retentionDays: 30, expiresAt: daysFromNow(30), sensitive: JSON.stringify({serialNumber:null, privateTraits:"Room 204 tag", walletContents:null, finderPhone:null}), reporterId: "u-finder1" },
    { id: "item-id", type: "FOUND", title: "Student ID Card - MITE", category: "Identification", brand: null, color: "White/Blue", imageUrl: "/img/id.jpg", buildingId: "ADMIN", coords: JSON.stringify({x:150,y:60,lat:12.9145,lng:74.8559}), timestamp: hoursAgo(20), status: "VERIFICATION_APPROVED", lockerId: "L-02", retentionDays: 30, expiresAt: daysFromNow(30), sensitive: JSON.stringify({serialNumber:"4MT21CS001", privateTraits:"Photo visible", walletContents:null, finderPhone:null}), reporterId: "u-sec1" },
    { id: "item-bottle", type: "FOUND", title: "HydroFlask Water Bottle 32oz", category: "Apparel", brand: "HydroFlask", color: "Teal", imageUrl: "/img/bottle.jpg", buildingId: "GYM", coords: JSON.stringify({x:260,y:260,lat:12.9138,lng:74.8566}), timestamp: hoursAgo(50), status: "AWAITING_PICKUP", lockerId: "L-09", retentionDays: 30, expiresAt: daysFromNow(30), sensitive: JSON.stringify({serialNumber:null, privateTraits:"Dented base", walletContents:null, finderPhone:null}), reporterId: "u-finder1" },
    { id: "item-calc", type: "LOST", title: "Casio fx-991EX Calculator", category: "Books", brand: "Casio", color: "Black", imageUrl: "/img/calc.jpg", buildingId: "LAB", coords: JSON.stringify({x:180,y:120,lat:12.9149,lng:74.8562}), timestamp: hoursAgo(72), status: "RETURNED", lockerId: "L-01", retentionDays: 30, expiresAt: daysFromNow(30), sensitive: JSON.stringify({serialNumber:"FX991-22", privateTraits:"Name written on back", walletContents:null, finderPhone:null}), reporterId: "u-student2" },
    { id: "item-umbrella", type: "FOUND", title: "Black Folding Umbrella", category: "Apparel", brand: "Local", color: "Black", imageUrl: "/img/umbrella.jpg", buildingId: "AUD", coords: JSON.stringify({x:90,y:90,lat:12.9140,lng:74.8552}), timestamp: hoursAgo(120), status: "UNCLAIMED_ARCHIVE", lockerId: "L-15", retentionDays: 60, expiresAt: daysFromNow(-5), sensitive: JSON.stringify({serialNumber:null, privateTraits:null, walletContents:null, finderPhone:null}), reporterId: "u-sec1" },
    { id: "item-headset", type: "FOUND", title: "Sony WH-1000XM4 Headphones", category: "Electronics", brand: "Sony", color: "Black", imageUrl: "/img/headset.jpg", buildingId: "LIB", coords: JSON.stringify({x:130,y:95,lat:12.9142,lng:74.8561}), timestamp: hoursAgo(8), status: "AUCTION_DONATED", lockerId: null, retentionDays: 90, expiresAt: daysFromNow(-30), sensitive: JSON.stringify({serialNumber:"WH4-9912", privateTraits:"Scratch on right cup", walletContents:null, finderPhone:"+91-9000000001"}), reporterId: "u-sec1" },
    { id: "item-bag", type: "LOST", title: "Black Laptop Backpack", category: "Wallets/Bags", brand: "American Tourister", color: "Black", imageUrl: "/img/bag.jpg", buildingId: "PARK", coords: JSON.stringify({x:340,y:340,lat:12.9132,lng:74.8578}), timestamp: hoursAgo(15), status: "MATCH_SUGGESTED", lockerId: null, retentionDays: 60, expiresAt: daysFromNow(60), sensitive: JSON.stringify({serialNumber:null, privateTraits:"Red keychain inside", walletContents:"Notebook", finderPhone:null}), reporterId: "u-student2" },
    { id: "item-book", type: "FOUND", title: "Data Structures Textbook", category: "Books", brand: "Pearson", color: "Blue", imageUrl: "/img/book.jpg", buildingId: "ENG", coords: JSON.stringify({x:310,y:200,lat:12.9151,lng:74.8556}), timestamp: hoursAgo(26), status: "LOGGED_IN_DEPOT", lockerId: "L-05", retentionDays: 30, expiresAt: daysFromNow(30), sensitive: JSON.stringify({serialNumber:null, privateTraits:"Name inside cover", walletContents:null, finderPhone:null}), reporterId: "u-finder1" },
    { id: "item-watch", type: "FOUND", title: "Fitbit Charge 5", category: "Electronics", brand: "Fitbit", color: "Black", imageUrl: "/img/watch.jpg", buildingId: "GYM", coords: JSON.stringify({x:255,y:250,lat:12.9139,lng:74.8565}), timestamp: hoursAgo(3), status: "CLAIM_PENDING", lockerId: "L-11", retentionDays: 60, expiresAt: daysFromNow(60), sensitive: JSON.stringify({serialNumber:"FB5-3321", privateTraits:"Small band tear", walletContents:null, finderPhone:"+91-9888877776"}), reporterId: "u-finder1" },
  ];

  for (const it of itemsData) {
    await prisma.item.create({ data: it });
  }

  const claims = [
    { id: "claim-1", itemId: "item-keys", claimantId: "u-student1", secretAnswer: "Blue tag room 204", proofImageUrl: null, status: "PENDING", fraudFlags: JSON.stringify([]), qrToken: null, otpCode: null, otpExpiresAt: null },
    { id: "claim-2", itemId: "item-airpods", claimantId: "u-student2", secretAnswer: "Engraved A.K.", proofImageUrl: "/proof/airpods.jpg", status: "PENDING", fraudFlags: JSON.stringify(["HIGH_VALUE_SIMULTANEOUS_CLAIM"]), qrToken: null, otpCode: null, otpExpiresAt: null },
    { id: "claim-3", itemId: "item-watch", claimantId: "u-student1", secretAnswer: "Band tear on side", proofImageUrl: null, status: "PENDING", fraudFlags: JSON.stringify(["HIGH_VALUE_SIMULTANEOUS_CLAIM"]), qrToken: null, otpCode: null, otpExpiresAt: null },
    { id: "claim-4", itemId: "item-id", claimantId: "u-student2", secretAnswer: "Matches my ID number", proofImageUrl: "/proof/id.jpg", status: "APPROVED", fraudFlags: JSON.stringify([]), qrToken: uuidv4(), otpCode: "123456", otpExpiresAt: daysFromNow(0.02) },
  ];
  for (const c of claims) await prisma.claim.create({ data: c });

  await prisma.chatMessage.createMany({
    data: [
      { id: "msg-1", itemId: "item-keys", senderId: "u-student1", message: "I think these are my dorm keys, can we meet at hostel gate?" },
      { id: "msg-2", itemId: "item-keys", senderId: "u-finder1", message: "Sure, contact me at [REDACTED FOR SAFETY] or [REDACTED FOR SAFETY]" },
      { id: "msg-3", itemId: "item-wallet", senderId: "u-student2", message: "I lost a brown wallet near ENG block yesterday." },
    ]
  });

  await prisma.feedback.create({ data: { id: "fb-1", claimId: "claim-4", userId: "u-student2", rating: 5, comment: "Smooth verification and pickup." } });
  console.log("Seed completed");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
