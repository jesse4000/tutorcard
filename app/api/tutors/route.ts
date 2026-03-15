import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateCodesForUser, claimInviteCode } from "@/lib/inviteCodes";
import { containsProfanity } from "@/lib/profanityFilter";
import { sendEmail, FROM_HELLO } from "@/lib/email";
import { welcomeEmail, inviteCodeClaimedEmail } from "@/lib/email-templates";

function sanitizeSlug(slug: string) {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function checkContentProfanity(body: Record<string, unknown>): string | null {
  const texts: string[] = [];
  if (body.firstName) texts.push(String(body.firstName));
  if (body.lastName) texts.push(String(body.lastName));
  if (body.title) texts.push(String(body.title));
  if (Array.isArray(body.exams)) texts.push(...body.exams.map(String));
  if (Array.isArray(body.subjects)) texts.push(...body.subjects.map(String));
  if (Array.isArray(body.links)) {
    for (const link of body.links) {
      if (link && typeof link === "object" && "label" in link) {
        texts.push(String((link as { label: string }).label));
      }
    }
  }
  for (const text of texts) {
    if (containsProfanity(text)) {
      return "Content contains inappropriate language. Please revise and try again.";
    }
  }
  return null;
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

    // Check if user already has a tutor profile
    const { data: existingTutor } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingTutor) {
      return NextResponse.json(
        { error: "You already have a tutor card. Please edit your existing card instead." },
        { status: 409 }
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
      notifyOnMatch,
      email,
    } = body;

    // Validate required fields
    if (!firstName || !slug) {
      return NextResponse.json(
        { error: "First name and card URL are required" },
        { status: 400 }
      );
    }

    // Profanity check
    const profanityMsg = checkContentProfanity(body);
    if (profanityMsg) {
      return NextResponse.json({ error: profanityMsg }, { status: 400 });
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
        last_name: lastName?.trim() || "",
        title: title?.trim() || null,
        slug: cleanSlug,
        avatar_color: avatarColor || "#0f172a",
        exams: exams || [],
        subjects: subjects || [],
        locations: locations || [],
        links: links || [],
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
        const msg = error.message?.includes("user_id")
          ? "You already have a tutor card."
          : "That slug is already taken.";
        return NextResponse.json(
          { error: msg },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create card" },
        { status: 500 }
      );
    }

    // Generate invite codes for the new user and claim the provided code
    let codesGenerated = false;
    try {
      await generateCodesForUser(user.id);
      codesGenerated = true;
      if (body.inviteCode) {
        const fullName = `${firstName.trim()} ${(lastName || "").trim()}`.trim();
        await claimInviteCode(body.inviteCode, user.id, fullName, cleanSlug);

        // Notify the referrer that their invite code was claimed
        try {
          const admin = createAdminClient();
          const { data: inviteCode } = await admin
            .from("invite_codes")
            .select("owner_id")
            .eq("code", body.inviteCode)
            .single();
          if (inviteCode?.owner_id) {
            const { data: ownerAuth } = await admin.auth.admin.getUserById(inviteCode.owner_id);
            const { data: ownerTutor } = await admin
              .from("tutors")
              .select("first_name, last_name")
              .eq("user_id", inviteCode.owner_id)
              .single();
            if (ownerAuth?.user?.email && ownerTutor) {
              const referrerName = `${ownerTutor.first_name} ${ownerTutor.last_name}`.trim();
              const claimedByName = `${firstName.trim()} ${(lastName || "").trim()}`.trim();
              const tpl = inviteCodeClaimedEmail(referrerName, claimedByName, cleanSlug);
              await sendEmail({ to: ownerAuth.user.email, ...tpl });
            }
          }
        } catch (emailErr) {
          console.error("Failed to send invite claimed email:", emailErr);
        }
      }
    } catch (e) {
      console.error("Invite code processing error:", e);
    }

    // Send welcome email to the new tutor
    if (user.email) {
      try {
        const tpl = welcomeEmail(firstName.trim(), cleanSlug);
        await sendEmail({ to: user.email, from: FROM_HELLO, ...tpl });
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr);
      }
    }

    return NextResponse.json({ success: true, tutor: data, codesGenerated });
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

    // Profanity check
    const profanityMsg = checkContentProfanity(fields);
    if (profanityMsg) {
      return NextResponse.json({ error: profanityMsg }, { status: 400 });
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
