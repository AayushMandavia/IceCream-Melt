import { D1DatabaseLike, CloudflareEnv } from './types';
import { createProductionDatabase } from './adapter';

let fallbackProvider: (() => D1DatabaseLike) | null = null;
let cachedLocalDb: D1DatabaseLike | null = null;

/**
 * Registers a fallback database provider for local testing or dev emulation.
 */
export function setFallbackDatabaseProvider(provider: () => D1DatabaseLike): void {
  fallbackProvider = provider;
}

/**
 * Resets the fallback database provider.
 */
export function resetDatabaseProvider(): void {
  fallbackProvider = null;
  cachedLocalDb = null;
}

/**
 * Resolves the active D1Database instance.
 * In Cloudflare production, extracts env.DB from the request/execution context.
 * In Vercel serverless or Node.js environment, connects to a persistent SQLite database (copying seed.db to /tmp if in read-only lambda).
 */
export function getDatabase(context?: { env?: CloudflareEnv } | CloudflareEnv): D1DatabaseLike {
  const directDb = (context as CloudflareEnv)?.DB;
  const nestedDb = (context as { env?: CloudflareEnv })?.env?.DB;
  const rawDb = directDb ?? nestedDb;

  if (rawDb) {
    return createProductionDatabase(rawDb);
  }

  // Global / process binding if injected by Cloudflare Workers runtime
  const globalEnv = (globalThis as unknown as { env?: CloudflareEnv }).env;
  if (globalEnv?.DB) {
    return createProductionDatabase(globalEnv.DB);
  }

  if (fallbackProvider) {
    return fallbackProvider();
  }

  // In Node environment (e.g. Next.js server, Vercel Serverless Function, local dev)
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      if (cachedLocalDb) {
        return cachedLocalDb;
      }

      const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_DATABASE_URL;
      if (tursoUrl) {
        const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN;
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { createLibSqlDatabase } = require('./adapter.libsql');
        const tursoDb = createLibSqlDatabase(tursoUrl, tursoAuthToken);
        cachedLocalDb = tursoDb;
        console.log('[database] Connected to synchronized Turso cloud database:', tursoUrl);
        return tursoDb;
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('node:fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('node:path');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const os = require('node:os');

      const isServerless = Boolean(
        process.env.VERCEL ||
        process.env.AWS_LAMBDA_FUNCTION_NAME ||
        process.env.LAMBDA_TASK_ROOT,
      );

      let targetDbPath: string;

      if (isServerless) {
        // Vercel Serverless Functions have a read-only root (/var/task) and a writable /tmp
        targetDbPath = path.join(os.tmpdir(), 'melt.sqlite');

        if (!fs.existsSync(targetDbPath)) {
          const candidates = [
            path.resolve(process.cwd(), 'database', 'seed.db'),
            path.resolve(__dirname, 'seed.db'),
            path.resolve(process.cwd(), '.data', 'local.sqlite'),
          ];

          let copied = false;
          for (const cand of candidates) {
            if (fs.existsSync(cand)) {
              try {
                fs.copyFileSync(cand, targetDbPath);
                try {
                  fs.chmodSync(targetDbPath, 0o666);
                } catch {}
                copied = true;
                break;
              } catch (copyErr) {
                console.warn('[database] Failed copying seed DB from', cand, copyErr);
              }
            }
          }

          if (!copied) {
            console.log('[database] Fresh database will be created in /tmp:', targetDbPath);
          }
        }
      } else {
        const defaultDbPath = path.resolve(process.cwd(), '.data', 'local.sqlite');
        targetDbPath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : defaultDbPath;

        if (!fs.existsSync(targetDbPath)) {
          const seedDbPath = path.resolve(process.cwd(), 'database', 'seed.db');
          if (fs.existsSync(seedDbPath)) {
            const dir = path.dirname(targetDbPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.copyFileSync(seedDbPath, targetDbPath);
          }
        }
      }

      if (fs.existsSync(targetDbPath)) {
        try {
          fs.chmodSync(targetDbPath, 0o666);
        } catch {}
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createFileD1Database } = require('./adapter.sqlite');
      const localDb: D1DatabaseLike = createFileD1Database(targetDbPath);
      cachedLocalDb = localDb;
      return localDb;
    } catch (err) {
      console.error('[database] Failed initializing Node SQLite adapter:', err);
    }
  }

  throw new Error(
    'No D1 database binding found. In Cloudflare Workers, pass { env: { DB: ... } }. In local/test mode, register a provider via setFallbackDatabaseProvider().',
  );
}
