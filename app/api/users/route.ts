import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, createUser } from "@/lib/users";

export async function GET() {
  return NextResponse.json({
    users: getAllUsers()
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, role } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Missing email or name." },
        { status: 400 }
      );
    }

    const user = createUser({ email, name, role });
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Failed to create user" },
      { status: 400 }
    );
  }
}
