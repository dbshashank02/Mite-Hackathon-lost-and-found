'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  BarChart3,
  CheckCircle2,
  Lock,
  Activity,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/common/ThemeToggle';

interface PortalCardConfig {
  role: UserRole;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  demoEmail: string;
  demoName: string;
  description: string;
  accentBorder: string;
  accentBg: string;
  highlightText: string;
}

export default function GatekeeperPage() {
  const { login, quickLogin } = useAuth();
  const [activeInputRole, setActiveInputRole] = useState<UserRole | null>(null);
  const [customEmails, setCustomEmails] = useState<Record<UserRole, string>>({
    STUDENT: '',
    FINDER: '',
    SECURITY: '',
    ADMIN: '',
  });
  const [errorMsg, setErrorMsg] = useState<{ role: UserRole; msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<UserRole | null>(null);

  const portals: PortalCardConfig[] = [
    {
      role: 'STUDENT',
      title: 'Student Portal',
      badge: 'SSO VERIFIED',
      badgeColor: 'text-apple-blue bg-apple-blue/10 border-apple-blue/20',
      icon: GraduationCap,
      demoEmail: 'student@university.edu',
      demoName: 'Alex Rivera (CS Student)',
      description:
        'Browse campus catalog with zero-exposure privacy shields, receive AI match notifications, and unlock Apple Wallet pickup passes.',
      accentBorder: 'hover:border-apple-blue/40',
      accentBg: 'group-hover:bg-apple-blue/5',
      highlightText: 'Loss Recovery & Pickup Pass',
    },
    {
      role: 'FINDER',
      title: 'Good Samaritan Finder Portal',
      badge: 'CAMPUS HERO',
      badgeColor: 'text-telemetry-emerald bg-telemetry-emerald/10 border-telemetry-emerald/20',
      icon: HeartHandshake,
      demoEmail: 'finder@university.edu',
      demoName: 'Priya Sharma (Good Samaritan)',
      description:
        'Camera-first fast log studio with auto GPS telemetry, smart locker drop-off pass, and live custody contribution tracking.',
      accentBorder: 'hover:border-telemetry-emerald/40',
      accentBg: 'group-hover:bg-telemetry-emerald/5',
      highlightText: 'Fast-Log & Smart Locker Deposit',
    },
    {
      role: 'SECURITY',
      title: 'Campus Security & Depot Portal',
      badge: 'VAULT CLEARANCE',
      badgeColor: 'text-tesla-amber bg-tesla-amber/10 border-tesla-amber/20',
      icon: KeyRound,
      demoEmail: 'security@university.edu',
      demoName: 'Dan Vance (Campus Police / Vault)',
      description:
        'Unmasked telemetry with serial forensics, anti-fraud claim triage queue, and contactless QR / OTP physical handover scanner.',
      accentBorder: 'hover:border-tesla-amber/40',
      accentBg: 'group-hover:bg-tesla-amber/5',
      highlightText: 'Vault Intake & Fraud Verification',
    },
    {
      role: 'ADMIN',
      title: 'Super Admin Governance Portal',
      badge: 'EXECUTIVE IAM',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      icon: BarChart3,
      demoEmail: 'admin@university.edu',
      demoName: 'Elena Rostova (Campus Dean / Ops)',
      description:
        'Institutional recovery analytics, thermal loss quadrant heatmaps, 9-stage custody retention rules, and compliance CSV export.',
      accentBorder: 'hover:border-purple-500/40',
      accentBg: 'group-hover:bg-purple-500/5',
      highlightText: 'Institutional Telemetry & Audit',
    },
  ];

  const handleCustomSubmit = async (role: UserRole) => {
    const email = customEmails[role]?.trim();
    if (!email) {
      setErrorMsg({ role, msg: 'Please enter your institutional email.' });
      return;
    }
    if (!email.toLowerCase().endsWith('.edu')) {
      setErrorMsg({ role, msg: 'Strict Policy: Email must end with @university.edu' });
      return;
    }

    try {
      setIsSubmitting(role);
      setErrorMsg(null);
      await login(email, role);
    } catch (err: any) {
      setErrorMsg({ role, msg: err?.message || 'Authentication error' });
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleQuickSignIn = async (role: UserRole) => {
    try {
      setIsSubmitting(role);
      setErrorMsg(null);
      await quickLogin(role);
    } catch (err: any) {
      setErrorMsg({ role, msg: err?.message || 'Quick login failed' });
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-apple-blue selection:text-white transition-colors">
      {/* Top Bar */}
      <header className="w-full h-14 apple-header px-4 sm:px-8 flex items-center justify-between border-b border-hairline">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>FindIt</span>
              <span className="text-apple-blue font-bold">Campus</span>
            </span>
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-0.5 rounded-apple-pill bg-white/5 border border-hairline text-[10px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-telemetry-emerald animate-pulse" />
              <span>INSTITUTIONAL GATEWAY v2.5</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs font-mono text-slate-400">
              Single Sign-On (SSO) Protected
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Hero Telemetry Panel (Cols 1-5) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-apple-pill bg-white/10 dark:bg-white/5 border border-hairline text-xs font-mono text-apple-blue mb-6">
              <ShieldCheck className="w-4 h-4 text-apple-blue" />
              <span>Next-Gen Campus Ecosystem</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-4">
              Autonomous Lost & Found Architecture.
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
              Multimodal vision contour matching, anti-fraud privacy shielding, and automated smart locker custody chain for university campuses.
            </p>

            {/* Apple / Tesla Telemetry Stat Pills */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="p-4 rounded-apple-xl studio-surface border border-hairline shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Recovery Rate</span>
                  <Activity className="w-3.5 h-3.5 text-telemetry-emerald" />
                </div>
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                  94.2%
                </div>
                <span className="text-[10px] text-telemetry-emerald font-medium">
                  +12.8% vs Manual Log
                </span>
              </div>

              <div className="p-4 rounded-apple-xl studio-surface border border-hairline shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Median Return</span>
                  <Zap className="w-3.5 h-3.5 text-apple-blue" />
                </div>
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                  4.2 hrs
                </div>
                <span className="text-[10px] text-apple-blue font-medium">
                  AI-Assisted Dispatch
                </span>
              </div>

              <div className="p-4 rounded-apple-xl studio-surface border border-hairline shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Smart Vault</span>
                  <Lock className="w-3.5 h-3.5 text-tesla-amber" />
                </div>
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                  50 Lockers
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  Autonomous Contactless
                </span>
              </div>

              <div className="p-4 rounded-apple-xl studio-surface border border-hairline shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Privacy Shield</span>
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                  Zero-Exposure
                </div>
                <span className="text-[10px] text-purple-400 font-medium">
                  Masked Private Traits
                </span>
              </div>
            </div>

            {/* Architecture Guarantees */}
            <div className="p-4 rounded-apple-xl bg-black/[0.02] dark:bg-white/[0.02] border border-hairline space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-telemetry-emerald" />
                <span>4-Way Weighted AI Match Matrix (35% Visual, 30% Category, 20% Spatial, 15% Time)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-telemetry-emerald" />
                <span>Anti-Fraud Guard & Simultaneous High-Value Claim Detection</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-telemetry-emerald" />
                <span>Contactless Apple Wallet QR + 6-Digit Rotating OTP Handover</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Portal Selection Grid (Cols 6-12) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Select Your Campus Portal
              </h2>
              <p className="text-xs text-slate-500">
                Each persona receives a purpose-built workspace and cryptographic privilege scope.
              </p>
            </div>
            <span className="text-[10px] font-mono text-apple-blue font-bold uppercase tracking-wider px-2 py-0.5 rounded-apple-pill bg-apple-blue/10 border border-apple-blue/20">
              4 Roles Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portals.map((p) => {
              const Icon = p.icon;
              const isCardInputOpen = activeInputRole === p.role;
              const isThisSubmitting = isSubmitting === p.role;
              const currentError = errorMsg?.role === p.role ? errorMsg.msg : null;

              return (
                <div
                  key={p.role}
                  className={`group relative rounded-apple-xl studio-surface border border-hairline ${p.accentBorder} p-5 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl`}
                >
                  <div>
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-apple-lg bg-black/5 dark:bg-white/5 border border-hairline flex items-center justify-center text-slate-900 dark:text-white group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-apple-blue" />
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-apple-pill border ${p.badgeColor}`}
                      >
                        {p.badge}
                      </span>
                    </div>

                    {/* Title & Highlight */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-0.5">
                      {p.title}
                    </h3>
                    <p className="text-[11px] font-medium text-apple-blue mb-2.5">
                      {p.highlightText}
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 min-h-[48px]">
                      {p.description}
                    </p>

                    {/* Preconfigured Demo User Info */}
                    <div className="p-2.5 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.03] border border-hairline mb-4">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Demo User</div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {p.demoName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{p.demoEmail}</div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="space-y-2 pt-2 border-t border-hairline">
                    {/* 1-Click Instant Demo Sign In Button */}
                    <button
                      type="button"
                      disabled={isThisSubmitting}
                      onClick={() => handleQuickSignIn(p.role)}
                      className="w-full py-2.5 px-3 rounded-apple-pill bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>{isThisSubmitting ? 'Entering Hub...' : `Launch ${p.title.split(' ')[0]} Hub`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Custom @university.edu form */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveInputRole(isCardInputOpen ? null : p.role);
                        setErrorMsg(null);
                      }}
                      className="w-full py-1 text-center text-[10px] font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
                    >
                      {isCardInputOpen ? '— Hide custom login —' : 'or enter custom @university.edu ID'}
                    </button>

                    {/* Expandable Custom Login Input */}
                    <AnimatePresence>
                      {isCardInputOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 pt-1 overflow-hidden"
                        >
                          <input
                            type="email"
                            placeholder="your.name@university.edu"
                            value={customEmails[p.role]}
                            onChange={(e) =>
                              setCustomEmails({ ...customEmails, [p.role]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCustomSubmit(p.role);
                            }}
                            className="w-full px-3 py-1.5 rounded-apple-md bg-white/5 border border-hairline text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-apple-blue"
                          />

                          {currentError && (
                            <div className="text-[10px] text-tesla-crimson font-medium">
                              {currentError}
                            </div>
                          )}

                          <button
                            type="button"
                            disabled={isThisSubmitting}
                            onClick={() => handleCustomSubmit(p.role)}
                            className="w-full py-1.5 rounded-apple-pill bg-white/10 hover:bg-white/15 border border-hairline text-xs font-medium text-slate-800 dark:text-slate-200 transition-all"
                          >
                            Authenticate Custom ID
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-4 sm:px-8 border-t border-hairline text-center text-xs font-mono text-slate-500">
        FindIt Campus Autonomous Ecosystem &middot; Institutional IAM Gatekeeper &middot; Apple Precision + Tesla Telemetry Design System
      </footer>
    </div>
  );
}
