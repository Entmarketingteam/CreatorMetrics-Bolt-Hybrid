import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

export type User = {
  id: string;
  email: string;
  name: string;
  role: "owner" | "editor" | "viewer";
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadRaw(): User[] {
  ensureDir();
  if (!fs.existsSync(USERS_FILE)) {
    const now = new Date().toISOString();
    const seed: User[] = [
      {
        id: "user_default_owner",
        email: "demo@creatormetrics.app",
        name: "Demo User",
        role: "owner",
        createdAt: now,
        updatedAt: now
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }

  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

function saveRaw(list: User[]) {
  ensureDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2));
}

export function getAllUsers(): User[] {
  return loadRaw();
}

export function getUserById(id: string): User | null {
  return loadRaw().find((u) => u.id === id) ?? null;
}

export function getUserByEmail(email: string): User | null {
  return loadRaw().find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function createUser(data: { email: string; name: string; role?: User["role"] }): User {
  const list = loadRaw();

  const now = new Date().toISOString();
  const newUser: User = {
    id: "user_" + Math.random().toString(36).slice(2),
    email: data.email,
    name: data.name,
    role: data.role ?? "viewer",
    createdAt: now,
    updatedAt: now
  };

  list.push(newUser);
  saveRaw(list);
  return newUser;
}

export function updateUser(id: string, partial: Partial<User>): User | null {
  const list = loadRaw();
  const idx = list.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  const next = {
    ...list[idx],
    ...partial,
    updatedAt: new Date().toISOString()
  };

  list[idx] = next;
  saveRaw(list);
  return next;
}

export function deleteUser(id: string): boolean {
  const list = loadRaw();
  const filtered = list.filter((u) => u.id !== id);
  saveRaw(filtered);
  return filtered.length !== list.length;
}
