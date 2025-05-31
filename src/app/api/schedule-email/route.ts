// app/api/schedule-email/route.ts
import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, recipients, subject, body, scheduleAt, priority } =
      await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!recipients?.length || !subject || !body || !scheduleAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate scheduleAt is in the future
    const scheduleDate = new Date(scheduleAt);
    const now = new Date();
    if (scheduleDate <= now) {
      return NextResponse.json(
        { error: "Schedule time must be in the future" },
        { status: 400 }
      );
    }

    // Insert each recipient as a separate row
    const insertPromises = recipients.map((to_email: string) =>
      supabase.from("scheduled_email").insert({
        senderId: userId,
        toEmail: to_email,
        subject,
        body,
        scheduledAt: scheduleAt,
        sent: false,
        priority,
      })
    );

    const results = await Promise.all(insertPromises);

    // Check for any errors in the insert operations
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      console.error("Error inserting emails:", errors);
      return NextResponse.json(
        { error: "Failed to schedule some emails" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Successfully scheduled ${recipients.length} email(s)`,
    });
  } catch (error) {
    console.error("Error scheduling emails:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
