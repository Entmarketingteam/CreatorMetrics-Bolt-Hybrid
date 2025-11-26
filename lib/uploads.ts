import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_FILE = path.join(DATA_DIR, "uploads.json");

export type UploadRecord = {
  id: string;
  createdAt: string;
  files: string[];
  creatorsDetected: number;
  status: "processed" | "failed";
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadAllUploads(): UploadRecord[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(UPLOADS_FILE)) return [];
    const raw = fs.readFileSync(UPLOADS_FILE, "utf8");
    return JSON.parse(raw) as UploadRecord[];
  } catch {
    return [];
  }
}

function saveAllUploads(records: UploadRecord[]) {
  ensureDataDir();
  fs.writeFileSync(UPLOADS_FILE, JSON.stringify(records, null, 2), "utf8");
}

export function logUpload(
  files: string[],
  creatorsDetected: number,
  status: "processed" | "failed"
): UploadRecord {
  const records = loadAllUploads();
  const rec: UploadRecord = {
    id: `upl_${Date.now()}`,
    createdAt: new Date().toISOString(),
    files,
    creatorsDetected,
    status,
  };
  records.unshift(rec);
  saveAllUploads(records);
  return rec;
}

export function getUploads(): UploadRecord[] {
  return loadAllUploads();
}
