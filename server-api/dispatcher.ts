import { CloudflareEnv } from '@/database/types';
import {
  handleAuthLogin,
  handleSetPin,
  handleRevokeAllSessions,
  handleRevokeSession,
  handleVerifyPin,
} from '@/api/routes/auth.route';
import { handleListBranchesRoute } from '@/api/routes/branches.route';
import { handleBranchCatalogRoute } from '@/api/routes/catalog.route';
import {
  handleAdjustInventoryRoute,
  handleProductBOMRoute,
  handleGetMovementsRoute,
  handleUpdateInventoryPricingRoute,
  handleCreateRawMaterialRoute,
  handleRefillInventoryRoute,
  handleGetInventoryRoute,
} from '@/api/routes/inventory.route';
import {
  handleBranchOrdersRoute,
  handleCancelBranchOrderRoute,
  handleBranchOrderConfirmRoute,
  handleRecordPaymentRoute,
  handleVerifyPaymentRoute,
  handleBranchOrderDetailRoute,
  handleBranchOrderStatusRoute,
  handleBranchOrderEditRoute,
} from '@/api/routes/branch-orders.route';
import {
  handleBranchCouponsRoute,
  handleValidateCouponRoute,
  handleSingleCouponRoute,
  handleBranchOffersRoute,
  handleSingleOfferRoute,
} from '@/api/routes/promotions.route';
import { handleOrderExpiryRoute } from '@/api/routes/cron.route';
import { handleCustomerCouponsRoute } from '@/api/routes/customer-coupons.route';
import {
  handleCustomerOrdersRoute,
  handleCreateOrderRoute,
  handleCustomerCancelOrderRoute,
  handleCustomerOrderDetailRoute,
} from '@/api/routes/customer-orders.route';
import { handleHealthRoute } from '@/api/routes/health.route';
import { handleOrderHistoryRoute } from '@/api/routes/order-history.route';
import {
  handleListOwnerBranchesRoute,
  handleCreateBranchRoute,
  handleGetBranchDetailRoute,
  handleUpdateBranchRoute,
  handleGetBranchSettingsRoute,
  handleUpdateBranchSettingsRoute,
  handleUpdateBranchStatusRoute,
} from '@/api/routes/owner-branches.route';
import { handleDashboardSummaryRoute } from '@/api/routes/dashboard.route';
import {
  handleAnonymizeCustomerRoute,
  handleDeactivateBranchRoute,
  handlePreviewBranchDeletionRoute,
  handleGetTablesDataRoute,
  handleDeleteTablesDataRoute,
} from '@/api/routes/data-management.route';
import {
  handleOwnerMarketingBroadcastRoute,
  handleOwnerMarketingCustomersRoute,
} from '@/api/routes/marketing.route';
import { handleOwnerReportsRoute } from '@/api/routes/reports.route';
import {
  handleRealtimeEventsRoute,
  handleRealtimeTicketRoute,
} from '@/api/routes/realtime.route';

