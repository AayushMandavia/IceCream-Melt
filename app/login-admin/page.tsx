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
      setLoggedInRole(isOwner ? 'Store Owner (Enterprise)' : branch === 'branch-beta' ? 'Operator Lead (Gachibowli)' : 'Operator Lead (Jubilee Hills)');

      // 4. Smoothly route to target portal
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
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fff1f4 0%, #fae6ec 100%)',
        color: '#2b1233',
        fontFamily: 'var(--font-body-family), system-ui, sans-serif',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ========================================================================= */}
      {/* Top Header Bar */}
      {/* ========================================================================= */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Back to Public Showcase */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 1rem',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #f4d3dd',
            borderRadius: '9999px',
            textDecoration: 'none',
            color: '#2b1233',
            fontSize: '0.875rem',
            fontWeight: 800,
            boxShadow: '0 8px 24px -10px rgba(120, 20, 60, 0.2)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>🍦</span>
          <span style={{ fontFamily: 'var(--font-display-family)', color: '#d61c5d' }}>Melt Theory</span>
          <span style={{ color: '#8c6b79', fontWeight: 600 }}>← Back to Store</span>
        </Link>

        {/* ========================================================================= */}
        {/* ss3 Login Navigation Bar: ONLY SHOWN ONCE LOGGED IN */}
        {/* ========================================================================= */}
        {isLoggedIn ? (
          <div
            style={{
              display: 'flex',
              gap: '0.65rem',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid #f4d3dd',
              borderRadius: '9999px',
              padding: '0.35rem 0.5rem 0.35rem 1rem',
              boxShadow: '0 14px 40px -16px rgba(120, 20, 60, 0.35)',
            }}
          >
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#2b1233',
                fontFamily: 'var(--font-display-family)',
              }}
            >
              Order Desk:
            </span>
            <Link
              href="/order"
              style={{
                padding: '0.45rem 1rem',
                background: '#d61c5d',
                color: '#ffffff',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 800,
                boxShadow: '0 3px 0 #a3134a',
                transition: 'all 0.15s ease',
              }}
            >
              🍦 Order Online
            </Link>
            <Link
              href="/operator"
              style={{
                padding: '0.45rem 0.95rem',
                background: '#fff1f4',
                border: '1px solid #f4d3dd',
                color: '#2b1233',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 700,
                transition: 'all 0.15s ease',
              }}
            >
              📋 Operator Desk
            </Link>
            <Link
              href="/owner"
              style={{
                padding: '0.45rem 0.95rem',
                background: '#fff1f4',
                border: '1px solid #f4d3dd',
                color: '#2b1233',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 700,
                transition: 'all 0.15s ease',
              }}
            >
              👑 Owner Portal
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out of Session"
              style={{
                padding: '0.45rem 0.75rem',
                background: '#ffffff',
                border: '1px solid #f4d3dd',
                color: '#a3134a',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🔓 Sign Out
            </button>
          </div>
        ) : null}
      </header>

      {/* ========================================================================= */}
      {/* Admin Login Panel Container */}
      {/* ========================================================================= */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.25rem 4rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(20px)',
            border: '1px solid #f4d3dd',
            borderRadius: '32px',
            padding: '2.25rem',
            boxShadow: '0 24px 60px -20px rgba(120, 20, 60, 0.25)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <span style={{ fontSize: '3rem', display: 'inline-block', marginBottom: '0.5rem' }}>🔐</span>
            <h1
              style={{
                fontFamily: 'var(--font-display-family)',
                fontSize: '1.85rem',
                fontWeight: 900,
                color: '#2b1233',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Staff &amp; Admin Panel
            </h1>
            <p style={{ color: '#7a5a67', fontSize: '0.925rem', marginTop: '0.45rem', lineHeight: 1.4 }}>
              Authenticate with your management PIN to access live order fulfillment, inventory, and analytics.
            </p>

            {isLoggedIn && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  marginTop: '0.85rem',
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  background: '#e9f8ed',
                  color: '#1a7536',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  border: '1px solid #c3ebcd',
                }}
              >
                <span>●</span> Session Active: {loggedInRole ?? 'Verified'}
              </div>
            )}
          </div>

          {/* Portal Switcher Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: '#fff1f4',
              padding: '0.35rem',
              borderRadius: '16px',
              gap: '0.35rem',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setSelectedRole('owner');
                setError(null);
              }}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '12px',
                border: 'none',
                background: selectedRole === 'owner' ? '#ffffff' : 'transparent',
                color: selectedRole === 'owner' ? '#d61c5d' : '#7a5a67',
                fontWeight: selectedRole === 'owner' ? 800 : 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: selectedRole === 'owner' ? '0 4px 12px rgba(120, 20, 60, 0.12)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              👑 Owner Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('operator');
                setError(null);
              }}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '12px',
                border: 'none',
                background: selectedRole === 'operator' ? '#ffffff' : 'transparent',
                color: selectedRole === 'operator' ? '#d61c5d' : '#7a5a67',
                fontWeight: selectedRole === 'operator' ? 800 : 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: selectedRole === 'operator' ? '0 4px 12px rgba(120, 20, 60, 0.12)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              📋 Operator Desk
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Operator Branch Selection */}
            {selectedRole === 'operator' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#2b1233',
                    marginBottom: '0.4rem',
                  }}
                >
                  Branch Location
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value as 'branch-alpha' | 'branch-beta')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '14px',
                    border: '1.5px solid #f4d3dd',
                    background: '#ffffff',
                    color: '#2b1233',
                    fontSize: '0.925rem',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                >
                  <option value="branch-alpha">Jubilee Hills Parlour (Alpha)</option>
                  <option value="branch-beta">Gachibowli Parlour (Beta)</option>
                </select>
              </div>
            )}

            {/* PIN Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2b1233' }}>
                  Management Security PIN
                </label>
                <button
                  type="button"
                  onClick={() => setPin('123456')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.75rem',
                    color: '#d61c5d',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                  title="Click to fill default PIN"
                >
                  Default PIN: 123456
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 6-digit PIN"
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 1rem',
                    borderRadius: '14px',
                    border: '1.5px solid #f4d3dd',
                    background: '#ffffff',
                    color: '#2b1233',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    letterSpacing: showPin ? '0.15em' : '0.3em',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    color: '#8c6b79',
                  }}
                >
                  {showPin ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '12px',
                  background: '#ffeef2',
                  border: '1px solid #f8c7d3',
                  color: '#b31548',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: '#d61c5d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '16px',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(214, 28, 93, 0.35)',
                transition: 'all 0.15s ease',
              }}
            >
              {loading
                ? 'Authenticating...'
                : selectedRole === 'owner'
                ? 'Unlock & Enter Owner Portal →'
                : 'Unlock & Enter Operator Desk →'}
            </button>
          </form>

          {/* Quick Shortcuts (Available when session is verified) */}
          {isLoggedIn && (
            <div
              style={{
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #f4d3dd',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c6b79', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>
                ⚡ Direct Portal Access
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/owner"
                  style={{
                    padding: '0.45rem 0.95rem',
                    borderRadius: '9999px',
                    background: '#fff1f4',
                    border: '1px solid #f4d3dd',
                    color: '#2b1233',
                    textDecoration: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                  }}
                >
                  👑 Owner Portal →
                </Link>
                <Link
                  href="/operator?branch=alpha"
                  style={{
                    padding: '0.45rem 0.95rem',
                    borderRadius: '9999px',
                    background: '#fff1f4',
                    border: '1px solid #f4d3dd',
                    color: '#2b1233',
                    textDecoration: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                  }}
                >
                  📋 Jubilee Hills Desk →
                </Link>
                <Link
                  href="/operator?branch=beta"
                  style={{
                    padding: '0.45rem 0.95rem',
                    borderRadius: '9999px',
                    background: '#fff1f4',
                    border: '1px solid #f4d3dd',
                    color: '#2b1233',
                    textDecoration: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                  }}
                >
                  📋 Gachibowli Desk →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
