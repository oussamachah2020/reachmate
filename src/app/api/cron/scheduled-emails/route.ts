// app/api/cron/schedule-emails/route.ts
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { DateTime } from "luxon";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_TOKEN!, // Use service role key for admin operations
  { db: { schema: "public" } }
);

export async function POST() {
  const startTime = Date.now();
  console.log("Cron job triggered at:", DateTime.now().toUTC().toISO());

  const now = DateTime.now().toUTC().toISO();
  console.log("Fetching emails scheduled before:", now);

  try {
    // Fetch scheduled emails with necessary relationship data
    const { data: emails, error } = await supabase
      .from("scheduled_email")
      .select(
        `
        id, 
        toEmail, 
        subject, 
        body, 
        priority, 
        scheduledAt,
        senderId,
        templateId,
        categoryId,
        tagId
      `
      )
      .eq("sent", false)
      .lte("scheduledAt", now)
      .order("scheduledAt", { ascending: true })
      .limit(100);

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

        // Send email via Resend
        const response = await resend.emails.send({
          from: "ReachMate <delivered@resend.dev>",
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

        // Get or create receiver
        let receiverId: string;
        const { data: existingReceiver } = await supabase
          .from("receiver")
          .select("id")
          .eq("email", email.toEmail)
          .single();

        if (existingReceiver) {
          receiverId = existingReceiver.id;
        } else {
          // Create new receiver if doesn't exist
          const { data: newReceiver, error: receiverError } = await supabase
            .from("receiver")
            .insert({ email: email.toEmail })
            .select("id")
            .single();

          if (receiverError || !newReceiver) {
            throw new Error(
              `Failed to create receiver: ${receiverError?.message}`
            );
          }
          receiverId = newReceiver.id;
        }

        // Insert into email_sent table
        const { error: insertError } = await supabase
          .from("email_sent")
          .insert({
            templateId: email.templateId,
            senderId: email.senderId,
            receiverId: receiverId,
            categoryId: email.categoryId || null,
            tagId: email.tagId || null,
            sentAt: DateTime.now().toUTC().toISO(),
            // isRead, archived, starred will use their default values (false)
          });

        if (insertError) {
          console.error(`Failed to insert email_sent record:`, insertError);
          throw new Error(
            `Failed to insert email_sent: ${insertError.message}`
          );
        }

        // Mark scheduled email as sent
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
          console.log(`Successfully processed email ${email.id}`);
          processedEmails.push(email.id);
        }
      } catch (err) {
        console.error(`Failed to process email to ${email.toEmail}:`, err);
        failedEmails.push({
          id: email.id,
          error: err instanceof Error ? err.message : "Unknown error",
        });
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