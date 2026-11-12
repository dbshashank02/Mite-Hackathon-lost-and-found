'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '../../types';
import { useAuth, roleRouteMap } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { LogOut, ArrowLeftRight, ShieldCheck, Activity, User as UserIcon } from 'lucide-react';

interface AppHeaderProps {
  currentUser?: User | null;
  activeRoleTitle?: string;
  badgeColor?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  activeRoleTitle,
  badgeColor = 'text-apple-blue',
}) => {
  const { user: authUser, logout, quickLogin } = useAuth();
  const router = useRouter();
  const user = currentUser || authUser;

  const roles: { role: UserRole; label: string }[] = [
    { role: 'STUDENT', label: 'Student' },
    { role: 'FINDER', label: 'Finder' },
    { role: 'SECURITY', label: 'Security' },
    { role: 'ADMIN', label: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full h-14 apple-header px-4 sm:px-8 flex items-center justify-between border-b border-hairline transition-colors">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        {/* Left: Brand + Depot Status Pulse */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>FindIt</span>
              <span className="text-apple-blue font-bold">Campus</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-apple-pill bg-white/5 border border-hairline text-[10px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-telemetry-emerald animate-pulse" />
            <span>DEPOT ONLINE</span>
            <span className="text-slate-600 dark:text-slate-500">|</span>
            <span className="text-slate-300 font-semibold">{activeRoleTitle || (user?.role ? `${user.role} HUB` : 'ECOSYSTEM')}</span>
          </div>
        </div>

        {/* Center: Switch Portal Pill Bar (Desktop) */}
        <div className="hidden lg:flex items-center p-1 rounded-apple-pill bg-black/40 dark:bg-white/5 border border-hairline gap-1">
          {roles.map((r) => {
            const isSelected = user?.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => {
                  quickLogin(r.role);
                }}
                className={`px-3 py-1 rounded-apple-pill text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-apple-blue text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Right: Active Profile + Sign Out Button + Theme */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-apple-pill bg-white/5 border border-hairline">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold">
                {user.handle.charAt(0)}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.handle.split(' ')[0]}
                </span>
                <span className="text-[9px] font-mono text-apple-blue font-bold uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {/* Sign Out / Switch Portal Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-apple-pill bg-white/10 hover:bg-white/15 dark:bg-white/5 dark:hover:bg-white/10 border border-hairline text-slate-700 dark:text-slate-300 hover:text-white text-xs font-medium transition-all"
            title="Sign out and return to Institutional Gatekeeper"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Switch Portal</span>
            <LogOut className="w-3.5 h-3.5 ml-0.5 text-tesla-crimson" />
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
