import { NextRequest, NextResponse } from "next/server";
import { getFunnelByCreatorId } from "@/lib/funnelStore";
import { getCreatorById } from "@/lib/demoData";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const funnel = getFunnelByCreatorId(params.id);

  if (!funnel) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  const creatorMeta = getCreatorById(funnel.creatorId);

  return NextResponse.json({
    funnel,
    creatorMeta,
  });
}
