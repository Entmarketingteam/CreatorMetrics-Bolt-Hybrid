import fs from "fs";
import path from "path";
import { getBilling } from "./billing";

const DATA_DIR = path.join(process.cwd(), "data");
const USAGE_FILE = path.join(DATA_DIR, "usage.json");

export type Usage = {
  periodStart: string;
  uploadsThisMonth: number;
  insightsToday: number;
  apiCalls: number;
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function newUsage(): Usage {
  return {
    periodStart: new Date().toISOString(),
    uploadsThisMonth: 0,
    insightsToday: 0,
    apiCalls: 0
  };
}

function loadRaw(): Usage {
  ensureDir();
  if (!fs.existsSync(USAGE_FILE)) {
    const init = newUsage();
    fs.writeFileSync(USAGE_FILE, JSON.stringify(init, null, 2));
    return init;
  }

  return JSON.parse(fs.readFileSync(USAGE_FILE, "utf8"));
}

function saveRaw(u: Usage) {
  ensureDir();
  fs.writeFileSync(USAGE_FILE, JSON.stringify(u, null, 2));
}

export function getUsage(): Usage {
  return loadRaw();
}

export function incrementUploads(): Usage {
  const usage = loadRaw();
  usage.uploadsThisMonth += 1;
  saveRaw(usage);
  return usage;
}

export function incrementInsights(): Usage {
  const usage = loadRaw();
  usage.insightsToday += 1;
  saveRaw(usage);
  return usage;
}

export function incrementApi(): Usage {
  const usage = loadRaw();
  usage.apiCalls += 1;
  saveRaw(usage);
  return usage;
}

export function checkUsageLimits(): {
  ok: boolean;
  reason?: string;
} {
  const billing = getBilling();
  const usage = getUsage();

  if (usage.uploadsThisMonth >= billing.limits.uploadsPerMonth) {
    return { ok: false, reason: "Upload limit reached for your plan." };
  }

  if (usage.insightsToday >= billing.limits.insightsPerDay) {
    return { ok: false, reason: "Daily insights limit reached." };
  }

  return { ok: true };
}
