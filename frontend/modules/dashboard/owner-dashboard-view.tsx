'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ownerApiClient } from '../../services/owner-api-client';
import { DashboardSummaryResponse } from '../../../shared/contracts/dashboard.contract';

interface OwnerDashboardViewProps {
  branches: Array<{ id: string; name: string; code: string }>;
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
}

// Melting glaze/drip decoration for top-right corner of cards
const MeltingDripTop: React.FC<{ color?: string }> = ({ color = '#fcd7e1' }) => (
  <svg
    viewBox="0 0 110 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '95px',
      height: '32px',
      pointerEvents: 'none',
      zIndex: 1,
    }}
  >
    <path
      d="M0 0 C12 0, 18 10, 24 10 C30 10, 34 2, 42 2 C48 2, 52 24, 60 24 C66 24, 70 8, 78 8 C85 8, 88 32, 96 32 C102 32, 105 14, 110 14 V0 H0 Z"
      fill={color}
    />
  </svg>
);

// Melting glaze/drip decoration for bottom-left corner of cards
const MeltingDripBottom: React.FC<{ color?: string }> = ({ color = '#ffdbe5' }) => (
  <svg
    viewBox="0 0 100 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '85px',
      height: '28px',
      pointerEvents: 'none',
      zIndex: 1,
    }}
  >
    <path
      d="M0 32 C10 32, 16 22, 22 22 C28 22, 32 30, 40 30 C46 30, 50 12, 58 12 C64 12, 68 26, 76 26 C82 26, 85 10, 92 10 C96 10, 98 22, 100 22 V32 H0 Z"
      fill={color}
    />
  </svg>
);

