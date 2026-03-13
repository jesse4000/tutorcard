import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedEmails = (process.env.SUPERADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!user.email || !allowedEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userIds, action } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds array is required" },
        { status: 400 }
      );
    }

    if (userIds.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 users per bulk operation" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const results: { userId: string; success: boolean; error?: string }[] = [];

    for (const userId of userIds) {
      try {
        if (action === "suspend") {
          const { error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { ban_duration: "876000h" }
          );
          results.push({
            userId,
            success: !error,
            error: error?.message,
          });
        } else {
          // Default: delete
          const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
          results.push({
            userId,
            success: !error,
            error: error?.message,
          });
        }
      } catch (err) {
        results.push({
          userId,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({ results, succeeded, failed });
  } catch (err) {
    console.error("Bulk operation error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
