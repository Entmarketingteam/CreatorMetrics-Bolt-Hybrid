import { NextRequest, NextResponse } from "next/server";
import { markAlertRead, markAllAlertsRead } from "@/lib/alerts";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));

  if (body && body.all) {
    markAllAlertsRead();
    return NextResponse.json({ ok: true });
  }

  const id = body?.id as string | undefined;
  if (!id) {
    return NextResponse.json(
      { error: "Missing alert id" },
      { status: 400 }
    );
  }

  const updated = markAlertRead(id);
  if (!updated) {
    return NextResponse.json(
      { error: "Alert not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ alert: updated });
}
