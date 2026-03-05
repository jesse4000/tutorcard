import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH: update community settings (owner/admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const { data: tutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!tutor) {
      return NextResponse.json({ error: "No tutor card" }, { status: 404 });
    }

    // Check if user is owner/admin
    const { data: membership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", id)
      .eq("tutor_id", tutor.id)
      .single();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const { applicationQuestions, requireApproval } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof requireApproval === "boolean") {
      updates.require_approval = requireApproval;
    }

    if (applicationQuestions !== undefined) {
      // Validate questions format
      if (applicationQuestions !== null && Array.isArray(applicationQuestions)) {
        for (const q of applicationQuestions) {
          if (!q.id || !q.text?.trim()) {
            return NextResponse.json(
              { error: "Each question must have an id and text" },
              { status: 400 }
            );
          }
        }
        updates.application_questions = applicationQuestions;
      } else if (applicationQuestions === null) {
        updates.application_questions = null;
      }
    }

    const { error } = await supabase
      .from("communities")
      .update(updates)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
