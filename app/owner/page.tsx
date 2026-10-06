'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { OwnerDashboardView } from '@/frontend/modules/dashboard';
import { UnifiedOrderHistoryView, OperatorQueueView } from '@/frontend/modules/orders';
import { BranchManagementView } from '@/frontend/modules/branches';
import { BranchSettingsView, DataManagementView } from '@/frontend/modules/settings';
import { UnifiedLedgerView } from '@/frontend/modules/ledger';
import { OperatorInventoryView } from '@/frontend/modules/inventory';
import { OwnerMessagingView } from '@/frontend/modules/marketing';
import { Branch } from '@/shared/types/entities.types';
import { GlobalNavigation, BunMobileNav } from '@/frontend/components/ui';

type OwnerTab =
  | 'dashboard'
  | 'queue'
  | 'orders'
  | 'inventory'
  | 'branches'
  | 'ledger'
  | 'settings'
  | 'data'
  | 'marketing';

export default function OwnerPortalPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<OwnerTab>('dashboard');
  const [loadingBranches, setLoadingBranches] = useState<boolean>(true);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/branches');
      const json = (await res.json()) as { success?: boolean; data?: Branch[] };
      if (json.success && Array.isArray(json.data)) {
        setBranches(json.data);
      }
    } catch {
      // fallback
    } finally {
      setLoadingBranches(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleSelectBranchSettings = (branchId: string) => {
    setSelectedBranchId(branchId);
    setActiveTab('settings');
  };

  const branchOptions = [
    { id: 'ALL', name: 'All Branches (Enterprise)', code: 'GLOBAL' },
    ...branches.map((b) => ({ id: b.id, name: b.name, code: b.code })),
  ];

  const currentBranchName = selectedBranchId === 'ALL'
    ? 'All Branches'
    : (branches.find((b) => b.id === selectedBranchId)?.name ?? 'Branch');

  const tabItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'queue', label: 'Order Queue', icon: '👜' },
    { id: 'orders', label: 'History', icon: '📑' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'branches', label: 'Branches', icon: '🏪' },
    { id: 'ledger', label: 'Ledger', icon: '📖' },
    { id: 'marketing', label: 'Broadcast & Messages', icon: '📢' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'data', label: 'Data', icon: '📊' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url('/images/owner-bg.png')`,
        backgroundPosition: 'center top',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: '#fedfe5',
        color: '#2b1233',
        fontFamily: 'var(--font-body-family), system-ui, sans-serif',
      }}
    >
      {/* Floating Pill Header Bar (ss2) */}
      <header style={{ maxWidth: '1040px', margin: '0 auto', padding: '1.25rem 1rem 0 1rem' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '9999px',
            boxShadow: '0 4px 25px rgba(220, 50, 90, 0.08)',
            border: '1px solid #fbdce3',
            padding: '0.625rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          {/* Left: Brand + Subtitle + Dropdown Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: '#2b1233',
              }}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🍦</span>
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-display-family)',
                    fontWeight: 900,
                    fontSize: '1.25rem',
                    letterSpacing: '-0.02em',
                    color: '#d61c5d',
                    display: 'block',
                    lineHeight: 1,
                  }}
                >
                  MELT
                </span>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: '#75506b',
                    display: 'block',
                    marginTop: '0.1rem',
                  }}
                >
                  OWNER PORTAL
                </span>
              </div>
            </Link>

            {/* Enterprise Analytics & Controls Pill */}
            <div
              className="hidden sm:flex"
              style={{
                alignItems: 'center',
                gap: '0.4rem',
                background: '#fff2f5',
                border: '1px solid #f8d2dc',
                borderRadius: '9999px',
                padding: '0.35rem 0.9rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#441a37',
                cursor: 'pointer',
              }}
            >
              <span>Enterprise Analytics & Controls</span>
              <span style={{ fontSize: '0.65rem' }}>▼</span>
            </div>
          </div>

          {/* Right: Menu, Operator, Owner, Staff Desk */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Link
              href="/order"
              className="hidden md:inline-flex"
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid #f8d2dc',
                background: '#ffffff',
                color: '#552747',
                textDecoration: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🍽️</span>
              <span>Menu</span>
            </Link>

            <Link
              href="/operator"
              className="hidden md:inline-flex"
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid #f8d2dc',
                background: '#ffffff',
                color: '#552747',
                textDecoration: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>📋</span>
              <span>Operator</span>
            </Link>

            <div
              style={{
                padding: '0.35rem 0.95rem',
                borderRadius: '9999px',
                background: '#d61c5d',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 8px rgba(214, 28, 93, 0.3)',
              }}
            >
              <span>👑</span>
              <span>Owner</span>
            </div>

            <Link
              href="/operator"
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid #f8d2dc',
                background: '#ffffff',
                color: '#552747',
                textDecoration: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>👥</span>
              <span>Staff Desk</span>
              <span style={{ fontSize: '0.65rem' }}>▼</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Floating Pill Sub-Nav Tab Bar (ss2) */}
      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '0.75rem 1rem 0 1rem' }}>
        <nav
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '9999px',
            boxShadow: '0 4px 25px rgba(220, 50, 90, 0.08)',
            border: '1px solid #fbdce3',
            padding: '0.5rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="no-scrollbar"
        >
          {tabItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as OwnerTab)}
                style={{
                  padding: '0.4rem 0.95rem',
                  background: isActive ? '#d61c5d' : 'transparent',
                  border: 'none',
                  borderRadius: '9999px',
                  color: isActive ? '#ffffff' : '#552747',
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: isActive ? '0 2px 8px rgba(214, 28, 93, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1040px', margin: '0 auto', padding: '0.75rem 1rem 5rem 1rem' }}>
        {loadingBranches ? (
          <div className="app-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#6f5569' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>👑</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2b1233' }}>Loading Enterprise Workspace...</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <OwnerDashboardView
                branches={branches}
                selectedBranchId={selectedBranchId}
                onBranchChange={setSelectedBranchId}
              />
            )}
            {activeTab === 'queue' && (
              <div>
                {selectedBranchId === 'ALL' && branches.length > 0 && (
                  <div
                    style={{
                      marginBottom: '1rem',
                      padding: '0.75rem 1.25rem',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#1e40af',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>
                      📍 Viewing live queue for default branch: <strong style={{ color: '#1e3a8a' }}>{branches[0].name}</strong>.
                      Select a specific branch in the header to switch branches.
                    </span>
                  </div>
                )}
                <OperatorQueueView
                  branchId={selectedBranchId === 'ALL' && branches[0] ? branches[0].id : selectedBranchId}
                  isOwner={true}
                />
              </div>
            )}
            {activeTab === 'orders' && (
              <UnifiedOrderHistoryView
                branches={branches}
                defaultBranchId={selectedBranchId}
                isOwner={true}
              />
            )}
            {activeTab === 'inventory' && (
              <OperatorInventoryView
                branchId={selectedBranchId === 'ALL' && branches[0] ? branches[0].id : selectedBranchId}
                isOwner={true}
              />
            )}
            {activeTab === 'branches' && (
              <BranchManagementView
                branches={branches}
                onBranchesUpdated={fetchBranches}
                onSelectBranchSettings={handleSelectBranchSettings}
              />
            )}
            {activeTab === 'ledger' && (
              <UnifiedLedgerView
                branchId={selectedBranchId === 'ALL' && branches[0] ? branches[0].id : selectedBranchId}
                isOwner={true}
              />
            )}
            {activeTab === 'marketing' && (
              <OwnerMessagingView
                branches={branches}
                selectedBranchId={selectedBranchId}
              />
            )}
            {activeTab === 'settings' && (
              <BranchSettingsView
                branches={branches}
                selectedBranchId={selectedBranchId === 'ALL' && branches[0] ? branches[0].id : selectedBranchId}
                onBranchChange={setSelectedBranchId}
              />
            )}
            {activeTab === 'data' && (
              <DataManagementView
                branches={branches}
                onBranchesUpdated={fetchBranches}
              />
            )}
          </>
        )}
      </main>

      {/* Bun Mobile Navigation */}
      <BunMobileNav
        currentPortal="owner"
        currentTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as OwnerTab)}
        tabItems={tabItems}
        branchName={currentBranchName}
      />
    </div>
  );
}
