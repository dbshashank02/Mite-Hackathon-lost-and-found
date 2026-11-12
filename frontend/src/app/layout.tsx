import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FindIt Campus — Next-Gen AI Lost & Found Ecosystem',
  description:
    'Campus-wide intelligent lost and found network with multimodal vision matching, privacy shielding, contactless QR handover, and custody chain.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

import { AuthProvider } from '../context/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 antialiased selection:bg-[#FF5E3A] selection:text-white transition-colors duration-300">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
