import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifySuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const allowedEmails = (process.env.SUPERADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!user.email || !allowedEmails.includes(user.email.toLowerCase())) {
    return null;
  }

  return user;
}

// DELETE — Delete a user account
export async function DELETE(request: Request) {
  try {
    const admin = await verifySuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Delete tutor profile first (cascades to reviews, vouches, badges, inquiries, etc.)
    const { error: tutorError } = await supabaseAdmin
      .from("tutors")
      .delete()
      .eq("user_id", userId);

    if (tutorError) {
      console.error("Delete tutor error:", tutorError);
    }

    // Then delete the auth user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Delete user error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// PATCH — Update user email
export async function PATCH(request: Request) {
  try {
    const admin = await verifySuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: "userId and email are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Update auth.users email
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email }
    );

    if (authError) {
      console.error("Update user email (auth) error:", authError);
      return NextResponse.json(
        { error: authError.message || "Failed to update email" },
        { status: 500 }
      );
    }

    // Update tutors.email
    const { error: dbError } = await supabaseAdmin
      .from("tutors")
      .update({ email })
      .eq("user_id", userId);

    if (dbError) {
      console.error("Update tutor email (db) error:", dbError);
      return NextResponse.json(
        { error: "Auth email updated but failed to update tutor record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update email error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
