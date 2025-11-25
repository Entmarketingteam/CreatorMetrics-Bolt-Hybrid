import { NextRequest, NextResponse } from "next/server";
import {
  getUserById,
  updateUser,
  deleteUser
} from "@/lib/users";

export async function GET(_: NextRequest, { params }: any) {
  const user = getUserById(params.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest, { params }: any) {
  const body = await req.json().catch(() => ({}));
  const user = updateUser(params.id, body);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function DELETE(_: NextRequest, { params }: any) {
  const success = deleteUser(params.id);

  if (!success) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
