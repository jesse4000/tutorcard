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
    const { userId, action } = body;

    if (!userId || !action || !["ban", "unban"].includes(action)) {
      return NextResponse.json(
        { error: "userId and action ('ban' or 'unban') are required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: action === "ban" ? "876000h" : "none",
    });

    if (error) {
      console.error("Suspend/unsuspend error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update user status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, action });
  } catch (err) {
    console.error("Suspend/unsuspend error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
