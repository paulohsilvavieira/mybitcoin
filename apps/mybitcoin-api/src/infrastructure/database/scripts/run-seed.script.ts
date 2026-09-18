import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  quiet: true,
});

const SEEDS_DIR = path.resolve(__dirname, '../seeds');
const DRY_RUN = process.env.DRY_RUN === 'true';

function createClient(): Client {
  return new Client({
    host: process.env.DB_WRITE_HOST ?? process.env.DB_HOST,
    port: Number(process.env.DB_WRITE_PORT ?? process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
}

function getSeedFiles(): string[] {
  if (!fs.existsSync(SEEDS_DIR)) return [];

  return fs
    .readdirSync(SEEDS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

async function getAppliedSeeds(client: Client): Promise<Set<string>> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_seeds (
      version     TEXT        PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const { rows } = await client.query<{ version: string }>(
    'SELECT version FROM schema_seeds',
  );
  return new Set(rows.map((r) => r.version));
}

async function applySeed(client: Client, filename: string): Promise<void> {
  const filepath = path.join(SEEDS_DIR, filename);
  const sql = fs.readFileSync(filepath, 'utf-8');

  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('INSERT INTO schema_seeds (version) VALUES ($1)', [
      filename,
    ]);
    await client.query('COMMIT');
    console.log(`  applied: ${filename}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

async function main() {
  const client = createClient();
  await client.connect();

  try {
    const files = getSeedFiles();
    const applied = await getAppliedSeeds(client);
    const pending = files.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log('No pending seeds.');
      return;
    }

    console.log(`Pending seeds (${pending.length}):`);
    pending.forEach((f) => console.log(`  - ${f}`));

    if (DRY_RUN) {
      console.log('\nDry run — no changes applied.');
      return;
    }

    console.log('\nApplying...');
    for (const file of pending) {
      await applySeed(client, file);
    }
    console.log('\nAll seeds applied successfully.');
  } catch (err) {
    console.error('\nSeed failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

void main();
