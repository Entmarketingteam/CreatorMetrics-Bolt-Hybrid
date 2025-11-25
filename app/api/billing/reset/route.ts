import { NextResponse } from "next/server";
import { resetBilling } from "@/lib/billing";

export async function POST() {
  const billing = resetBilling();
  return NextResponse.json({ billing });
}
