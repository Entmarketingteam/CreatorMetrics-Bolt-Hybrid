import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const files = form.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json(
      { error: "No files received." },
      { status: 400 }
    );
  }

  const timestamp = Date.now().toString();
  const dir = path.join(process.cwd(), "data", "uploads", timestamp);
  fs.mkdirSync(dir, { recursive: true });

  const storedPaths: string[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(dir, file.name);

    fs.writeFileSync(filePath, buffer);
    storedPaths.push(filePath);
  }

  return NextResponse.json({
    uploadedAt: timestamp,
    files: storedPaths,
  });
}
