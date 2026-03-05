import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function sanitizeSlug(slug: string) {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

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

    const cleanSlug = sanitizeSlug(slug);
    if (!cleanSlug) {
      return NextResponse.json(
        { error: "Invalid card URL slug" },
        { status: 400 }
      );
    }

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

    // Insert tutor with user_id
    const { data, error } = await supabase
      .from("tutors")
      .insert({
        user_id: user.id,
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
        business_name: body.businessName?.trim() || null,
        years_experience: body.yearsExperience ?? null,
        profile_image_url: body.profileImageUrl || null,
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
      // If new columns don't exist yet, retry without them
      if (error.message?.includes("column") || error.code === "42703") {
        const { data: retryData, error: retryError } = await supabase
          .from("tutors")
          .insert({
            user_id: user.id,
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

        if (retryError) {
          console.error("Tutor insert retry error:", retryError);
          return NextResponse.json(
            { error: "Failed to create card" },
            { status: 500 }
          );
        }
        return NextResponse.json({ success: true, tutor: retryData });
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

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Tutor card ID is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (fields.firstName !== undefined)
      updateData.first_name = fields.firstName.trim();
    if (fields.lastName !== undefined)
      updateData.last_name = fields.lastName.trim();
    if (fields.title !== undefined)
      updateData.title = fields.title?.trim() || null;
    if (fields.avatarColor !== undefined)
      updateData.avatar_color = fields.avatarColor;
    if (fields.exams !== undefined) updateData.exams = fields.exams;
    if (fields.subjects !== undefined) updateData.subjects = fields.subjects;
    if (fields.locations !== undefined) updateData.locations = fields.locations;
    if (fields.links !== undefined) updateData.links = fields.links;
    if (fields.openToReferrals !== undefined)
      updateData.open_to_referrals = fields.openToReferrals;
    if (fields.notifyOnMatch !== undefined)
      updateData.notify_on_match = fields.notifyOnMatch;
    if (fields.email !== undefined)
      updateData.email = fields.email?.trim() || "";
    if (fields.businessName !== undefined)
      updateData.business_name = fields.businessName?.trim() || null;
    if (fields.yearsExperience !== undefined)
      updateData.years_experience = fields.yearsExperience ?? null;
    if (fields.profileImageUrl !== undefined)
      updateData.profile_image_url = fields.profileImageUrl || null;

    // Handle slug change
    if (fields.slug !== undefined) {
      const cleanSlug = sanitizeSlug(fields.slug);
      if (!cleanSlug) {
        return NextResponse.json(
          { error: "Invalid card URL slug" },
          { status: 400 }
        );
      }
      // Check uniqueness excluding current card
      const { data: existing } = await supabase
        .from("tutors")
        .select("id")
        .eq("slug", cleanSlug)
        .neq("id", id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "That slug is already taken." },
          { status: 409 }
        );
      }
      updateData.slug = cleanSlug;
    }

    // RLS enforces ownership, but double-check with user_id
    const { data, error } = await supabase
      .from("tutors")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Tutor update error:", error);
      // If new columns don't exist yet, retry without them
      if (error.message?.includes("column") || error.code === "42703") {
        const fallbackData = { ...updateData };
        delete fallbackData.business_name;
        delete fallbackData.years_experience;
        delete fallbackData.profile_image_url;

        const { data: retryData, error: retryError } = await supabase
          .from("tutors")
          .update(fallbackData)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (!retryError && retryData) {
          return NextResponse.json({ success: true, tutor: retryData });
        }
      }
      return NextResponse.json(
        { error: "Failed to update card" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Card not found or not owned by you" },
        { status: 404 }
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
