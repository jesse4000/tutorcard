import { NextResponse } from "next/server";
import { validateInviteCode } from "@/lib/inviteCodes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { valid: false, error: "Code is required" },
      { status: 400 }
    );
  }

  const result = await validateInviteCode(code);
  return NextResponse.json(result);
}
