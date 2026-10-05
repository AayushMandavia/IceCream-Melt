'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/frontend/modules/auth/auth-client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'owner' | 'operator'>('owner');
  const [branch, setBranch] = useState<'branch-alpha' | 'branch-beta'>('branch-alpha');
  const [pin, setPin] = useState('123456');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInRole, setLoggedInRole] = useState<string | null>(null);

  // Check if session token already exists on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('melt_session_token');
      const devToken = localStorage.getItem('melt_dev_token');
      if (session) {
        setIsLoggedIn(true);
        if (devToken?.includes('owner')) {
          setLoggedInRole('Store Owner (Enterprise)');
        } else if (devToken?.includes('beta')) {
          setLoggedInRole('Operator Lead (Gachibowli)');
        } else if (devToken?.includes('operator') || devToken?.includes('alpha')) {
          setLoggedInRole('Operator Lead (Jubilee Hills)');
        } else {
          setLoggedInRole('Staff Member');
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('melt_session_token');
      localStorage.removeItem('melt_dev_token');
    }
    authClient.clearSession();
    authClient.setDevIdToken(null);
    setIsLoggedIn(false);
    setLoggedInRole(null);
    setError(null);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isOwner = selectedRole === 'owner';
      const devIdToken = isOwner
        ? 'mock-user:fb-owner-master:owner@melt.example.com:Stavan Sheth (Owner)'
        : branch === 'branch-beta'
        ? 'mock-user:fb-op-beta:operator.beta@melt.example.com:Anita Desai (Beta Lead)'
        : 'mock-user:fb-op-alpha:operator.alpha@melt.example.com:Raj Patel (Alpha Lead)';

      // 1. Store local dev identity
      localStorage.setItem('melt_dev_token', devIdToken);
      authClient.setDevIdToken(devIdToken);

      // 2. Verify PIN against backend auth endpoint
      const res = await fetch('/api/v1/auth/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${devIdToken}`,
        },
        body: JSON.stringify({
          pin: pin.trim(),
          scope: isOwner ? 'GLOBAL' : 'BRANCH',
          branchId: isOwner ? undefined : branch,
        }),
      });

      const json = (await res.json()) as {
        success?: boolean;
        data?: { sessionToken?: string };
        error?: { message?: string };
      };

      if (!json.success || !json.data?.sessionToken) {
        throw new Error(json.error?.message || 'Invalid security PIN. Please try again.');
      }

      // 3. Store verified session token
      localStorage.setItem('melt_session_token', json.data.sessionToken);
      authClient.setSessionToken(json.data.sessionToken);
      setIsLoggedIn(true);
      setLoggedInRole(
        isOwner
          ? 'Store Owner (Enterprise)'
          : branch === 'branch-beta'
          ? 'Operator Lead (Gachibowli)'
          : 'Operator Lead (Jubilee Hills)'
      );

      // 4. Route to target portal
      const targetUrl = isOwner ? '/owner' : `/operator?branch=${branch === 'branch-beta' ? 'beta' : 'alpha'}`;
      window.location.href = targetUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your PIN.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-3 sm:p-6 lg:p-10 font-['Nunito_Variable',sans-serif] text-[#2b1233] bg-[#fff1f4] bg-cover bg-center overflow-x-hidden"
      style={{
        backgroundImage: "url('/images/login/login-bg.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      {/* Main Split Container Card matching SS5 */}
      <div className="relative w-full max-w-[1140px] bg-gradient-to-br from-[#fff7f9]/95 via-[#fef2f5]/95 to-[#fdeef2]/95 backdrop-blur-xl border border-[#f7cfd8] rounded-[36px] md:rounded-[44px] shadow-[0_30px_90px_-20px_rgba(180,40,80,0.2)] overflow-hidden grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] min-h-[590px]">
        {/* ========================================================================= */}
        {/* Left Column: Brand, Heading, Live Badge, Stats & Hero Cone (SS5)          */}
        {/* ========================================================================= */}
        <div className="p-7 sm:p-9 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Top Brand Link Row */}
          <div className="flex items-center gap-3 relative z-30">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-[15px] font-bold text-[#2b1233] transition-colors"
            >
              <span className="text-xl">🍦</span>
              <span className="font-['Fredoka_Variable',sans-serif] text-lg font-black text-[#d61c5d] tracking-wide">
                Melt Theory
              </span>
            </Link>
            <span className="text-[#f4d3dd] text-base select-none">|</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#6f5569] hover:text-[#2b1233] transition-colors"
            >
              <span>←</span>
              <span>Back to store</span>
            </Link>
          </div>

          {/* Middle Left Content */}
          <div className="mt-8 mb-6 relative z-30 max-w-[340px]">
            {/* Hand-drawn dynamic burst lines above top scoop */}
            <div className="absolute -top-6 right-[-80px] hidden md:flex gap-1 select-none pointer-events-none text-[#d61c5d]/80 text-xl font-bold rotate-12">
              <span>\</span>
              <span>\</span>
              <span>\</span>
            </div>

            {/* Display Heading with Caveat Script word "scoops" */}
            <h1 className="font-['Fredoka_Variable',sans-serif] text-[clamp(42px,4.5vw,66px)] font-black text-[#2b1233] leading-[1.04] tracking-tight">
              Keep the <br />
              <span className="font-['Caveat_Variable',cursive] text-[#d61c5d] text-[1.22em] font-normal italic inline-block -rotate-2 transform">
                scoops
              </span>{' '}
              <br />
              moving.
            </h1>

            {/* Subtext */}
            <p className="mt-3.5 text-[15.5px] font-semibold text-[#6f5569] leading-snug">
              Staff access for orders, inventory &amp; parlours.
            </p>

            {/* Live Operations Pill */}
            <div className="inline-flex items-center gap-2 mt-6 px-3.5 py-1.5 rounded-full bg-white border border-[#f4d3dd] shadow-sm text-[13px] font-bold text-[#2b1233]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Live operations</span>
            </div>

            {/* Pink squiggly accent above stats */}
            <div className="mt-3 text-[#d61c5d] text-lg font-bold select-none pointer-events-none">
              ~
            </div>

            {/* Stats Capsule Card */}
            <div className="mt-1 flex items-center gap-4 sm:gap-5 bg-white/95 border border-[#f4d3dd] rounded-2xl p-3 px-4 shadow-[0_8px_22px_-8px_rgba(120,20,60,0.12)] w-max">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#fff1f4] flex items-center justify-center text-sm">🛒</span>
                <div>
                  <span className="font-['Fredoka_Variable',sans-serif] font-black text-[#2b1233] text-base leading-none block">
                    48
                  </span>
                  <span className="text-[11px] font-semibold text-[#8c6b79] leading-tight block mt-0.5">
                    Live orders
                  </span>
                </div>
              </div>
              <div className="w-px h-7 bg-[#f4d3dd]" />
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#fff1f4] flex items-center justify-center text-sm">📦</span>
                <div>
                  <span className="font-['Fredoka_Variable',sans-serif] font-black text-[#2b1233] text-base leading-none block">
                    6
                  </span>
                  <span className="text-[11px] font-semibold text-[#8c6b79] leading-tight block mt-0.5">
                    Low stock
                  </span>
                </div>
              </div>
              <div className="w-px h-7 bg-[#f4d3dd]" />
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#fff1f4] flex items-center justify-center text-sm">🏪</span>
                <div>
                  <span className="font-['Fredoka_Variable',sans-serif] font-black text-[#2b1233] text-base leading-none block">
                    3
                  </span>
                  <span className="text-[11px] font-semibold text-[#8c6b79] leading-tight block mt-0.5">
                    Parlours open
                  </span>
                </div>
              </div>
            </div>

            {/* Handwritten Note & Arrow pointing to Cone */}
            <div className="mt-5 flex items-center gap-2">
              <span className="font-['Caveat_Variable',cursive] text-[18px] font-semibold text-[#2b1233] italic">
                Good ice-cream runs on great people.
              </span>
              <svg
                className="w-7 h-7 text-[#d61c5d] rotate-12 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12c5 4 10 3 14-2m0 0l-4-1m4 1l-2 4" />
              </svg>
            </div>
          </div>

          {/* Ice Cream Cone Hero Composite Image (SS5 asset: login-cone-hero.png) */}
          <div className="hidden md:block absolute -right-8 bottom-[-15px] lg:right-[-35px] lg:bottom-[-20px] w-[340px] lg:w-[410px] pointer-events-none select-none z-20">
            <img
              src="/images/login/login-cone-hero.png"
              alt="Melt Triple Scoop Cone with Toppings"
              className="w-full h-auto drop-shadow-[0_24px_45px_rgba(140,20,60,0.25)]"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Right Column: Crisp White Portal Login Card (SS5 asset: login-card-shape) */}
        {/* ========================================================================= */}
        <div className="relative flex flex-col justify-center p-6 sm:p-9 md:p-12 z-30">
          {/* Card background with organic wavy left edge (SS5 asset: login-card-shape.png) */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none select-none -z-10 hidden sm:block"
            style={{
              backgroundImage: "url('/images/login/login-card-shape.png')",
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              filter: 'drop-shadow(0 20px 45px rgba(120, 20, 60, 0.12))',
            }}
          />
          {/* Fallback solid white card background for small mobile screens */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-3xl border border-[#f4d3dd] sm:hidden -z-20" />

          {/* Card Content Header */}
          <div className="text-center mb-6 pl-0 sm:pl-3">
            <div className="inline-flex items-center justify-center gap-1.5 text-[#d61c5d] font-['Fredoka_Variable',sans-serif] text-base font-bold">
              <span>🍦</span>
              <span>Melt Theory</span>
            </div>
            <h2 className="font-['Fredoka_Variable',sans-serif] text-[27px] font-black text-[#2b1233] leading-tight mt-1.5">
              Staff &amp; Admin Portal
            </h2>
            <p className="text-[13.5px] font-semibold text-[#6f5569] mt-1.5 max-w-[320px] mx-auto leading-relaxed">
              Authenticate with your management PIN to access live order fulfilment, inventory, and analytics.
            </p>

            {isLoggedIn && (
              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active Session: {loggedInRole ?? 'Verified'}</span>
              </div>
            )}
          </div>

          {/* Portal Switcher Tabs (Owner Portal vs Operator Desk) */}
          <div className="grid grid-cols-2 bg-[#fff1f4] p-1.5 rounded-2xl gap-1.5 mb-5 border border-[#f4d3dd]/60 pl-0 sm:pl-3">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('owner');
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-[13px] font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'owner'
                  ? 'bg-white text-[#d61c5d] shadow-[0_4px_12px_rgba(120,20,60,0.12)]'
                  : 'text-[#6f5569] hover:text-[#2b1233]'
              }`}
            >
              <span>👑</span>
              <span>Owner Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('operator');
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-[13px] font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'operator'
                  ? 'bg-white text-[#d61c5d] shadow-[0_4px_12px_rgba(120,20,60,0.12)]'
                  : 'text-[#6f5569] hover:text-[#2b1233]'
              }`}
            >
              <span>📋</span>
              <span>Operator Desk</span>
            </button>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleLogin} className="space-y-4 pl-0 sm:pl-3">
            {/* Operator Branch Selector (shown only when Operator Desk is active) */}
            {selectedRole === 'operator' && (
              <div className="text-left">
                <label className="block text-xs font-bold text-[#2b1233] mb-1.5">
                  Select Branch Parlour
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value as 'branch-alpha' | 'branch-beta')}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#f4d3dd] bg-[#fffafb] text-[#2b1233] text-sm font-bold focus:outline-none focus:border-[#d61c5d]"
                >
                  <option value="branch-alpha">Jubilee Hills Parlour (Alpha)</option>
                  <option value="branch-beta">Gachibowli Parlour (Beta)</option>
                </select>
              </div>
            )}

            {/* PIN Header row & Input Box */}
            <div className="text-left">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#2b1233]">
                  Management Security PIN
                </label>
                <button
                  type="button"
                  onClick={() => setPin('123456')}
                  className="text-xs font-bold text-[#d61c5d] hover:underline cursor-pointer"
                  title="Click to fill default PIN"
                >
                  Default PIN: 123456
                </button>
              </div>

              {/* Password Input with Golden Lock Icon inside */}
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••"
                  className="w-full h-13 px-4 pr-12 rounded-2xl border border-[#f4d3dd] bg-white text-center text-xl font-black text-[#2b1233] tracking-[0.4em] focus:outline-none focus:border-[#d61c5d] focus:ring-2 focus:ring-[#d61c5d]/20 transition-all shadow-inner placeholder:tracking-[0.4em]"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-[#8c6b79] hover:text-[#2b1233] transition-colors cursor-pointer"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
                {error}
              </div>
            )}

            {/* Unlock Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 rounded-2xl bg-[#d61c5d] hover:bg-[#b8144d] text-white font-extrabold text-[15px] shadow-[0_10px_25px_-5px_rgba(214,28,93,0.42)] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <span>Unlock portal →</span>
              )}
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-[11.5px] font-semibold text-[#8c6b79] pl-0 sm:pl-3">
            <span>🛡️</span>
            <span>Secure access • Authorized staff only</span>
          </div>

          {/* Quick shortcuts if already logged in */}
          {isLoggedIn && (
            <div className="mt-5 pt-4 border-t border-[#f4d3dd] text-center pl-0 sm:pl-3">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Link
                  href="/owner"
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#fff1f4] text-[#d61c5d] border border-[#f4d3dd] hover:bg-white transition-colors"
                >
                  👑 Owner Desk
                </Link>
                <Link
                  href="/operator?branch=alpha"
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#fff1f4] text-[#d61c5d] border border-[#f4d3dd] hover:bg-white transition-colors"
                >
                  📋 Jubilee Hills
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
