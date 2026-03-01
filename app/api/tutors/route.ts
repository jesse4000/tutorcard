import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      title,
      slug,
      avatarColor,
      exams,
      subjects,
      locations,
      links,
      openToReferrals,
      notifyOnMatch,
      email,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !slug) {
      return NextResponse.json(
        { error: "First name, last name, and card URL are required" },
        { status: 400 }
      );
    }

    // Sanitize slug
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!cleanSlug) {
      return NextResponse.json(
        { error: "Invalid card URL slug" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from("tutors")
      .select("id")
      .eq("slug", cleanSlug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "That slug is already taken. Please choose another URL." },
        { status: 409 }
      );
    }

    // Insert tutor
    const { data, error } = await supabase
      .from("tutors")
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        title: title?.trim() || null,
        slug: cleanSlug,
        avatar_color: avatarColor || "#0f172a",
        exams: exams || [],
        subjects: subjects || [],
        locations: locations || [],
        links: links || [],
        open_to_referrals: openToReferrals || false,
        notify_on_match: notifyOnMatch || false,
        email: email?.trim() || "",
      })
      .select()
      .single();

    if (error) {
      console.error("Tutor insert error:", error);
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "That slug is already taken." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create card" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, tutor: data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
