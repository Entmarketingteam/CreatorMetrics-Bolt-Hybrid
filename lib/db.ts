import fs from "fs";
import path from "path";
import type { CreatorFunnel } from "./demoData";

const DATA_DIR = path.join(process.cwd(), "data");
const FUNNELS_FILE = path.join(DATA_DIR, "funnels.json");

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("[db] Failed to ensure data dir:", err);
  }
}

export function hasPersistedFunnels(): boolean {
  try {
    return fs.existsSync(FUNNELS_FILE);
  } catch {
    return false;
  }
}

export function loadPersistedFunnels(): CreatorFunnel[] | null {
  try {
    if (!fs.existsSync(FUNNELS_FILE)) return null;
    const raw = fs.readFileSync(FUNNELS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as CreatorFunnel[];
  } catch (err) {
    console.error("[db] Failed to load funnels.json:", err);
    return null;
  }
}

export function savePersistedFunnels(funnels: CreatorFunnel[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(FUNNELS_FILE, JSON.stringify(funnels, null, 2), "utf8");
  } catch (err) {
    console.error("[db] Failed to save funnels.json:", err);
  }
}

export function clearPersistedFunnels(): void {
  try {
    if (fs.existsSync(FUNNELS_FILE)) {
      fs.unlinkSync(FUNNELS_FILE);
    }
  } catch (err) {
    console.error("[db] Failed to clear funnels.json:", err);
  }
}
