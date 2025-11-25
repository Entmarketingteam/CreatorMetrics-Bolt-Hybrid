import { NextResponse } from "next/server";
import { generateAlertsSummary } from "@/lib/alerts";

export const runtime = "nodejs";

export async function GET() {
  const summary = generateAlertsSummary();
  return NextResponse.json(summary);
}

export async function POST() {
  const summary = generateAlertsSummary();
  return NextResponse.json(summary);
}