export async function dispatchApiRequest(request: Request, env?: CloudflareEnv): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();

  const activeEnv = env ?? (globalThis as unknown as { env?: CloudflareEnv }).env;

  // 1. Health
  if (pathname === '/api/v1/health') {
    return handleHealthRoute(request, activeEnv);
  }

  // 2. Auth Routes
  if (pathname === '/api/v1/auth/login') return handleAuthLogin(request, activeEnv);
  if (pathname === '/api/v1/auth/verify-pin') return handleVerifyPin(request, activeEnv);
  if (pathname === '/api/v1/auth/pin') return handleSetPin(request, activeEnv);
  if (pathname === '/api/v1/auth/revoke-session') return handleRevokeSession(request, activeEnv);
  if (pathname === '/api/v1/auth/revoke-all-sessions') return handleRevokeAllSessions(request, activeEnv);

  // 3. Branches list
  if (pathname === '/api/v1/branches') {
    return handleListBranchesRoute(request, activeEnv);
  }

  // 4. Branch sub-routes: /api/v1/branches/:id/...
  if (pathname.startsWith('/api/v1/branches/')) {
    const parts = pathname.slice('/api/v1/branches/'.length).split('/');
    const branchId = decodeURIComponent(parts[0]);
    const subPath = parts.slice(1).join('/');

    // Catalog
    if (subPath === 'catalog') {
      return handleBranchCatalogRoute(request, branchId, activeEnv);
    }

    // Inventory
    if (subPath === 'inventory') {
      if (method === 'PUT' || method === 'POST') {
        return handleUpdateInventoryPricingRoute(request, branchId, activeEnv);
      }
      return handleGetInventoryRoute(request, branchId, activeEnv);
    }
    if (subPath === 'inventory/adjust') return handleAdjustInventoryRoute(request, branchId, activeEnv);
    if (subPath === 'inventory/refill') return handleRefillInventoryRoute(request, branchId, activeEnv);
    if (subPath === 'inventory/pricing') return handleUpdateInventoryPricingRoute(request, branchId, activeEnv);
    if (subPath === 'inventory/raw-materials') return handleCreateRawMaterialRoute(request, branchId, activeEnv);
    if (subPath === 'inventory/movements') return handleGetMovementsRoute(request, branchId, activeEnv);
    if (subPath.startsWith('inventory/bom/')) {
      const productId = decodeURIComponent(parts.slice(3).join('/'));
      return handleProductBOMRoute(request, branchId, productId, activeEnv);
    }

    // Orders
    if (subPath === 'orders') {
      return handleBranchOrdersRoute(request, branchId, activeEnv);
    }
    if (subPath.startsWith('orders/')) {
      const orderParts = parts.slice(2);
      const orderId = decodeURIComponent(orderParts[0]);
      const orderSub = orderParts.slice(1).join('/');

      if (!orderSub) {
        if (method === 'PATCH') {
          return handleBranchOrderEditRoute(request, branchId, orderId, activeEnv);
        }
        return handleBranchOrderDetailRoute(request, branchId, orderId, activeEnv);
      }
      if (orderSub === 'cancel') {
        return handleCancelBranchOrderRoute(request, branchId, orderId, activeEnv);
      }
      if (orderSub === 'confirm') {
        return handleBranchOrderConfirmRoute(request, branchId, orderId, activeEnv);
      }
      if (orderSub === 'status') {
        return handleBranchOrderStatusRoute(request, branchId, orderId, activeEnv);
      }
      if (orderSub === 'payments') {
        return handleRecordPaymentRoute(request, branchId, orderId, activeEnv);
      }
      if (orderSub.startsWith('payments/') && orderSub.endsWith('/verify')) {
        const paymentId = decodeURIComponent(orderParts[2]);
        return handleVerifyPaymentRoute(request, branchId, orderId, paymentId, activeEnv);
      }
    }

    // Promotions
    if (subPath === 'promotions/coupons/validate') {
      return handleValidateCouponRoute(request, branchId, activeEnv);
    }
    if (subPath === 'promotions/coupons') {
      return handleBranchCouponsRoute(request, branchId, activeEnv);
    }
    if (subPath.startsWith('promotions/coupons/')) {
      const couponId = decodeURIComponent(parts.slice(3).join('/'));
      return handleSingleCouponRoute(request, branchId, couponId, activeEnv);
    }
    if (subPath === 'promotions/offers') {
      return handleBranchOffersRoute(request, branchId, activeEnv);
    }
    if (subPath.startsWith('promotions/offers/')) {
      const offerId = decodeURIComponent(parts.slice(3).join('/'));
      return handleSingleOfferRoute(request, branchId, offerId, activeEnv);
    }
  }

  // 5. Customer Routes: /api/v1/customer/...
  if (pathname.startsWith('/api/v1/customer/')) {
    const sub = pathname.slice('/api/v1/customer/'.length);
    if (sub === 'coupons') return handleCustomerCouponsRoute(request, activeEnv);
    if (sub === 'orders') {
      if (method === 'POST') return handleCreateOrderRoute(request, activeEnv);
      return handleCustomerOrdersRoute(request, activeEnv);
    }
    if (sub.startsWith('orders/')) {
      const orderParts = sub.slice('orders/'.length).split('/');
      const orderId = decodeURIComponent(orderParts[0]);
      if (orderParts[1] === 'cancel') {
        return handleCustomerCancelOrderRoute(request, orderId, activeEnv);
      }
      return handleCustomerOrderDetailRoute(request, orderId, activeEnv);
    }
  }

  // 6. Orders history: /api/v1/orders/history
  if (pathname === '/api/v1/orders/history') {
    return handleOrderHistoryRoute(request, activeEnv);
  }

  // 7. Owner Routes: /api/v1/owner/...
  if (pathname.startsWith('/api/v1/owner/')) {
    const sub = pathname.slice('/api/v1/owner/'.length);
    if (sub === 'dashboard/summary') return handleDashboardSummaryRoute(request, activeEnv);
    if (sub === 'branches') {
      if (method === 'POST') return handleCreateBranchRoute(request, activeEnv);
      return handleListOwnerBranchesRoute(request, activeEnv);
    }
    if (sub.startsWith('branches/')) {
      const branchParts = sub.slice('branches/'.length).split('/');
      const id = decodeURIComponent(branchParts[0]);
      const branchSub = branchParts.slice(1).join('/');
      if (branchSub === 'settings') {
        if (method === 'PUT' || method === 'PATCH') return handleUpdateBranchSettingsRoute(request, id, activeEnv);
        return handleGetBranchSettingsRoute(request, id, activeEnv);
      }
      if (branchSub === 'status') {
        return handleUpdateBranchStatusRoute(request, id, activeEnv);
      }
      if (!branchSub) {
        if (method === 'PUT' || method === 'PATCH') return handleUpdateBranchRoute(request, id, activeEnv);
        return handleGetBranchDetailRoute(request, id, activeEnv);
      }
    }
    if (sub === 'data/anonymize-customer') return handleAnonymizeCustomerRoute(request, activeEnv);
    if (sub === 'data/deactivate-branch') return handleDeactivateBranchRoute(request, activeEnv);
    if (sub === 'data/preview-branch-deletion') return handlePreviewBranchDeletionRoute(request, activeEnv);
    if (sub === 'data/tables') {
      if (method === 'DELETE') return handleDeleteTablesDataRoute(request, activeEnv);
      return handleGetTablesDataRoute(request, activeEnv);
    }
    if (sub === 'marketing/broadcast') return handleOwnerMarketingBroadcastRoute(request, activeEnv);
    if (sub === 'marketing/customers') return handleOwnerMarketingCustomersRoute(request, activeEnv);
    if (sub === 'reports') return handleOwnerReportsRoute(request, activeEnv);
  }

  // 8. Cron Routes
  if (pathname === '/api/v1/cron/orders/expire' || pathname === '/api/v1/cron/expire-orders') {
    return handleOrderExpiryRoute(activeEnv, request);
  }

  // 9. Realtime Routes
  if (pathname === '/api/v1/realtime/ticket') return handleRealtimeTicketRoute(request, activeEnv);
  if (pathname === '/api/v1/realtime/events') return handleRealtimeEventsRoute(request, activeEnv);

  return new Response(JSON.stringify({ error: { message: `Not Found: ${pathname}` } }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}
