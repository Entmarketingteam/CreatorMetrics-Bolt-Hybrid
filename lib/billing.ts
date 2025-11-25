import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const BILLING_FILE = path.join(DATA_DIR, "billing.json");

export type PlanId = "free" | "pro" | "agency";

export type BillingState = {
  plan: PlanId;
  renewalDate: string;
  createdAt: string;
  updatedAt: string;
  limits: {
    creators: number;
    uploadsPerMonth: number;
    insightsPerDay: number;
  };
};

const PLAN_LIMITS = {
  free:   { creators: 1, uploadsPerMonth: 5, insightsPerDay: 3 },
  pro:    { creators: 5, uploadsPerMonth: 50, insightsPerDay: 50 },
  agency: { creators: 50, uploadsPerMonth: 999, insightsPerDay: 999 }
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function defaultState(): BillingState {
  const now = new Date().toISOString();
  return {
    plan: "free",
    renewalDate: new Date(Date.now() + 30 * 86400_000).toISOString(),
    createdAt: now,
    updatedAt: now,
    limits: PLAN_LIMITS.free
  };
}

function loadRaw(): BillingState {
  ensureDir();
  if (!fs.existsSync(BILLING_FILE)) {
    const state = defaultState();
    fs.writeFileSync(BILLING_FILE, JSON.stringify(state, null, 2));
    return state;
  }

  return JSON.parse(fs.readFileSync(BILLING_FILE, "utf8"));
}

function saveRaw(state: BillingState) {
  ensureDir();
  fs.writeFileSync(BILLING_FILE, JSON.stringify(state, null, 2));
}

export function getBilling(): BillingState {
  return loadRaw();
}

export function updatePlan(plan: PlanId): BillingState {
  const now = new Date().toISOString();

  const next: BillingState = {
    ...loadRaw(),
    plan,
    updatedAt: now,
    limits: PLAN_LIMITS[plan]
  };

  saveRaw(next);
  return next;
}

export function resetBilling(): BillingState {
  const next = defaultState();
  saveRaw(next);
  return next;
}
