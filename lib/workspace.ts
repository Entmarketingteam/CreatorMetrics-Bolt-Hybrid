import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const WORKSPACE_FILE = path.join(DATA_DIR, "workspace.json");

export type WorkspaceMember = {
  id: string;
  email: string;
  role: "owner" | "editor" | "viewer";
};

export type Workspace = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  managesMultipleCreators: boolean;
  connectedPlatforms: {
    instagram: boolean;
    ltk: boolean;
    amazon: boolean;
    tiktokShop: boolean;
  };
  members: WorkspaceMember[];
};

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("[workspace] failed to ensure data dir", err);
  }
}

function defaultWorkspace(): Workspace {
  const now = new Date().toISOString();
  return {
    id: "ws_default",
    name: "CreatorMetrics Demo Workspace",
    createdAt: now,
    updatedAt: now,
    managesMultipleCreators: true,
    connectedPlatforms: {
      instagram: true,
      ltk: true,
      amazon: true,
      tiktokShop: false,
    },
    members: [
      {
        id: "member_owner",
        email: "founder@example.com",
        role: "owner",
      },
    ],
  };
}

export function loadWorkspace(): Workspace {
  try {
    ensureDataDir();
    if (!fs.existsSync(WORKSPACE_FILE)) {
      const ws = defaultWorkspace();
      fs.writeFileSync(WORKSPACE_FILE, JSON.stringify(ws, null, 2), "utf8");
      return ws;
    }

    const raw = fs.readFileSync(WORKSPACE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Workspace;
    return parsed;
  } catch (err) {
    console.error("[workspace] failed to load, falling back to default:", err);
    return defaultWorkspace();
  }
}

export function saveWorkspace(partial: Partial<Workspace>): Workspace {
  try {
    ensureDataDir();
    const current = loadWorkspace();
    const next: Workspace = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(WORKSPACE_FILE, JSON.stringify(next, null, 2), "utf8");
    return next;
  } catch (err) {
    console.error("[workspace] failed to save:", err);
    return loadWorkspace();
  }
}
