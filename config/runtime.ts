import { configSchema, AppConfig } from './env';

export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const isCalledInternally = env === process.env;
  const isProductionLike = env.NODE_ENV === 'production' || env.NODE_ENV === 'staging';

  const isVercel = Boolean(env.VERCEL || process.env.VERCEL);
  const vercelDomain = env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : env.VERCEL_URL
    ? `https://${env.VERCEL_URL}`
    : 'https://melt.vercel.app';

  let rawOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
    : isProductionLike
      ? (isCalledInternally || isVercel ? [vercelDomain] : [])
      : ['http://localhost:3000'];

  if (isCalledInternally && isProductionLike) {
    rawOrigins = rawOrigins.filter((o) => !o.includes('localhost') && !o.includes('127.0.0.1'));
    if (rawOrigins.length === 0) {
      rawOrigins = [vercelDomain];
    }
  }

  let defaultApiBaseUrl = env.API_BASE_URL;
  if (isCalledInternally && isProductionLike) {
    if (!defaultApiBaseUrl || defaultApiBaseUrl.includes('localhost') || defaultApiBaseUrl.includes('127.0.0.1')) {
      defaultApiBaseUrl = vercelDomain;
    }
  } else if (!defaultApiBaseUrl) {
    defaultApiBaseUrl = isProductionLike ? '' : (env.PORT ? `http://localhost:${env.PORT}` : 'http://localhost:3000');
  }

  const rawConfig = {
    environment: env.NODE_ENV ?? 'development',
    port: env.PORT ?? 3000,
    apiBaseUrl: defaultApiBaseUrl,
    allowedOrigins: rawOrigins,
    d1BindingName: env.D1_BINDING_NAME ?? 'DB',
    firebase: {
      projectId: env.FIREBASE_PROJECT_ID ?? env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? (isCalledInternally && isProductionLike ? 'melt-icecream-staging' : undefined),
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      publicApiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY ?? env.FIREBASE_PUBLIC_API_KEY,
      authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? env.FIREBASE_AUTH_DOMAIN,
    },
    featureFlags: {
      enableRealtime: env.ENABLE_REALTIME === 'true',
      enableDummyWhatsApp: env.ENABLE_DUMMY_WHATSAPP !== 'false',
      enableCoupons: env.ENABLE_COUPONS !== 'false',
    },
  };

  return configSchema.parse(rawConfig);
}

export const config: AppConfig = loadConfig();
