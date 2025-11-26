import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loadUser, saveUser } from "@/lib/auth";

export const runtime = "nodejs";

const COOKIE_NAME = "cm_user";

export async function GET() {
  const cookieStore = cookies();
  const email = cookieStore.get(COOKIE_NAME)?.value;
  if (!email) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = loadUser();
  if (!user || user.email !== email) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const email = (body.email as string | undefined)?.trim();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = saveUser(email);
  const res = NextResponse.json({ authenticated: true, user });

  res.cookies.set({
    name: COOKIE_NAME,
    value: email,
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return res;
}
