import { NextResponse } from "next/server";
import { headers } from "next/headers"; // This is a dynamic function
import crypto from "crypto";
import { supabase } from "@/lib/supabase/client";

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  // FIX: Await headers() before calling .get()
  const requestHeaders = await headers(); // Get the headers instance
  //@ts-ignore
  const signature = requestHeaders.get("x-resend-signature"); // Now call .get() on the instance

  if (!signature) {
    console.warn("No signature header found in webhook request.");
    return new NextResponse("No signature header", { status: 400 });
  }

  const rawBody = await req.text();

  if (!RESEND_WEBHOOK_SECRET) {
    console.error("RESEND_WEBHOOK_SECRET is not set.");
    return new NextResponse("Server configuration error", { status: 500 });
  }

  try {
    const hmac = crypto.createHmac("sha256", RESEND_WEBHOOK_SECRET);
    hmac.update(rawBody);
    const digest = hmac.digest("hex");

    if (digest !== signature) {
      console.warn("Invalid webhook signature:", {
        expected: digest,
        received: signature,
      });
      return new NextResponse("Invalid signature", { status: 403 });
    }
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new NextResponse("Forbidden", { status: 403 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (error) {
    console.error("Error parsing JSON body:", error);
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  console.log("Received Resend webhook event:", event);

  const emailId = event.data?.email_id;
  const eventType = event.type;

  if (!emailId || !eventType) {
    console.warn("Missing emailId or eventType in webhook payload:", event);
    return new NextResponse("Bad Request: Missing data", { status: 400 });
  }

  let statusToUpdate: string | null = null;
  let timestampToUpdate: string | null = null;
  let updateObject: { [key: string]: any } = {}; // Object to build dynamic updates

  switch (eventType) {
    case "email.delivered":
      statusToUpdate = "delivered";
      timestampToUpdate = event.created_at;
      updateObject.delivered_at = timestampToUpdate;
      break;
    case "email.opened":
      statusToUpdate = "opened";
      timestampToUpdate = event.created_at;
      updateObject.opened_at = timestampToUpdate;
      break;
    case "email.clicked":
      statusToUpdate = "clicked";
      timestampToUpdate = event.created_at;
      updateObject.clicked_at = timestampToUpdate;
      break;
    case "email.bounced":
      statusToUpdate = "bounced";
      timestampToUpdate = event.created_at;
      updateObject.bounced_at = timestampToUpdate;
      break;
    case "email.complained":
      statusToUpdate = "complained";
      timestampToUpdate = event.created_at;
      updateObject.complained_at = timestampToUpdate;
      break;
    default:
      console.log(`Unhandled Resend event type: ${eventType}`);
      return new NextResponse("Success: Unhandled event type", { status: 200 });
  }

  // Update email_status if a relevant event occurred
  if (statusToUpdate) {
    updateObject.email_status = statusToUpdate;
  }

  try {
    const { data, error } = await supabase
      .from("email_sent")
      .update(updateObject) // Use the dynamically built updateObject
      .eq("resend_email_id", emailId);

    if (error) {
      console.error("Error updating email status in Supabase:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    console.log(
      `Successfully updated email ${emailId} to status: ${statusToUpdate}`
    );
    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
