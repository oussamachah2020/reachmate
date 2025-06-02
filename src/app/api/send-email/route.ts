// app/api/send-email/route.ts
import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { to, subject, html, cc, attachments } = await req.json();

    // Ensure 'to' is always an array
    const toArray = Array.isArray(to) ? to : [to].filter(Boolean);

    // Ensure 'cc' is either undefined or an array
    const ccArray = cc
      ? Array.isArray(cc)
        ? cc
        : [cc].filter(Boolean)
      : undefined;

    if (toArray.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No recipients provided" }),
        {
          status: 400,
        }
      );
    }

    const result = await resend.emails.send({
      from: "delivered@resend.dev",
      to: toArray,
      subject,
      html,
      cc: ccArray,
      attachments: attachments?.map((file: any) => ({
        filename: file.name,
        content: file.content,
        type: file.mimeType,
      })),
    });

    return Response.json({ success: true, result });
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(JSON.stringify({ success: false, error }), {
      status: 500,
    });
  }
}