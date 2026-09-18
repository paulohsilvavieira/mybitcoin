import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const SEEDS_DIR = path.resolve(__dirname, '', '../seeds');

function main() {
  const name = process.argv[2];

  if (!name) {
    console.error('Usage: pnpm seed:create <seed_name>');
    process.exit(1);
  }

  if (!/^[a-z0-9_]+$/.test(name)) {
    console.error(
      'Seed name must contain only lowercase letters, numbers, and underscores.',
    );
    process.exit(1);
  }

  const filename = `${Date.now()}_${name}.sql`;
  const filepath = path.join(SEEDS_DIR, filename);

  const content = `-- Seed: ${filename}\n-- Created at: ${new Date().toISOString()}\n\n`;

  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`Created: seeds/${filename}`);
}

main();
