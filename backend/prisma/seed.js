const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FindIt Campus SQLite Database...');

  // 1. Clear existing data
  await prisma.feedback.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  // 2. Users
  const users = [
    {
      id: 'usr_alex_01',
      email: 'alex.rivera@university.edu',
      handle: 'Alex Rivera',
      role: 'STUDENT',
      department: 'Computer Science & AI',
      verifiedBadge: true,
    },
    {
      id: 'usr_priya_02',
      email: 'priya.sharma@university.edu',
      handle: 'Priya Sharma (Finder)',
      role: 'FINDER',
      department: 'Biomedical Engineering',
      verifiedBadge: true,
    },
    {
      id: 'usr_officer_dan',
      email: 'dan.vance@university.edu',
      handle: 'Officer Dan Vance',
      role: 'SECURITY',
      department: 'Campus Safety & Custody Depot',
      verifiedBadge: true,
    },
    {
      id: 'usr_admin_elena',
      email: 'elena.rostova@university.edu',
      handle: 'Dean Elena Rostova',
      role: 'ADMIN',
      department: 'Office of Campus Administration',
      verifiedBadge: true,
    },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  // 3. 12 Items across all 9 custody states
  const items = [
    {
      id: 'item_fnd_001',
      type: 'FOUND',
      title: 'Space Gray MacBook Pro 14" M3',
      category: 'Electronics',
      brand: 'Apple',
      color: 'Space Gray',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      buildingId: 'BLD_LIB',
      coords: JSON.stringify({ x: 280, y: 160, lat: 12.9716, lng: 77.5946 }),
      timestamp: '2026-11-12T08:15:00Z',
      status: 'LOGGED_IN_DEPOT',
      lockerId: 'DEPOT-LK-14B',
      retentionDays: 60,
      expiresAt: '2027-01-11T08:15:00Z',
      sensitive: JSON.stringify({
        serialNumber: 'C02G4050MD6M',
        privateTraits: 'Holographic GitHub Octocat sticker with small scratch on lower-left corner of lid',
        walletContents: 'N/A',
        finderPhone: '+1 (555) 392-8172',
      }),
    },
    {
      id: 'item_lost_001',
      type: 'LOST',
      title: 'MacBook Pro 14" with Stickers',
      category: 'Electronics',
      brand: 'Apple',
      color: 'Dark Gray',
      imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
      buildingId: 'BLD_LIB',
      coords: JSON.stringify({ x: 285, y: 165, lat: 12.9717, lng: 77.5947 }),
      timestamp: '2026-11-12T07:45:00Z',
      status: 'MATCH_SUGGESTED',
      lockerId: null,
      retentionDays: 30,
      expiresAt: '2026-12-12T07:45:00Z',
      sensitive: JSON.stringify({
        serialNumber: 'C02G4050MD6M',
        privateTraits: 'GitHub Octocat sticker and slight dent near headphone jack',
        walletContents: 'N/A',
        finderPhone: '+1 (555) 784-9021',
      }),
    },
    {
      id: 'item_fnd_002',
      type: 'FOUND',
      title: 'Bellroy Slim Leather Bifold Wallet',
      category: 'Wallets/Bags',
      brand: 'Bellroy',
      color: 'Caramel Tan',
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
      buildingId: 'BLD_UNION',
      coords: JSON.stringify({ x: 450, y: 320, lat: 12.9712, lng: 77.5952 }),
      timestamp: '2026-11-11T16:20:00Z',
      status: 'CLAIM_PENDING',
      lockerId: 'DEPOT-LK-03A',
      retentionDays: 90,
      expiresAt: '2027-02-09T16:20:00Z',
      sensitive: JSON.stringify({
        serialNumber: 'N/A',
        privateTraits: 'Embossed initials "A.R." inside cash slot',
        walletContents: '$42 in cash, MetroCard ending in 8912, Campus ID Card',
        finderPhone: '+1 (555) 234-9811',
      }),
    },
    {
      id: 'item_lost_002',
      type: 'LOST',
      title: 'Brown Leather Minimalist Wallet',
      category: 'Wallets/Bags',
      brand: 'Bellroy / Unknown',
      color: 'Tan Brown',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
      buildingId: 'BLD_UNION',
      coords: JSON.stringify({ x: 455, y: 315, lat: 12.9711, lng: 77.5954 }),
      timestamp: '2026-11-11T15:50:00Z',
      status: 'CLAIM_PENDING',
      lockerId: null,
      retentionDays: 30,
      expiresAt: '2026-12-11T15:50:00Z',
      sensitive: JSON.stringify({
        serialNumber: 'N/A',
        privateTraits: 'Initials AR embossed inside, holds student transit card',
        walletContents: 'Approx $40 cash, campus dining card',
        finderPhone: '+1 (555) 441-2093',
      }),
    },
    {
      id: 'item_fnd_003',
      type: 'FOUND',
      title: 'Subaru Keyfob with Red Paracord Lanyard',
      category: 'Keys',
      brand: 'Subaru',
      color: 'Black / Red',
      imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80',
      buildingId: 'BLD_TECH',
      coords: JSON.stringify({ x: 620, y: 180, lat: 12.9722, lng: 77.5960 }),
      timestamp: '2026-11-10T11:00:00Z',
      status: 'AWAITING_PICKUP',
      lockerId: 'DEPOT-LK-08F',
      retentionDays: 60,
      expiresAt: '2027-01-09T11:00:00Z',
      sensitive: JSON.stringify({
        serialNumber: 'FCC ID: CWTWBU766',
        privateTraits: 'Titanium carabiner + small brass mini Swiss-army key',
        walletContents: 'N/A',
        finderPhone: '+1 (555) 901-4432',
      }),
    },
    {
      id: 'item_fnd_004',
      type: 'FOUND',
      title: 'Sony WH-1000XM5 Noise-Canceling Headphones',
      category: 'Electronics',
      brand: 'Sony',
      color: 'Silver / Cream',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      buildingId: 'BLD_DINE',
      coords: JSON.stringify({ x: 220, y: 440, lat: 12.9705, lng: 77.5939 }),
      timestamp: '2026-11-09T13:30:00Z',
      status: 'VERIFICATION_APPROVED',
      lockerId: 'DEPOT-LK-21C',
      retentionDays: 90,
      expiresAt: '2027-02-07T13:30:00Z',
      sensitive: JSON.stringify({
        serialNumber: 'SN: 81920399120',
        privateTraits: 'Custom pastel green zipper pull on carrying case',
        walletContents: 'N/A',
        finderPhone: '+1 (555) 678-1200',
      }),
    },
    {
      id: 'item_fnd_005',
      type: 'FOUND',
      title: 'University Engineering Lab Notebook & TI-84 Plus',
      category: 'Books',
      brand: 'Texas Instruments',
      color: 'Navy Blue',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      buildingId: 'BLD_TECH',
      coords: JSON.stringify({ x: 625, y: 175, lat: 12.9723, lng: 77.5961 }),
      timestamp: '2026-11-08T09:00:00Z',
      status: 'REPORTED',
      lockerId: null,
      retentionDays: 30,
      expiresAt: '2026-12-08T09:00:00Z',
      sensitive: JSON.stringify({
        serialNumber: 'TI-84-CE-78901',
        privateTraits: 'Formula cheatsheet taped inside front cover for PHYS-201',
        walletContents: 'N/A',
        finderPhone: '+1 (555) 887-3129',
      }),
    },
    {
      id: 'item_fnd_006',
      type: 'FOUND',
      title: 'North Face Thermoball Hooded Jacket',
      category: 'Apparel',
      brand: 'The North Face',
      color: 'Forest Green',
      imageUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
      buildingId: 'BLD_ARENA',
      coords: JSON.stringify({ x: 740, y: 380, lat: 12.9708, lng: 77.5975 }),
      timestamp: '2026-11-07T18:00:00Z',
      status: 'RETURNED',
      lockerId: null,
      retentionDays: 30,
      expiresAt: '2026-12-07T18:00:00Z',
      sensitive: JSON.stringify({
        serialNumber: 'N/A',
        privateTraits: 'Small pin of Saturn on chest lapel',
        walletContents: 'Locker padlock combination written on paper scrap in pocket',
        finderPhone: '+1 (555) 345-0987',
      }),
    },
    {
      id: 'item_lost_003',
      type: 'LOST',
      title: 'Official Campus Student ID Badge',
      category: 'Identification',
      brand: 'University ID Card',
      color: 'White / Blue',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
      buildingId: 'BLD_DORM',
      coords: JSON.stringify({ x: 380, y: 560, lat: 12.9698, lng: 77.5948 }),
      timestamp: '2026-11-06T20:10:00Z',
      status: 'REPORTED',
      lockerId: null,
      retentionDays: 90,
      expiresAt: '2027-02-04T20:10:00Z',
      sensitive: JSON.stringify({
        serialNumber: 'STU-ID-901823',
        privateTraits: 'Back barcode slightly scratched with blue lanyard',
        walletContents: 'Campus dorm access chip inside',
        finderPhone: '+1 (555) 601-3829',
      }),
    },
    {
      id: 'item_fnd_007',
      type: 'FOUND',
      title: 'Apple AirPods Pro 2 with USB-C Case',
      category: 'Electronics',
      brand: 'Apple',
      color: 'Gloss White',
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
      buildingId: 'BLD_DINE',
      coords: JSON.stringify({ x: 225, y: 445, lat: 12.9706, lng: 77.5940 }),
      timestamp: '2026-10-15T12:00:00Z',
      status: 'UNCLAIMED_ARCHIVE',
      lockerId: 'ARCHIVE-SEC-B',
      retentionDays: 60,
      expiresAt: '2026-12-14T12:00:00Z',
      sensitive: JSON.stringify({
        serialNumber: 'H19F8721MD6P',
        privateTraits: 'Red silicone protective sleeve with small ring carabiner',
        walletContents: 'N/A',
        finderPhone: '+1 (555) 491-0021',
      }),
    },
    {
      id: 'item_fnd_008',
      type: 'FOUND',
      title: 'Wilson Evolution Indoor Basketball',
      category: 'Apparel',
      brand: 'Wilson',
      color: 'Orange / Leather',
      imageUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop&q=80',
      buildingId: 'BLD_ARENA',
      coords: JSON.stringify({ x: 745, y: 385, lat: 12.9709, lng: 77.5976 }),
      timestamp: '2026-09-01T15:00:00Z',
      status: 'AUCTION_DONATED',
      lockerId: null,
      retentionDays: 30,
      expiresAt: '2026-10-01T15:00:00Z',
      sensitive: JSON.stringify({
        serialNumber: 'N/A',
        privateTraits: 'Black sharpie initials "Varsity 24" on valve panel',
        walletContents: 'N/A',
        finderPhone: '+1 (555) 120-9831',
      }),
    },
    {
      id: 'item_fnd_009',
      type: 'FOUND',
      title: 'Stanley 40oz Quencher Tumbler',
      category: 'Apparel',
      brand: 'Stanley',
      color: 'Rose Quartz Pink',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
      buildingId: 'BLD_LIB',
      coords: JSON.stringify({ x: 282, y: 162, lat: 12.9716, lng: 77.5946 }),
      timestamp: '2026-11-12T09:30:00Z',
      status: 'LOGGED_IN_DEPOT',
      lockerId: 'DEPOT-LK-02B',
      retentionDays: 30,
      expiresAt: '2026-12-12T09:30:00Z',
      sensitive: JSON.stringify({
        serialNumber: 'N/A',
        privateTraits: 'Sticker of Yosemite National Park near the base handle',
        walletContents: 'N/A',
        finderPhone: '+1 (555) 431-7722',
      }),
    },
  ];

  for (const item of items) {
    await prisma.item.create({ data: item });
  }

  // 4. Claims
  const claims = [
    {
      id: 'clm_90812',
      itemId: 'item_fnd_002',
      claimantId: 'usr_alex_01',
      secretAnswer: 'Embossed initials AR inside the middle card slot and $42 folded bills.',
      proofImageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&auto=format&fit=crop&q=80',
      status: 'PENDING',
      fraudFlags: JSON.stringify([
        'Claimant account created 14 days ago',
        'Exact serial match pending physical verification',
      ]),
      qrToken: 'QR-PASS-78B-BELLROY-AUTH',
      otpCode: '849201',
      otpExpiresAt: '2026-11-12T12:00:00Z',
      createdAt: '2026-11-11T17:10:00Z',
    },
    {
      id: 'clm_45129',
      itemId: 'item_fnd_003',
      claimantId: 'usr_alex_01',
      secretAnswer: 'Subaru Impreza keyfob with titanium carabiner clip and emergency brass key.',
      proofImageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      fraudFlags: JSON.stringify([]),
      qrToken: 'QR-PASS-90A-SUBARU-4912',
      otpCode: '529314',
      otpExpiresAt: '2026-11-12T15:30:00Z',
      createdAt: '2026-11-10T14:00:00Z',
    },
  ];

  for (const c of claims) {
    await prisma.claim.create({ data: c });
  }

  // 5. Chat Messages
  const chats = [
    {
      id: 'msg_1',
      itemId: 'item_fnd_001',
      senderId: 'usr_priya_02',
      senderRole: 'FINDER',
      senderHandle: 'Priya S. (Finder)',
      message: 'Hello! I turned this MacBook into the Main Desk custody office.',
      timestamp: '2026-11-12T08:30:00Z',
      scrubbedNotice: false,
    },
    {
      id: 'msg_2',
      itemId: 'item_fnd_001',
      senderId: 'usr_officer_dan',
      senderRole: 'SECURITY',
      senderHandle: 'Officer Dan (Depot)',
      message: 'Logged in Locker DEPOT-LK-14B. The student can initiate a verification claim.',
      timestamp: '2026-11-12T08:42:00Z',
      scrubbedNotice: false,
    },
    {
      id: 'msg_3',
      itemId: 'item_fnd_001',
      senderId: 'usr_alex_01',
      senderRole: 'STUDENT',
      senderHandle: 'Alex R. (Claimant)',
      message: 'Thank you so much! I submitted my claim with proof of purchase.',
      timestamp: '2026-11-12T09:00:00Z',
      scrubbedNotice: false,
    },
  ];

  for (const msg of chats) {
    await prisma.chatMessage.create({ data: msg });
  }

  console.log('✅ SQLite Seed Completed Successfully:');
  console.log(`- ${users.length} Users seeded`);
  console.log(`- ${items.length} Items seeded across all 9 custody states`);
  console.log(`- ${claims.length} Claims seeded`);
  console.log(`- ${chats.length} Chat Messages seeded`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
