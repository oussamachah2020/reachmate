// app/api/send-email/route.ts
import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KET!);

export async function POST(req: Request) {
  try {
    const { to, subject, html, cc, attachments } = await req.json();

    const result = await resend.emails.send({
      from: "delivered@resend.dev",
      to,
      subject,
      html,
      cc,
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
