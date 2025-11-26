import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const QUEUE_FILE = path.join(DATA_DIR, "ingestQueue.json");

export type IngestJobStatus = "pending" | "running" | "done" | "failed";

export type IngestJob = {
  id: string;
  createdAt: string;
  updatedAt: string;
  files: string[];
  status: IngestJobStatus;
  progress: number;
  step:
    | "queued"
    | "detecting_schema"
    | "mapping_columns"
    | "auto_fixing"
    | "normalizing"
    | "building_funnels"
    | "logging_upload"
    | "complete"
    | "error";
  errors: string[];
  creatorsDetected: number;
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadQueue(): IngestJob[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(QUEUE_FILE)) return [];
    const raw = fs.readFileSync(QUEUE_FILE, "utf8");
    return JSON.parse(raw) as IngestJob[];
  } catch {
    return [];
  }
}

function saveQueue(queue: IngestJob[]) {
  ensureDataDir();
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), "utf8");
}

export function getQueue(): IngestJob[] {
  return loadQueue();
}

export function getJob(id: string): IngestJob | undefined {
  return loadQueue().find((j) => j.id === id);
}

export function enqueueJob(files: string[]): IngestJob {
  const queue = loadQueue();
  const now = new Date().toISOString();
  const job: IngestJob = {
    id: `ing_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    files,
    status: "pending",
    progress: 0,
    step: "queued",
    errors: [],
    creatorsDetected: 0,
  };
  queue.unshift(job);
  saveQueue(queue);
  return job;
}

export function updateJob(
  id: string,
  patch: Partial<Omit<IngestJob, "id" | "createdAt">>
): IngestJob | undefined {
  const queue = loadQueue();
  const idx = queue.findIndex((j) => j.id === id);
  if (idx === -1) return undefined;
  const current = queue[idx];
  const next: IngestJob = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  queue[idx] = next;
  saveQueue(queue);
  return next;
}

export function getNextPendingJob(): IngestJob | undefined {
  return loadQueue().find((j) => j.status === "pending");
}
