import fs from 'fs';
import path from 'path';
import type { ChegolandDatabase } from '../src/types/index.ts';
import { createSeedDatabase } from './seed.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'chegoland-db.json');

let cachedDb: ChegolandDatabase | null = null;

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadDatabase(): ChegolandDatabase {
  if (cachedDb) {
    return cachedDb;
  }

  ensureDataDir();

  if (!fs.existsSync(DB_FILE)) {
    const seed = createSeedDatabase();
    saveDatabase(seed);
    return seed;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<ChegolandDatabase>;
    const seed = createSeedDatabase();
    const db: ChegolandDatabase = {
      products: Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : seed.products,
      cows: Array.isArray(parsed.cows) && parsed.cows.length > 0 ? parsed.cows : seed.cows,
      milkRecords: Array.isArray(parsed.milkRecords) ? parsed.milkRecords : seed.milkRecords,
      orders: Array.isArray(parsed.orders) ? parsed.orders : seed.orders,
      messages: Array.isArray(parsed.messages) ? parsed.messages : seed.messages,
    };
    cachedDb = db;
    return db;
  } catch {
    const seed = createSeedDatabase();
    saveDatabase(seed);
    return seed;
  }
}

export function saveDatabase(db: ChegolandDatabase): void {
  ensureDataDir();
  cachedDb = db;
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}
