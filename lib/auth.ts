import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USER_FILE = path.join(DATA_DIR, "user.json");

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadUser(): AuthUser | null {
  try {
    ensureDataDir();
    if (!fs.existsSync(USER_FILE)) return null;
    const raw = fs.readFileSync(USER_FILE, "utf8");
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveUser(email: string): AuthUser {
  ensureDataDir();
  const existing = loadUser();
  const now = new Date().toISOString();

  const user: AuthUser =
    existing && existing.email === email
      ? { ...existing, updatedAt: now }
      : {
          id: "user_default",
          email,
          name: email.split("@")[0],
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };

  fs.writeFileSync(USER_FILE, JSON.stringify(user, null, 2), "utf8");
  return user;
}
