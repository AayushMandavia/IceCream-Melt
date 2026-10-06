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
import { BunMobileNav } from '@/frontend/components/ui';

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

  const currentBranchName =
    selectedBranchId === 'ALL'
      ? 'All Branches'
      : (branches.find((b) => b.id === selectedBranchId)?.name ?? 'Branch');

  // Exact tabs matching img 2
  const tabItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'queue', label: 'Order Queue', icon: '👜' },
    { id: 'orders', label: 'History', icon: '📜' },
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
      {/* Row 1: Floating Pill Header Bar (matching img 2) */}
      <header style={{ maxWidth: '1160px', margin: '0 auto', padding: '0.65rem 1rem 0 1rem' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '9999px',
            boxShadow: '0 4px 20px rgba(220, 50, 90, 0.07)',
            border: '1px solid #fbdce3',
            padding: '0.45rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          {/* Left: Soft-serve cone + MELT + OWNER PORTAL + Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                textDecoration: 'none',
                color: '#2b1233',
              }}
            >
              <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>🍦</span>
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-display-family)',
                    fontWeight: 900,
                    fontSize: '1.2rem',
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
                    fontSize: '0.53125rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: '#75506b',
                    display: 'block',
                    marginTop: '0.08rem',
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
                gap: '0.35rem',
                background: '#fff2f5',
                border: '1px solid #f8d2dc',
                borderRadius: '9999px',
                padding: '0.3rem 0.85rem',
                fontSize: '0.71875rem',
                fontWeight: 700,
                color: '#441a37',
                cursor: 'pointer',
              }}
            >
              <span>Enterprise Analytics & Controls</span>
              <span style={{ fontSize: '0.6rem' }}>▼</span>
            </div>
          </div>

          {/* Right: Menu, Operator, Owner, Staff Desk (matching img 2) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Link
              href="/order"
              className="hidden md:inline-flex"
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '9999px',
                border: '1px solid #f8d2dc',
                background: '#ffffff',
                color: '#b91c1c',
                textDecoration: 'none',
                fontSize: '0.71875rem',
                fontWeight: 700,
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🍴</span>
              <span>Menu</span>
            </Link>

            <Link
              href="/operator"
              className="hidden md:inline-flex"
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '9999px',
                border: '1px solid #f8d2dc',
                background: '#ffffff',
                color: '#4a253f',
                textDecoration: 'none',
                fontSize: '0.71875rem',
                fontWeight: 700,
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>📋</span>
              <span>Operator</span>
            </Link>

            <div
              style={{
                padding: '0.3rem 0.95rem',
                borderRadius: '9999px',
                background: '#d61c5d',
                color: '#ffffff',
                fontSize: '0.71875rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                boxShadow: '0 2px 8px rgba(214, 28, 93, 0.25)',
              }}
            >
              <span>👑</span>
              <span>Owner</span>
            </div>

            <Link
              href="/operator"
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '9999px',
                border: '1px solid #f8d2dc',
                background: '#ffffff',
                color: '#4a253f',
                textDecoration: 'none',
                fontSize: '0.71875rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>👥</span>
              <span>Staff Desk</span>
              <span style={{ fontSize: '0.6rem' }}>▼</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Row 2: Floating Pill Sub-Nav Tab Bar (matching img 2) */}
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0.4rem 1rem 0 1rem' }}>
        <nav
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '9999px',
            boxShadow: '0 4px 20px rgba(220, 50, 90, 0.07)',
            border: '1px solid #fbdce3',
            padding: '0.35rem 0.65rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
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
                  padding: '0.35rem 0.85rem',
                  background: isActive ? '#d61c5d' : 'transparent',
                  border: 'none',
                  borderRadius: '9999px',
                  color: isActive ? '#ffffff' : '#4a253f',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  boxShadow: isActive ? '0 2px 8px rgba(214, 28, 93, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '0.85rem' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '0.4rem 1rem 2rem 1rem' }}>
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
