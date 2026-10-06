import path from 'node:path';
import fs from 'node:fs';
import { createLibSqlDatabase } from '../database/adapter.libsql';
import { runMigrations, getAppliedMigrations } from '../database/migrations/runner';
import { runDevSeed } from '../database/seeds/dev-seed';

// Simple .env.local / .env loader if run directly via tsx without next env
function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), '.env.local'));
  loadEnvFile(path.resolve(process.cwd(), '.env'));

  const url = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN;

  if (!url) {
    console.error('❌ Error: TURSO_DATABASE_URL is not set.');
    console.error('Please set TURSO_DATABASE_URL (and optional TURSO_AUTH_TOKEN) in .env.local or your environment.');
    console.error('Example:');
    console.error('  TURSO_DATABASE_URL=libsql://melt-db-yourname.turso.io');
    console.error('  TURSO_AUTH_TOKEN=your-turso-token');
    process.exit(1);
  }

  console.log(`🚀 Connecting to Turso database: ${url}`);
  const db = createLibSqlDatabase(url, authToken);
  const migrationsDir = path.resolve(process.cwd(), 'database', 'migrations');

  console.log('📦 Running schema migrations on Turso...');
  const applied = await runMigrations(db, migrationsDir);
  console.log(`✅ Applied ${applied.length} new migration(s).`);

  const currentMigrations = await getAppliedMigrations(db);
  console.log(`📋 Total migrations applied: ${currentMigrations.length}`);

  console.log('🌱 Seeding database on Turso with comprehensive catalog & fixtures...');
  const seedResult = await runDevSeed(db, { comprehensive: true });
  console.log('✅ Seeding completed:');
  console.table(seedResult);

  // Verification query
  const branchCount = await db.prepare('SELECT count(*) as count FROM branches').first<{ count: number }>();
  const productCount = await db.prepare('SELECT count(*) as count FROM products').first<{ count: number }>();
  console.log(`🎉 Database synced successfully! (${branchCount?.count ?? 0} branches, ${productCount?.count ?? 0} products verified)`);
}

main().catch((err) => {
  console.error('❌ Turso sync failed:', err);
  process.exit(1);
});
