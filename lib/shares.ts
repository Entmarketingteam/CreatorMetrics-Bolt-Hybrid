import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SHARES_FILE = path.join(DATA_DIR, "shares.json");

export type ShareLink = {
  id: string;
  creatorId: string;
  createdAt: string;
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadAllShares(): ShareLink[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(SHARES_FILE)) return [];
    const raw = fs.readFileSync(SHARES_FILE, "utf8");
    return JSON.parse(raw) as ShareLink[];
  } catch {
    return [];
  }
}

function saveAllShares(shares: ShareLink[]) {
  ensureDataDir();
  fs.writeFileSync(SHARES_FILE, JSON.stringify(shares, null, 2), "utf8");
}

export function createShare(creatorId: string): ShareLink {
  const shares = loadAllShares();
  const id = `shr_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date().toISOString();
  const share: ShareLink = { id, creatorId, createdAt: now };
  shares.push(share);
  saveAllShares(shares);
  return share;
}

export function getShare(id: string): ShareLink | null {
  const shares = loadAllShares();
  return shares.find((s) => s.id === id) ?? null;
}
