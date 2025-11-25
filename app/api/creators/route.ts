import { NextRequest, NextResponse } from "next/server";
import { getActiveFunnels, getSelectedCreatorId, setSelectedCreatorId } from "@/lib/funnelStore";
import { getCreatorById } from "@/lib/demoData";

export async function GET() {
  const funnels = getActiveFunnels();
  const creators = funnels.map((f) => {
    const base = getCreatorById(f.creatorId);
    return {
      id: f.creatorId,
      name: base?.name ?? f.creatorName,
      handle: (base as any)?.handle ?? "",
    };
  });

  return NextResponse.json({
    creators,
    selectedCreatorId: getSelectedCreatorId(),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const creatorId = body.creatorId as string | undefined;

  if (!creatorId) {
    setSelectedCreatorId(null);
    return NextResponse.json({
      ok: true,
      selectedCreatorId: null,
    });
  }

  const funnels = getActiveFunnels();
  const exists = funnels.some((f) => f.creatorId === creatorId);
  if (!exists) {
    return NextResponse.json(
      { error: "Unknown creatorId" },
      { status: 400 }
    );
  }

  setSelectedCreatorId(creatorId);

  return NextResponse.json({
    ok: true,
    selectedCreatorId: creatorId,
  });
}
