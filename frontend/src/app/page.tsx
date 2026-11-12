'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Building,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
  BarChart3,
  Layers,
  Activity,
  Zap,
} from 'lucide-react';
import { UserRole } from '../types';
import { useAuth, roleRouteMap } from '../context/AuthContext';
import { ThemeToggle } from '../components/common/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, quickLogin, isAuthenticated, user } = useAuth();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');

  // Form Fields
  const [email, setEmail] = useState('student@university.edu');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Computer Science');

  // UI State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  const roleConfigs: {
    role: UserRole;
    label: string;
    subtext: string;
    icon: React.ElementType;
    badgeColor: string;
  }[] = [
    {
      role: 'STUDENT',
      label: 'Student',
      subtext: 'Search catalog & claim items',
      icon: GraduationCap,
      badgeColor: 'text-apple-blue bg-apple-blue/10 border-apple-blue/20',
    },
    {
      role: 'FINDER',
      label: 'Finder',
      subtext: 'Scan & log found items',
      icon: HeartHandshake,
      badgeColor: 'text-telemetry-emerald bg-telemetry-emerald/10 border-telemetry-emerald/20',
    },
    {
      role: 'SECURITY',
      label: 'Security',
      subtext: 'Verify claims & lockers',
      icon: KeyRound,
      badgeColor: 'text-tesla-amber bg-tesla-amber/10 border-tesla-amber/20',
    },
    {
      role: 'ADMIN',
      label: 'Admin',
      subtext: 'Campus governance',
      icon: BarChart3,
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please provide an email address.');
      return;
    }

    if (!trimmedEmail.toLowerCase().endsWith('.edu')) {
      setErrorMessage('University email ending with .edu is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (authMode === 'LOGIN') {
        await login(trimmedEmail, selectedRole);
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }
        await register(trimmedEmail, fullName.trim(), selectedRole, department);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setErrorMessage(null);
    try {
      setIsSubmitting(true);
      await quickLogin(role);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Quick login error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateSso = async () => {
    setErrorMessage(null);
    setSsoLoading(true);
    setTimeout(async () => {
      try {
        await quickLogin(selectedRole);
      } catch (err: any) {
        setErrorMessage(err?.message || 'SSO authentication error');
      } finally {
        setSsoLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-apple-blue selection:text-white transition-colors">
      {/* Top Header */}
      <header className="w-full h-14 apple-header px-4 sm:px-8 flex items-center justify-between border-b border-hairline">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-5 h-5 rounded-full bg-[#FF4A36] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center">
              <span>MITE</span>
              <span className="text-[#FF4A36]">Retrieve</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Split Authentication Screen */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Intro Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4A36]/10 border border-[#FF4A36]/20 text-xs font-semibold text-[#FF4A36]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MITERetrieve &middot; Campus Recovery</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
            Everything lost, <span className="text-[#FF4A36]">found</span> together.
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            The modern lost and found app built for university life. Replace chaotic lost posts and manual depot sheets with unified, private recovery.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="w-5 h-5 rounded-full bg-[#FF4A36] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                ✓
              </div>
              <span>One unified workspace for students, finders, security, and staff</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="w-5 h-5 rounded-full bg-[#FBE74E] text-black flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                ✓
              </div>
              <span>Live camera product scanning &amp; contactless smart lockers</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="w-5 h-5 rounded-full bg-[#00D084] text-black flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                ✓
              </div>
              <span>Private zero-exposure verification with QR &amp; OTP pickup passes</span>
            </div>
          </div>
        </div>

        {/* Right Universal Auth Card (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="w-full max-w-lg mx-auto rounded-[28px] studio-surface border border-hairline p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Segmented Auth Mode Switcher */}
            <div className="flex p-1 rounded-full bg-black/5 dark:bg-white/5 border border-hairline mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('LOGIN');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  authMode === 'LOGIN'
                    ? 'bg-white dark:bg-[#26283D] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('REGISTER');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  authMode === 'REGISTER'
                    ? 'bg-white dark:bg-[#26283D] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Persona Role Selection Pill Grid */}
            <div className="mb-5 space-y-2">
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Select your role:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {roleConfigs.map((rc) => {
                  const Icon = rc.icon;
                  const isSelected = selectedRole === rc.role;
                  return (
                    <button
                      key={rc.role}
                      type="button"
                      onClick={() => {
                        setSelectedRole(rc.role);
                        if (!email || email.includes('@university.edu')) {
                          setEmail(`${rc.role.toLowerCase()}@university.edu`);
                        }
                      }}
                      className={`p-2.5 rounded-apple-lg border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-apple-blue bg-apple-blue/10 shadow-sm'
                          : 'border-hairline bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected ? 'text-apple-blue' : 'text-slate-400'
                          }`}
                        />
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-apple-blue" />
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                        {rc.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authMode === 'REGISTER' && (
                <div>
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/5 border border-hairline text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-apple-blue"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  University Email (.edu)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="your.id@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/5 border border-hairline text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-apple-blue"
                  />
                </div>
              </div>

              {authMode === 'REGISTER' && (
                <div>
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Department or Major
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/5 border border-hairline text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-apple-blue"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/5 border border-hairline text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-apple-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="p-2.5 rounded-apple-md bg-tesla-crimson/10 border border-tesla-crimson/30 text-tesla-crimson text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full bg-[#FF4A36] hover:bg-[#FF5C47] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#FF4A36]/25 hover:shadow-lg hover:shadow-[#FF4A36]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>
                  {isSubmitting
                    ? 'Signing In...'
                    : authMode === 'LOGIN'
                    ? `Sign In as ${selectedRole}`
                    : `Create ${selectedRole} Account`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo & SSO Section */}
            <div className="mt-4 pt-4 border-t border-hairline space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemo(selectedRole)}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-full bg-[#FF4A36]/10 hover:bg-[#FF4A36]/15 text-[#FF4A36] border border-[#FF4A36]/20 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Demo Login as {selectedRole}</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateSso}
                disabled={ssoLoading}
                className="w-full py-2.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-hairline text-xs font-medium text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{ssoLoading ? 'Connecting to University SSO...' : 'University SSO Sign In'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-4 sm:px-8 border-t border-hairline text-center text-xs text-slate-500">
        MITERetrieve &middot; MITE Campus Lost &amp; Found Ecosystem
      </footer>
    </div>
  );
}
