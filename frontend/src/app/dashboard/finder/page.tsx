'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Item,
  User,
  ItemCategory,
  ItemType,
} from '../../../types';
import { api } from '../../../lib/api';
import { DEMO_USERS, CAMPUS_BUILDINGS } from '../../../lib/mockData';
import { useAuth } from '../../../context/AuthContext';
import { AppHeader } from '../../../components/layout/AppHeader';
import {
  Camera,
  HeartHandshake,
  MapPin,
  Lock,
  QrCode,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  Radio,
  RefreshCw,
  Upload,
  Video,
  VideoOff,
} from 'lucide-react';

export default function FinderDashboard() {
  const router = useRouter();
  const { user: authUser, token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!authUser || !token)) {
      router.replace('/');
    }
  }, [authUser, token, isLoading, router]);

  const currentUser: User = authUser || DEMO_USERS.FINDER;

  const [items, setItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<'FAST_LOG' | 'DEPOT_PASS' | 'CONTRIBUTIONS'>('FAST_LOG');

  // Fast-Log Studio Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [selectedBuildingId, setSelectedBuildingId] = useState('bld_student_union');
  const [privateAnswer, setPrivateAnswer] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generated Drop-Off Pass State
  const [depositPass, setDepositPass] = useState<{
    code: string;
    itemId?: string;
    itemTitle: string;
    depotLocation: string;
    lockerId: string;
    expiresInMinutes: number;
    status: 'GENERATED' | 'UNLOCKED' | 'DEPOSITED';
  } | null>({
    code: 'DEPOT-DROP-8492',
    itemId: 'item_fnd_002',
    itemTitle: 'Apple AirPods Pro Gen 2',
    depotLocation: 'Student Union Smart Vault Depot (Ground Floor Bay 2)',
    lockerId: 'L-14',
    expiresInMinutes: 45,
    status: 'GENERATED',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        showToast('Device photo loaded into AI optical stream!');
      };
      reader.readAsDataURL(file);
    }
  };

  const refreshData = async () => {
    const loaded = await api.getItems({}, 'FINDER');
    setItems(loaded);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Real Camera WebRTC Stream State & Refs
  const [isLiveCamera, setIsLiveCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        showToast('Camera API not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsLiveCamera(true);
      showToast('Live camera active! Position product in scan frame.');
    } catch (err: any) {
      setCameraError('Camera access denied or unavailable.');
      showToast('Camera permission denied or camera device not found.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCamera(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureProductScan = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const capturedData = canvas.toDataURL('image/jpeg', 0.88);
        setImageUrl(capturedData);
        setIsCapturing(true);
        setTimeout(() => {
          setIsCapturing(false);
          stopCamera();
          showToast('Product scanned from camera! AI contours indexed.');
        }, 500);
        return;
      }
    }
    handleSimulateShutter();
  };

  const handleSimulateShutter = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      showToast('Camera snapshot captured! AI contour indexed.');
    }, 800);
  };

  const handleFastLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter an item title');
      return;
    }

    try {
      setIsSubmitting(true);
      const bld = CAMPUS_BUILDINGS.find((b) => b.id === selectedBuildingId) || CAMPUS_BUILDINGS[0];

      const newItem = await api.createItem(
        {
          title,
          category,
          type: 'FOUND' as ItemType,
          brand: 'Unspecified',
          color: 'Standard',
          buildingId: bld.id,
          coords: {
            x: bld.x,
            y: bld.y,
            lat: bld.lat,
            lng: bld.lng,
          },
          imageUrl,
          retentionDays: 30,
          expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
          sensitive: {
            serialNumber: 'SN-FOUND-' + Math.floor(1000 + Math.random() * 9000),
            privateTraits: privateAnswer || 'Disclosed to depot security',
            finderPhone: currentUser.email,
          },
        },
        'FINDER'
      );

      const generatedCode = 'DEPOT-DROP-' + Math.floor(1000 + Math.random() * 9000);
      setDepositPass({
        code: generatedCode,
        itemId: newItem.item.id,
        itemTitle: newItem.item.title,
        depotLocation: `${bld.name} Smart Vault Depot`,
        lockerId: `L-${Math.floor(1 + Math.random() * 40).toString().padStart(2, '0')}`,
        expiresInMinutes: 60,
        status: 'GENERATED',
      });

      setTitle('');
      setDescription('');
      setPrivateAnswer('');
      await refreshData();
      setActiveTab('DEPOT_PASS');
      showToast(`Item logged! Drop-off pass generated: ${generatedCode}`);
    } catch (err: any) {
      showToast(err?.message || 'Error logging item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlockAndDeposit = async () => {
    if (!depositPass) return;
    setDepositPass({ ...depositPass, status: 'DEPOSITED' });
    if (depositPass.itemId) {
      await api.updateItemStatus(depositPass.itemId, 'LOGGED_IN_DEPOT', depositPass.lockerId, 'FINDER');
      await refreshData();
    }
    showToast(`Locker ${depositPass.lockerId} locked! Item secured into depot vault.`);
  };

  const myLoggedItems = items.filter(
    (i) => i.sensitive?.finderPhone === currentUser.email || i.type === 'FOUND'
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-telemetry-emerald selection:text-black transition-colors">
      <AppHeader currentUser={currentUser} activeRoleTitle="GOOD SAMARITAN FINDER" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Finder Minimalist Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Log a Found Item
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Snap a photo with your camera or upload an image to help return a lost item.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-apple-pill bg-black/5 dark:bg-white/5 border border-hairline text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-telemetry-emerald" />
              <span>{myLoggedItems.length} Logged Items</span>
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-hairline pb-2">
          <button
            onClick={() => setActiveTab('FAST_LOG')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'FAST_LOG'
                ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white border border-hairline shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[#FF4A36]" />
            <span>Scan &amp; Log</span>
          </button>

          <button
            onClick={() => setActiveTab('DEPOT_PASS')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'DEPOT_PASS'
                ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white border border-hairline shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#FBE74E]" />
            <span>Locker Drop-Off</span>
            {depositPass && depositPass.status !== 'DEPOSITED' && (
              <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('CONTRIBUTIONS')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'CONTRIBUTIONS'
                ? 'bg-white dark:bg-[#1E1F30] text-slate-900 dark:text-white border border-hairline shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-[#F866DB]" />
            <span>My Items ({myLoggedItems.length})</span>
          </button>
        </div>

        {/* TAB 1: Fast-Log Studio */}
        {activeTab === 'FAST_LOG' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 6 Cols: Tesla Viewfinder Studio & Live WebCam Scanner */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative rounded-apple-2xl overflow-hidden border border-hairline bg-black shadow-2xl aspect-[4/3] flex items-center justify-center group">
                {isLiveCamera ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={imageUrl}
                    alt="Camera Viewfinder Stream"
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                )}

                {/* Hidden canvas for video snapshot */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Target HUD Overlay */}
                <div className="absolute inset-0 p-5 pointer-events-none flex flex-col justify-between">
                  {/* Top HUD */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-apple-pill bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-telemetry-emerald flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-telemetry-emerald animate-pulse" />
                      <span>{isLiveCamera ? 'LIVE WEBCAM OPTICAL FEED' : 'AI OPTICAL VIEW'}</span>
                    </span>

                    <div className="pointer-events-auto flex items-center gap-1.5">
                      {isLiveCamera ? (
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-2.5 py-1 rounded-apple-pill bg-tesla-crimson hover:bg-tesla-crimson/90 text-white text-[10px] font-mono flex items-center gap-1 transition-all shadow-md"
                        >
                          <VideoOff className="w-3 h-3" />
                          <span>Close Camera</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-2.5 py-1 rounded-apple-pill bg-apple-blue hover:bg-apple-blueHover text-white text-[10px] font-mono flex items-center gap-1 transition-all shadow-md"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Enable Live Camera</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Center Target Box */}
                  <div className="self-center w-48 h-48 border-2 border-dashed border-white/40 rounded-apple-xl flex items-center justify-center relative">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-apple-blue absolute -top-1 -left-1" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-apple-blue absolute -top-1 -right-1" />
                    <div className="w-4 h-4 border-b-2 border-l-2 border-apple-blue absolute -bottom-1 -left-1" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-apple-blue absolute -bottom-1 -right-1" />
                    <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-apple-pill">
                      {isLiveCamera ? 'Center Product' : 'Contour Lock'}
                    </span>
                  </div>

                  {/* Bottom HUD */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 bg-black/70 backdrop-blur-md p-2 rounded-apple-md">
                    <span>GPS: 240.5N &middot; 320.1W</span>
                    <span>AI AUTO-CLASSIFIER: {isLiveCamera ? 'STREAMING' : 'ACTIVE'}</span>
                  </div>
                </div>

                {/* Camera Shutter / Scan button */}
                <button
                  type="button"
                  onClick={isLiveCamera ? captureProductScan : handleSimulateShutter}
                  disabled={isCapturing}
                  className="absolute bottom-6 self-center w-14 h-14 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 active:scale-95 transition-all flex items-center justify-center shadow-2xl backdrop-blur-md pointer-events-auto"
                  title={isLiveCamera ? "Capture Live Product Scan" : "Snap photo"}
                >
                  <div className={`w-10 h-10 rounded-full ${isLiveCamera ? 'bg-telemetry-emerald' : 'bg-white'}`} />
                </button>
              </div>

              {/* Sample Photo Swatches & Upload */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <label className="px-2.5 py-1 rounded-apple-pill text-[10px] font-mono border border-telemetry-emerald/40 bg-telemetry-emerald/10 text-telemetry-emerald hover:bg-telemetry-emerald/20 transition-all cursor-pointer flex-shrink-0 flex items-center gap-1 font-bold">
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                <span className="text-[10px] font-mono uppercase text-slate-500 flex-shrink-0">
                  Samples:
                </span>
                {[
                  { label: 'AirPods', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80' },
                  { label: 'MacBook', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80' },
                  { label: 'Leather Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80' },
                  { label: 'HydroFlask', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80' },
                  { label: 'Casio Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setImageUrl(s.url)}
                    className={`px-2.5 py-1 rounded-apple-pill text-[10px] font-mono border transition-all flex-shrink-0 ${
                      imageUrl === s.url
                        ? 'bg-telemetry-emerald text-black font-bold border-transparent'
                        : 'bg-white/5 border-hairline text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right 6 Cols: Instant Metadata Logging Form */}
            <form onSubmit={handleFastLogSubmit} className="lg:col-span-6 space-y-4 p-6 rounded-apple-2xl studio-surface border border-hairline shadow-lg">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Fast-Log Details
                </h2>
                <p className="text-xs text-slate-500">
                  Fill key descriptors to generate an automated smart locker drop-off pass.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple AirPods Pro with matte black case"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/5 border border-hairline text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-telemetry-emerald"
                />
              </div>

              {/* Category Pills */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                  Category Tag
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['Electronics', 'Wallets/Bags', 'Keys', 'Identification', 'Apparel', 'Books'] as ItemCategory[]).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1 rounded-apple-pill text-[10px] font-mono font-bold transition-all ${
                          category === cat
                            ? 'bg-telemetry-emerald text-black shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 text-slate-400 hover:text-white border border-hairline'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Location Node Detection */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Found Location / GPS Campus Node
                </label>
                <select
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/5 border border-hairline text-xs text-slate-900 dark:text-white focus:outline-none focus:border-telemetry-emerald"
                >
                  {CAMPUS_BUILDINGS.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                      {b.name} ({b.code}) — Bay {b.id.slice(-2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Private Traits (Zero-Exposure) */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Private Verification Trait (Revealed only to verified claimant)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blue star sticker on rear or serial ending in 492"
                  value={privateAnswer}
                  onChange={(e) => setPrivateAnswer(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/5 border border-hairline text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-telemetry-emerald"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full bg-[#FF4A36] hover:bg-[#FF5C47] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#FF4A36]/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Indexing Item...' : 'Log Found Item & Issue Locker Pass'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Depot Drop-off & Smart Locker Pass */}
        {activeTab === 'DEPOT_PASS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 6 cols: Apple Wallet Style Contactless Locker Pass */}
            <div className="lg:col-span-6 space-y-4">
              {depositPass ? (
                <div className="rounded-apple-2xl bg-gradient-to-br from-slate-900 via-black to-slate-950 border border-hairline p-6 text-white shadow-2xl relative overflow-hidden space-y-6">
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-telemetry-emerald/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-apple-md bg-telemetry-emerald/20 flex items-center justify-center text-telemetry-emerald">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-telemetry-emerald font-bold uppercase tracking-wider block">
                          Autonomous Smart Vault Deposit Pass
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          Authorized Good Samaritan Intake
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-apple-pill bg-white/10 border border-white/20 text-[10px] font-mono text-slate-300">
                      BAY ACTIVE
                    </span>
                  </div>

                  {/* Pass Body */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400">Depositing Item</div>
                      <div className="text-lg font-bold text-white tracking-tight">
                        {depositPass.itemTitle}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-slate-400">Assigned Depot Vault</div>
                        <div className="text-xs font-semibold text-slate-200">
                          {depositPass.depotLocation}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-mono uppercase text-slate-400">Assigned Locker ID</div>
                        <div className="text-xl font-bold font-mono text-telemetry-emerald">
                          {depositPass.lockerId}
                        </div>
                      </div>
                    </div>

                    {/* Deposit Token Barcode & Code */}
                    <div className="p-4 rounded-apple-xl bg-white/5 border border-hairline flex flex-col items-center justify-center text-center space-y-2">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                        Scan or Enter Code at Depot Terminal
                      </div>
                      <div className="text-2xl font-mono font-bold tracking-widest text-white px-4 py-2 rounded-apple-md bg-black border border-white/20">
                        {depositPass.code}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Expires in {depositPass.expiresInMinutes} minutes &middot; Rotating 256-bit token
                      </div>
                    </div>
                  </div>

                  {/* Simulated Unlock Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleUnlockAndDeposit}
                      disabled={depositPass.status === 'DEPOSITED'}
                      className={`w-full py-3 rounded-apple-pill font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        depositPass.status === 'DEPOSITED'
                          ? 'bg-white/10 text-slate-400 cursor-not-allowed'
                          : 'bg-telemetry-emerald hover:bg-telemetry-emerald/90 text-black shadow-lg'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      <span>
                        {depositPass.status === 'DEPOSITED'
                          ? 'Item Secured in Smart Vault'
                          : `Simulate Unlocking Locker ${depositPass.lockerId}`}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-10 rounded-apple-2xl studio-surface border border-hairline text-center space-y-3">
                  <Lock className="w-8 h-8 mx-auto text-slate-500" />
                  <p className="text-xs text-slate-400">
                    No active drop-off pass. Log an item in the Fast-Log studio to receive a locker access code.
                  </p>
                </div>
              )}
            </div>

            {/* Right 6 cols: Walking Direction & Depot Guide */}
            <div className="lg:col-span-6 space-y-4 p-6 rounded-apple-2xl studio-surface border border-hairline">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-apple-blue" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Depot Locker Walking Route
                </h3>
              </div>

              <div className="p-4 rounded-apple-xl bg-black/[0.02] dark:bg-white/[0.02] border border-hairline space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Walking Distance</span>
                  <span className="font-bold text-telemetry-emerald">140 meters (2 min walk)</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Depot Station</span>
                  <span className="font-semibold text-slate-200">Student Union Ground Bay</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Hours</span>
                  <span className="font-semibold text-slate-200">24/7 Automated Touchscreen</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-500">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  How contactless locker deposit works:
                </div>
                <ol className="list-decimal pl-4 space-y-1.5 font-mono text-[11px]">
                  <li>Walk to the automated smart vault touchscreen in the Student Union bay.</li>
                  <li>Tap "Good Samaritan Deposit" and type code <strong className="text-telemetry-emerald">{depositPass?.code}</strong>.</li>
                  <li>Locker door opens automatically. Place item inside and latch the door.</li>
                  <li>System audits locker scale weight, sends custody notification to security, and logs verified intake!</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: My Logged Contributions */}
        {activeTab === 'CONTRIBUTIONS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  My Community Contributions
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time custody tracking for every item you registered with the campus ecosystem.
                </p>
              </div>
              <span className="text-xs font-mono text-telemetry-emerald font-bold">
                {myLoggedItems.length} items logged
              </span>
            </div>

            <div className="rounded-apple-xl studio-surface border border-hairline overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-hairline text-[10px] font-mono uppercase text-slate-400">
                  <tr>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Campus Node</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Custody Chain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {myLoggedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-10 h-10 rounded-apple-sm object-cover border border-hairline"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            ID: {item.id}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{item.category}</td>
                      <td className="p-3.5 text-slate-300">
                        {CAMPUS_BUILDINGS.find((b) => b.id === item.buildingId)?.name || item.buildingId}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-apple-pill text-[10px] font-mono font-bold uppercase bg-telemetry-emerald/10 text-telemetry-emerald border border-telemetry-emerald/20">
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                        Locker Vault &middot; Safe Custody
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-apple-pill bg-black/90 dark:bg-white/95 text-white dark:text-black text-xs font-semibold border border-hairline shadow-2xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-telemetry-emerald" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
