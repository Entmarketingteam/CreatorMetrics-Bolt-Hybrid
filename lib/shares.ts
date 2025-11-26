import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SHARES_FILE = path.join(DATA_DIR, "shares.json");

export type ShareRecord = {
  id: string;
  creatorId: string;
  createdAt: string;
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadShares(): ShareRecord[] {
  ensureDir();
  if (!fs.existsSync(SHARES_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(SHARES_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveShares(records: ShareRecord[]) {
  ensureDir();
  fs.writeFileSync(SHARES_FILE, JSON.stringify(records, null, 2), "utf8");
}

export function createShare(creatorId: string): ShareRecord {
  const list = loadShares();
  const rec: ShareRecord = {
    id: `shr_${Date.now().toString(36)}`,
    creatorId,
    createdAt: new Date().toISOString(),
  };
  list.unshift(rec);
  saveShares(list);
  return rec;
}

export function getShareById(id: string): ShareRecord | undefined {
  return loadShares().find((s) => s.id === id);
}
