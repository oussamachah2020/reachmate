import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { senderName, from, replyTo, to, subject, html, cc, attachments } =
      await req.json();

    const toArray = Array.isArray(to) ? to : [to].filter(Boolean);

    const ccArray = cc
      ? Array.isArray(cc)
        ? cc.filter(Boolean)
        : [cc].filter(Boolean)
      : undefined;

    if (toArray.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No recipients provided" }),
        { status: 400 }
      );
    }

    const emailWithoutDomain = from.split("@")[0];

    const result = await resend.emails.send({
      from: `${senderName} <${emailWithoutDomain}@reachmate.xyz>`,
      to: toArray,
      subject,
      html,
      cc: ccArray,
      replyTo,
      attachments: attachments?.map((file: any) => ({
        filename: file.name || file.fileName,
        content: Buffer.from(file.content, "base64"),
        contentType: file.mimeType || file.fileType,
      })),
    });

    if (result.error) {
      console.error("Resend API error:", result.error);
      return new Response(
        JSON.stringify({ success: false, error: result.error.message }),
        { status: 500 }
      );
    }

    // Correct way to get the ID
    const resendEmailId = result.data?.id;

    // Ensure the ID exists before returning
    if (!resendEmailId) {
      console.error("Resend API did not return an email ID.");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email sent, but no ID returned from Resend.",
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true, id: resendEmailId }), {
      status: 200,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500 }
    );
  }
}