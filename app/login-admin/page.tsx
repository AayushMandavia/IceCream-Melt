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
      className="min-h-screen relative flex items-center justify-center p-3 sm:p-5 md:p-8 font-['Nunito_Variable',sans-serif] text-[#241126] bg-[#fff1f4] bg-cover bg-center overflow-x-hidden"
      style={{
        backgroundImage: "url('/images/login/login-bg.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      {/* ========================================================================= */}
      {/* DESKTOP / TABLET: 1:1 EXACT REPLICA OF TARGET IMAGE (media_1791201887459) */}
      {/* ========================================================================= */}
      <div className="hidden md:block relative w-full max-w-[1024px] aspect-[1024/576] mx-auto select-none shadow-[0_25px_80px_-15px_rgba(200,40,80,0.18)] rounded-[38px] overflow-hidden">
        {/* Master background artwork matching user image down to the pixel */}
        <img
          src="/images/login/login-canvas-base@2x.png"
          alt="Melt Theory Staff & Admin Portal"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Clickable Area over ← Back to store */}
        <Link
          href="/"
          className="absolute left-[7.6%] top-[14%] w-[19%] h-[6%] z-30 cursor-pointer rounded-lg hover:bg-[#d61c5d]/5 transition-colors"
          title="Back to store"
        />

        {/* Interactive Form overlay precisely aligned over the right white portal area */}
        <div
          className="absolute z-20 flex flex-col justify-between items-center text-center px-1"
          style={{
            left: '63.08%',
            top: '11.8%',
            width: '29.1%',
            height: '76.4%',
          }}
        >
          {/* Header */}
          <div className="w-full">
            <div className="inline-flex items-center justify-center gap-1.5 text-[#d61c5d] font-['Fredoka_Variable',sans-serif] text-[15px] font-bold">
              <span>🍦</span>
              <span>Melt Theory</span>
            </div>
            <h2 className="font-['Fredoka_Variable',sans-serif] text-[24px] lg:text-[26px] font-black text-[#241126] leading-tight mt-0.5">
              Staff &amp; Admin Portal
            </h2>
            <p className="text-[11px] lg:text-[11.8px] font-semibold text-[#71556b] mt-1 leading-snug max-w-[275px] mx-auto">
              Authenticate with your management PIN to access live order fulfilment, inventory, and analytics.
            </p>

            {isLoggedIn && (
              <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10.5px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active: {loggedInRole ?? 'Verified'}</span>
              </div>
            )}
          </div>

          {/* Role Switcher Tabs */}
          <div className="w-full grid grid-cols-2 bg-[#fdf3f5] p-1 rounded-2xl gap-1 border border-[#f9dde3] shadow-inner">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('owner');
                setError(null);
              }}
              className={`py-2 px-2 rounded-xl text-[11.5px] lg:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'owner'
                  ? 'bg-white text-[#d61c5d] shadow-[0_2px_8px_rgba(180,40,80,0.08)]'
                  : 'text-[#71556b] hover:text-[#241126]'
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
              className={`py-2 px-2 rounded-xl text-[11.5px] lg:text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'operator'
                  ? 'bg-white text-[#d61c5d] shadow-[0_2px_8px_rgba(180,40,80,0.08)]'
                  : 'text-[#71556b] hover:text-[#241126]'
              }`}
            >
              <span>📋</span>
              <span>Operator Desk</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full space-y-2.5">
            {selectedRole === 'operator' && (
              <div className="text-left">
                <label className="block text-[10.5px] font-bold text-[#241126] mb-0.5">
                  Select Branch Parlour
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value as 'branch-alpha' | 'branch-beta')}
                  className="w-full px-2.5 py-1 rounded-xl border border-[#f9dde3] bg-[#fffafb] text-[#241126] text-xs font-bold focus:outline-none focus:border-[#d61c5d]"
                >
                  <option value="branch-alpha">Jubilee Hills (Alpha)</option>
                  <option value="branch-beta">Gachibowli (Beta)</option>
                </select>
              </div>
            )}

            {/* PIN Header row & Input Box */}
            <div className="text-left">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-[#241126]">
                  Management Security PIN
                </label>
                <button
                  type="button"
                  onClick={() => setPin('123456')}
                  className="text-[10.5px] font-bold text-[#d61c5d] hover:underline cursor-pointer"
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
                  className="w-full h-10 px-3 pr-9 rounded-2xl border border-[#f9dde3] bg-white text-center text-lg font-black text-[#241126] tracking-[0.45em] focus:outline-none focus:border-[#d61c5d] focus:ring-2 focus:ring-[#d61c5d]/20 transition-all shadow-inner placeholder:tracking-[0.45em]"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8c6b79] hover:text-[#241126] transition-colors cursor-pointer"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10.5px] font-bold text-center">
                {error}
              </div>
            )}

            {/* Unlock Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-2xl bg-[#d01c59] hover:bg-[#b8144d] text-white font-extrabold text-[14px] shadow-[0_8px_20px_-3px_rgba(208,28,89,0.38)] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <span>Unlock portal →</span>
              )}
            </button>
          </form>

          {/* Footer Security Badge & Session status */}
          <div className="w-full">
            <div className="text-center flex items-center justify-center gap-1.5 text-[10.5px] font-semibold text-[#8c6b79]">
              <span className="text-xs">🛡️</span>
              <span>Secure access • Authorized staff only</span>
            </div>

            {isLoggedIn && (
              <div className="mt-2 pt-1.5 border-t border-[#f4d3dd] text-center">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <Link
                    href="/owner"
                    className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#fff1f4] text-[#d61c5d] border border-[#f4d3dd] hover:bg-white transition-colors"
                  >
                    👑 Owner Desk
                  </Link>
                  <Link
                    href="/operator?branch=alpha"
                    className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#fff1f4] text-[#d61c5d] border border-[#f4d3dd] hover:bg-white transition-colors"
                  >
                    📋 Jubilee Hills
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE ADAPTATION: Responsive card layout for small smartphone screens    */}
      {/* ========================================================================= */}
      <div className="md:hidden w-full max-w-[420px] bg-white border border-[#f7cfd8] rounded-[28px] shadow-[0_20px_60px_-15px_rgba(180,40,80,0.18)] overflow-hidden p-6">
        {/* Top Brand Link Row */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-xl">🍦</span>
            <span className="font-['Fredoka_Variable',sans-serif] text-base font-black text-[#d61c5d]">
              Melt Theory
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-[#6f5569] hover:text-[#241126] transition-colors"
          >
            ← Back to store
          </Link>
        </div>

        {/* Mobile Header */}
        <div className="text-center mb-5">
          <h2 className="font-['Fredoka_Variable',sans-serif] text-2xl font-black text-[#241126] leading-tight">
            Staff &amp; Admin Portal
          </h2>
          <p className="text-xs font-semibold text-[#71556b] mt-1 leading-relaxed">
            Authenticate with your management PIN to access live order fulfilment, inventory, and analytics.
          </p>
        </div>

        {/* Mobile Role Switcher Tabs */}
        <div className="grid grid-cols-2 bg-[#fdf3f5] p-1 rounded-2xl gap-1 mb-4 border border-[#f9dde3]">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('owner');
              setError(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'owner'
                ? 'bg-white text-[#d61c5d] shadow-[0_2px_8px_rgba(180,40,80,0.08)]'
                : 'text-[#71556b]'
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
            className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'operator'
                ? 'bg-white text-[#d61c5d] shadow-[0_2px_8px_rgba(180,40,80,0.08)]'
                : 'text-[#71556b]'
            }`}
          >
            <span>📋</span>
            <span>Operator Desk</span>
          </button>
        </div>

        {/* Mobile Authentication Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          {selectedRole === 'operator' && (
            <div className="text-left">
              <label className="block text-xs font-bold text-[#241126] mb-1">
                Select Branch Parlour
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as 'branch-alpha' | 'branch-beta')}
                className="w-full px-3 py-2 rounded-xl border border-[#f9dde3] bg-[#fffafb] text-[#241126] text-xs font-bold focus:outline-none focus:border-[#d61c5d]"
              >
                <option value="branch-alpha">Jubilee Hills (Alpha)</option>
                <option value="branch-beta">Gachibowli (Beta)</option>
              </select>
            </div>
          )}

          {/* PIN Header row & Input Box */}
          <div className="text-left">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-[#241126]">
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
                className="w-full h-11 px-3 pr-10 rounded-2xl border border-[#f9dde3] bg-white text-center text-lg font-black text-[#241126] tracking-[0.45em] focus:outline-none focus:border-[#d61c5d] focus:ring-2 focus:ring-[#d61c5d]/20 transition-all shadow-inner placeholder:tracking-[0.45em]"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base text-[#8c6b79] hover:text-[#241126] transition-colors cursor-pointer"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* Unlock Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-2xl bg-[#d01c59] hover:bg-[#b8144d] text-white font-extrabold text-[14px] shadow-[0_8px_20px_-3px_rgba(208,28,89,0.38)] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <span>Unlock portal →</span>
            )}
          </button>
        </form>

        {/* Footer Security Badge */}
        <div className="mt-4 text-center flex items-center justify-center gap-1.5 text-xs font-semibold text-[#8c6b79]">
          <span>🛡️</span>
          <span>Secure access • Authorized staff only</span>
        </div>

        {/* Quick shortcuts if already logged in */}
        {isLoggedIn && (
          <div className="mt-4 pt-3 border-t border-[#f4d3dd] text-center">
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <Link
                href="/owner"
                className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#fff1f4] text-[#d61c5d] border border-[#f4d3dd]"
              >
                👑 Owner Desk
              </Link>
              <Link
                href="/operator?branch=alpha"
                className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#fff1f4] text-[#d61c5d] border border-[#f4d3dd]"
              >
                📋 Jubilee Hills
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-rose-600 border border-rose-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