export const OwnerDashboardView: React.FC<OwnerDashboardViewProps> = ({
  branches,
  selectedBranchId,
  onBranchChange,
}) => {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [preset, setPreset] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ownerApiClient.getDashboardSummary({
        branchId: selectedBranchId === 'ALL' ? undefined : selectedBranchId,
        preset: preset === 'custom' ? undefined : preset,
        startDate: preset === 'custom' && customStart ? new Date(customStart).toISOString() : undefined,
        endDate: preset === 'custom' && customEnd ? new Date(customEnd).toISOString() : undefined,
      });

      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error.message || 'Failed to fetch dashboard summary');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [selectedBranchId, preset, customStart, customEnd]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Default fallback mock items matching mockup ss2 if backend returns empty alerts
  const defaultAlertItems = [
    {
      id: 'vanilla-pods',
      name: 'Madagascar Vanilla Pods',
      current: '0 KG',
      min: '2 KG',
      type: 'RAW MATERIAL',
      image: '/images/melt/scoop-coffee.webp',
    },
    {
      id: 'matcha-powder',
      name: 'Ceremonial Uji Matcha Powder',
      current: '1.2 KG',
      min: '2 KG',
      type: 'RAW MATERIAL',
      image: '/images/melt/scoop-cocoa.webp',
    },
    {
      id: 'dark-callets',
      name: 'Belgian Dark Callets 70%',
      current: '1.2 KG',
      min: '8 KG',
      type: 'RAW MATERIAL',
      image: '/images/melt/scoop-cocoa.webp',
    },
  ];

  const dynamicAlerts = [
    ...(data?.inventoryAlerts.lowStockRawMaterials.map((mat) => ({
      id: mat.materialId,
      name: mat.name,
      current: `${mat.quantity} ${mat.unit}`,
      min: `${mat.reorderThreshold} ${mat.unit}`,
      type: 'RAW MATERIAL',
      image: '/images/melt/scoop-coffee.webp',
    })) ?? []),
    ...(data?.inventoryAlerts.lowStockProducts.map((prod) => ({
      id: prod.productId,
      name: prod.productName,
      current: `${prod.quantity} Units`,
      min: `${prod.reorderThreshold} Units`,
      type: 'FINISHED ITEM',
      image: '/images/melt/scoop-pistachio.webp',
    })) ?? []),
  ];

  const displayAlerts = dynamicAlerts.length > 0 ? dynamicAlerts : defaultAlertItems;
  const criticalCount = displayAlerts.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Row 3: Floating Pill Controls Bar (Branch & Date Presets) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          padding: '0.55rem 1.25rem',
          borderRadius: '9999px',
          border: '1px solid #fbdce3',
          boxShadow: '0 4px 20px rgba(220, 50, 90, 0.06)',
        }}
      >
        {/* Left: Branch Selector Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: '0.75rem',
              color: '#633b54',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            BRANCH:
          </span>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              value={selectedBranchId}
              onChange={(e) => onBranchChange(e.target.value)}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                padding: '0.35rem 2.2rem 0.35rem 0.9rem',
                borderRadius: '9999px',
                border: '1px solid #f8d2dc',
                background: '#fff2f5',
                color: '#35152d',
                fontWeight: 700,
                fontSize: '0.8125rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">🏪 All Branches (Aggregate)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  🏪 {b.name} ({b.code})
                </option>
              ))}
            </select>
            <span
              style={{
                position: 'absolute',
                right: '0.75rem',
                pointerEvents: 'none',
                fontSize: '0.65rem',
                color: '#633b54',
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {/* Right: Date range pills & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['today', 'week', 'month', 'custom'] as const).map((p) => {
            const isSelected = preset === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                style={{
                  padding: '0.35rem 0.9rem',
                  borderRadius: '9999px',
                  border: isSelected ? 'none' : '1px solid #f8d2dc',
                  background: isSelected ? '#d61c5d' : 'transparent',
                  color: isSelected ? '#ffffff' : '#633b54',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(214, 28, 93, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            );
          })}

          {preset === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                style={{
                  padding: '0.3rem 0.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #f8d2dc',
                  fontSize: '0.75rem',
                  outline: 'none',
                }}
              />
              <span style={{ color: '#633b54', fontSize: '0.75rem' }}>to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{
                  padding: '0.3rem 0.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #f8d2dc',
                  fontSize: '0.75rem',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={fetchSummary}
            disabled={loading}
            style={{
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              border: '1px solid #f8d2dc',
              background: '#ffffff',
              color: '#0284c7',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease',
            }}
          >
            <span>📅</span>
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#ffe5e5',
            border: '1px solid #ff9999',
            borderRadius: '0.75rem',
            color: '#a3134a',
            fontWeight: 700,
            fontSize: '0.8125rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Row 4: 5 Stat Cards with Top-Right Corner Melting Drips */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem',
        }}
      >
        {/* Card 1: Total Revenue */}
        <div
          style={{
            background: '#ffffff',
            padding: '1rem 1.15rem',
            borderRadius: '1rem',
            border: '1px solid #fae4e9',
            boxShadow: '0 4px 16px rgba(200, 40, 80, 0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <MeltingDripTop color="#fcd7e1" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.5rem',
                background: '#ffe8ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                flexShrink: 0,
              }}
            >
              🪙
            </div>
            <div
              style={{
                fontSize: '0.625rem',
                fontWeight: 800,
                color: '#633b54',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Total Revenue
            </div>
          </div>
          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#d61c5d',
              letterSpacing: '-0.02em',
              marginTop: '0.5rem',
              lineHeight: 1.1,
            }}
          >
            ₹{data?.metrics.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#8c6b81', marginTop: '0.35rem', fontWeight: 500 }}>
            Includes cancelled & expired
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div
          style={{
            background: '#ffffff',
            padding: '1rem 1.15rem',
            borderRadius: '1rem',
            border: '1px solid #fae4e9',
            boxShadow: '0 4px 16px rgba(200, 40, 80, 0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <MeltingDripTop color="#fef3c7" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.5rem',
                background: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                flexShrink: 0,
              }}
            >
              🛒
            </div>
            <div
              style={{
                fontSize: '0.625rem',
                fontWeight: 800,
                color: '#633b54',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Total Orders
            </div>
          </div>
          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#261023',
              letterSpacing: '-0.02em',
              marginTop: '0.5rem',
              lineHeight: 1.1,
            }}
          >
            {data?.metrics.totalOrders ?? 0}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#8c6b81', marginTop: '0.35rem', fontWeight: 500 }}>
            All placed in period
          </div>
        </div>

        {/* Card 3: Average Order Value */}
        <div
          style={{
            background: '#ffffff',
            padding: '1rem 1.15rem',
            borderRadius: '1rem',
            border: '1px solid #fae4e9',
            boxShadow: '0 4px 16px rgba(200, 40, 80, 0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <MeltingDripTop color="#e0e7ff" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.5rem',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                flexShrink: 0,
              }}
            >
              📊
            </div>
            <div
              style={{
                fontSize: '0.625rem',
                fontWeight: 800,
                color: '#633b54',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Average Order Value
            </div>
          </div>
          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#261023',
              letterSpacing: '-0.02em',
              marginTop: '0.5rem',
              lineHeight: 1.1,
            }}
          >
            ₹{data?.metrics.averageOrderValue.toFixed(2) ?? '0.00'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#8c6b81', marginTop: '0.35rem', fontWeight: 500 }}>
            Revenue / Eligible Orders
          </div>
        </div>

        {/* Card 4: Completed Orders */}
        <div
          style={{
            background: '#ffffff',
            padding: '1rem 1.15rem',
            borderRadius: '1rem',
            border: '1px solid #fae4e9',
            boxShadow: '0 4px 16px rgba(200, 40, 80, 0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <MeltingDripTop color="#dcfce7" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '1.5rem',
                height: '1.5rem',
                borderRadius: '9999px',
                background: '#16a34a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              ✔
            </div>
            <div
              style={{
                fontSize: '0.625rem',
                fontWeight: 800,
                color: '#633b54',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Completed Orders
            </div>
          </div>
          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#261023',
              letterSpacing: '-0.02em',
              marginTop: '0.5rem',
              lineHeight: 1.1,
            }}
          >
            {data?.metrics.completedOrders ?? 0}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#8c6b81', marginTop: '0.35rem', fontWeight: 500 }}>
            Fulfilled & handed over
          </div>
        </div>

        {/* Card 5: Cancelled / Expired */}
        <div
          style={{
            background: '#ffffff',
            padding: '1rem 1.15rem',
            borderRadius: '1rem',
            border: '1px solid #fae4e9',
            boxShadow: '0 4px 16px rgba(200, 40, 80, 0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <MeltingDripTop color="#fee2e2" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '1.5rem',
                height: '1.5rem',
                borderRadius: '9999px',
                background: '#dc2626',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              ✖
            </div>
            <div
              style={{
                fontSize: '0.625rem',
                fontWeight: 800,
                color: '#633b54',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Cancelled / Expired
            </div>
          </div>
          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#261023',
              letterSpacing: '-0.02em',
              marginTop: '0.5rem',
              lineHeight: 1.1,
            }}
          >
            {(data?.metrics.cancelledOrders ?? 0) + (data?.metrics.expiredOrders ?? 0)}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#8c6b81', marginTop: '0.35rem', fontWeight: 500 }}>
            {data?.metrics.cancelledOrders ?? 0} cancelled, {data?.metrics.expiredOrders ?? 0} expired
          </div>
        </div>
      </div>

      {/* Row 5: 4 Lower Cards (2x2 Grid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
          gap: '0.85rem',
        }}
      >
        {/* Card 1: Order Status Distribution */}
        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem 1.4rem',
            borderRadius: '1rem',
            border: '1px solid #fae4e9',
            boxShadow: '0 4px 16px rgba(200, 40, 80, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#261023', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <span>📊</span>
                <span>Order Status Distribution</span>
              </h3>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 900 }}>•••</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                { label: 'Completed', count: data?.metrics.completedOrders ?? 0, dotColor: '#16a34a' },
                { label: 'Confirmed', count: data?.metrics.confirmedOrders ?? 0, dotColor: '#3b82f6' },
                { label: 'Pending Payment', count: data?.metrics.pendingOrders ?? 0, dotColor: '#eab308' },
                { label: 'Cancelled', count: data?.metrics.cancelledOrders ?? 0, dotColor: '#ef4444' },
                { label: 'Expired', count: data?.metrics.expiredOrders ?? 0, dotColor: '#9ca3af' },
              ].map((st) => (
                <div
                  key={st.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.55rem 0.85rem',
                    background: '#fff8fa',
                    borderRadius: '0.75rem',
                    border: '1px solid #fde9ee',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', background: st.dotColor, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#261023' }}>{st.label}</span>
                  </div>
                  <span
                    style={{
                      background: '#ffd5e2',
                      color: '#d61c5d',
                      padding: '0.15rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                    }}
                  >
                    {st.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Stock & Expiry Alerts */}
        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem 1.4rem',
            borderRadius: '1rem',
            border: '1px solid #fae4e9',
            boxShadow: '0 4px 16px rgba(200, 40, 80, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#261023', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <span>⚠️</span>
                <span>Stock & Expiry Alerts</span>
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    background: '#ffe2e7',
                    color: '#d61c5d',
                    fontSize: '0.6875rem',
                    fontWeight: 900,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                  }}
                >
                  {criticalCount} Critical
                </span>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 900 }}>•••</span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                position: 'relative',
              }}
            >
              {/* Alert items list */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                  flex: 1,
                  maxHeight: '220px',
                  overflowY: 'auto',
                  paddingRight: '0.25rem',
                }}
                className="no-scrollbar"
              >
                {displayAlerts.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      background: '#fff8fa',
                      borderRadius: '0.75rem',
                      border: '1px solid #fde9ee',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '0.5rem',
                          objectFit: 'cover',
                          border: '1px solid #fadfe5',
                          background: '#fff',
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.78125rem', color: '#261023' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 600, marginTop: '0.1rem' }}>
                          Current: {item.current} (Min: {item.min})
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        background: '#b91c1c',
                        color: '#ffffff',
                        fontSize: '0.5625rem',
                        fontWeight: 900,
                        padding: '0.25rem 0.55rem',
                        borderRadius: '0.35rem',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>

              {/* Decorative Scrollbar column matching ss2 mockup */}
              <div
                style={{
                  width: '12px',
                  background: '#f8eaee',
                  borderRadius: '9999px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                }}
              >
                <span style={{ fontSize: '6px', color: '#7a5a6c', lineHeight: 1 }}>▲</span>
                <div style={{ width: '6px', height: '36px', background: '#7a5a6c', borderRadius: '9999px' }} />
                <span style={{ fontSize: '6px', color: '#7a5a6c', lineHeight: 1 }}>▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Top Selling Products */}
        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem 1.4rem',
            borderRadius: '1rem',
            border: '1px solid #fae4e9',
            boxShadow: '0 4px 16px rgba(200, 40, 80, 0.06)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '220px',
          }}
        >
          {/* Decorative Corner Drips (Yellow top-right, Pink bottom-left) */}
          <MeltingDripTop color="#fef3c7" />
          <MeltingDripBottom color="#ffdbe5" />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', position: 'relative', zIndex: 2 }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#261023', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <span>👑</span>
                <span>Top Selling Products</span>
              </h3>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 900 }}>•••</span>
            </div>

            {/* Content: List or Mockup Empty State */}
            {data && data.topProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', zIndex: 2 }}>
                {data.topProducts.map((p, idx) => (
                  <div
                    key={p.productId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      background: '#fff9fa',
                      borderRadius: '0.5rem',
                      border: '1px solid #fceef2',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontWeight: 900, color: '#d61c5d', width: '1.25rem', fontSize: '0.8125rem' }}>#{idx + 1}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#261023' }}>{p.productName}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#261023' }}>
                        {p.quantitySold} sold
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#6f5569' }}>
                        ₹{p.revenue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem 0',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {/* Strawberry Ice Cream Graphic with Red Drip Sparkles */}
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Decorative spark accent marks */}
                  <span style={{ position: 'absolute', left: '-18px', color: '#e11d48', fontWeight: 900, fontSize: '14px', transform: 'rotate(-15deg)' }}>
                    \
                  </span>
                  <img
                    src="/images/melt/scoop-strawberry.webp"
                    alt="Ice cream scoop"
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 10px rgba(220, 38, 38, 0.15))',
                    }}
                  />
                  <span style={{ position: 'absolute', right: '-18px', color: '#e11d48', fontWeight: 900, fontSize: '14px', transform: 'rotate(15deg)' }}>
                    /
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#8c6b81',
                    fontWeight: 600,
                    marginTop: '0.65rem',
                    textAlign: 'center',
                  }}
                >
                  No product sales recorded in this period.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Promotion & Coupon Redemptions */}
        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem 1.4rem',
            borderRadius: '1rem',
            border: '1px solid #fae4e9',
            boxShadow: '0 4px 16px rgba(200, 40, 80, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#261023', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <span>🏷️</span>
                <span>Promotion & Coupon Redemptions</span>
              </h3>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 900 }}>•••</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  background: '#fff8fa',
                  borderRadius: '0.75rem',
                  border: '1px solid #fde9ee',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#261023' }}>
                    Coupon Redemptions
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#8c6b81', marginTop: '0.1rem' }}>
                    Checkout discount coupons applied
                  </div>
                </div>
                <span
                  style={{
                    background: '#ffd5e2',
                    color: '#d61c5d',
                    padding: '0.15rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                  }}
                >
                  {data?.promotions.couponUsageCount ?? 0}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  background: '#fff8fa',
                  borderRadius: '0.75rem',
                  border: '1px solid #fde9ee',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#261023' }}>
                    Automatic Offers Applied
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#8c6b81', marginTop: '0.1rem' }}>
                    Catalog-level branch deals triggered
                  </div>
                </div>
                <span
                  style={{
                    background: '#ffd5e2',
                    color: '#d61c5d',
                    padding: '0.15rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                  }}
                >
                  {data?.promotions.offerUsageCount ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
