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
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load(): UploadRecord[] {
  ensureDataDir();
  if (!fs.existsSync(UPLOADS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(UPLOADS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function save(list: UploadRecord[]) {
  ensureDataDir();
  fs.writeFileSync(UPLOADS_FILE, JSON.stringify(list, null, 2), "utf8");
}

export function logUpload(
  files: string[],
  creatorsDetected: number,
  status: "processed" | "failed"
): UploadRecord {
  const list = load();
  const rec: UploadRecord = {
    id: `upl_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    files,
    creatorsDetected,
    status,
  };
  list.unshift(rec);
  save(list);
  return rec;
}

export function getUploads(): UploadRecord[] {
  return load();
}
