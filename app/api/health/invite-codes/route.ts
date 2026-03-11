import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const admin = createAdminClient();

    // Check if table exists by attempting a simple query
    const { count, error } = await admin
      .from("invite_codes")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({
        tableExists: false,
        totalCodes: 0,
        error: `${error.code}: ${error.message}`,
        suggestion:
          "The invite_codes table likely does not exist. Run the SQL in supabase/migrations/20260312_invite_codes_setup.sql via the Supabase SQL Editor.",
      });
    }

    // Get tutor count for context
    const { count: tutorCount } = await admin
      .from("tutors")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({
      tableExists: true,
      totalCodes: count ?? 0,
      totalTutors: tutorCount ?? 0,
      expectedCodes: (tutorCount ?? 0) * 5,
      error: null,
      suggestion:
        count === 0
          ? "Table exists but has no codes. Run the backfill section of 20260312_invite_codes_setup.sql in Supabase SQL Editor."
          : null,
    });
  } catch (e) {
    return NextResponse.json(
      {
        tableExists: false,
        totalCodes: 0,
        error: e instanceof Error ? e.message : String(e),
        suggestion:
          "Check that SUPABASE_SERVICE_ROLE_KEY is set in your environment variables.",
      },
      { status: 500 }
    );
  }
}
