import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tutorId, senderName, senderEmail, senderPhone, examsOfInterest, message } = body;

    if (!tutorId || !senderName || !senderEmail || !message) {
      return NextResponse.json(
        { error: "tutorId, senderName, senderEmail, and message are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.from("inquiries").insert({
      tutor_id: tutorId,
      sender_name: senderName,
      sender_email: senderEmail,
      sender_phone: senderPhone || null,
      exams_of_interest: examsOfInterest || [],
      message,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
