import fs from "fs";

export function parseCSV(filePath: string): {
  columns: string[];
  rows: Record<string, any>[];
} {
  const raw = fs.readFileSync(filePath, "utf8");

  if (!raw.trim()) {
    return { columns: [], rows: [] };
  }

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const headerLine = lines[0];
  const columns = headerLine.split(",").map((c) => c.trim());

  const rows = lines.slice(1).map((line) => {
    const parts = line.split(",");
    const obj: Record<string, any> = {};
    columns.forEach((col, i) => {
      obj[col] = parts[i] ?? "";
    });
    return obj;
  });

  return { columns, rows };
}
