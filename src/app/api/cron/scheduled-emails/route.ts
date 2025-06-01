// app/api/cron/schedule-emails/route.ts
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { DateTime } from "luxon";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_TOKEN!, // Use service role key
  { db: { schema: "public" } }
);

export async function POST(request: Request) {
  const startTime = Date.now();
  console.log("Cron job triggered at:", DateTime.now().toUTC().toISO());

  // Vercel cron jobs don't support custom headers, so skip API key check
  // Consider securing via Vercel-specific measures (e.g., environment checks)

  const now = DateTime.now().toUTC().toISO();
  console.log("Fetching emails scheduled before:", now);

  try {
    const { data: emails, error } = await supabase
      .from("scheduled_email") // Adjust to "scheduled_email" if needed
      .select("id, toEmail, subject, body, priority, scheduledAt")
      .eq("sent", false)
      .lte("scheduledAt", now)
      .order("scheduledAt", { ascending: true }) // Process older emails first
      .limit(100); // Prevent overload

    if (error) {
      console.error("Error fetching emails:", error);
      return NextResponse.json(
        { error: "Failed to fetch emails" },
        { status: 500 }
      );
    }

    console.log(`Found ${emails?.length || 0} emails to send`);

    if (!emails?.length) {
      return NextResponse.json({ message: "No emails to send" });
    }

    const processedEmails = [];
    const failedEmails = [];

    for (const email of emails) {
      try {
        console.log(
          `Sending email to ${email.toEmail} with subject: ${email.subject}`
        );
        const response = await resend.emails.send({
          from: "ReachMate <delivered@resend.dev>", // Use verified domain in production
          to: email.toEmail,
          subject: email.subject,
          html: email.body,
          headers: {
            "X-Priority":
              email.priority === "high"
                ? "1"
                : email.priority === "normal"
                  ? "3"
                  : "5",
          },
        });
        console.log(`Email sent to ${email.toEmail}:`, response);

        const { error: updateError } = await supabase
          .from("scheduled_email")
          .update({ sent: true, sentAt: DateTime.now().toUTC().toISO() })
          .eq("id", email.id);

        if (updateError) {
          console.error(
            `Failed to mark email ${email.id} as sent:`,
            updateError
          );
          failedEmails.push({ id: email.id, error: updateError.message });
        } else {
          console.log(`Marked email ${email.id} as sent`);
          processedEmails.push(email.id);
        }
      } catch (err) {
        console.error(`Failed to send email to ${email.toEmail}:`, err);
        // const { error: logError } = await supabase.from("email_logs").insert({
        //   email_id: email.id,
        //   toEmail: email.toEmail,
        //   error: err instanceof Error ? err.message : "Unknown error",
        //   created_at: DateTime.now().toUTC().toISO(),
        // });
        // if (logError) {
        //   console.error("Failed to log email error:", logError);
        // }
        // failedEmails.push({ id: email.id, error: err });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Cron job completed in ${duration}ms`);

    return NextResponse.json({
      message: `Processed ${processedEmails.length} email(s), ${failedEmails.length} failed`,
      processed: processedEmails,
      failed: failedEmails,
    });
  } catch (err) {
    console.error("Unexpected error in cron job:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
