import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { recipients, link, property } = await req.json();

    if (!recipients || recipients.length === 0 || !link) {
      return NextResponse.json({ error: "Missing recipients or link" }, { status: 400 });
    }

    const propertyLabel = property || "your property";

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; color: #111827;">
        <div style="background-color: #2463EB; padding: 32px 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.025em;">Action Required: Complete Your Disclosure</h1>
        </div>
        <div style="padding: 40px;">
          <p style="font-size: 16px; line-height: 24px; margin-top: 0;">Hello,</p>
          <p style="font-size: 16px; line-height: 24px;">Your listing agent has sent you an Oklahoma RPCD Disclosure form to complete for <strong>${propertyLabel}</strong>. Please use the secure link below to fill out and sign the form at your convenience.</p>

          <div style="text-align: center; margin: 36px 0;">
            <a href="${link}" style="display: inline-block; background-color: #2463EB; color: white; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; letter-spacing: -0.01em;">
              Open Disclosure Form →
            </a>
          </div>

          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0; word-break: break-all;">
            <p style="margin: 0 0 6px; font-size: 11px; color: #9ca3af; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Or copy this link</p>
            <p style="margin: 0; font-size: 13px; color: #4b5563;">${link}</p>
          </div>

          <p style="font-size: 14px; line-height: 22px; color: #6b7280;">No account or password is needed. Your progress is saved automatically, so you can return to the form at any time using the same link.</p>
          <p style="font-size: 14px; line-height: 22px; color: #6b7280; margin-bottom: 0;">Once you submit, a completed copy of the disclosure PDF will be emailed to you and your agent automatically.</p>
        </div>
        <div style="background-color: #f9fafb; border-top: 1px solid #f3f4f6; padding: 24px 40px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">This is an automated email sent on behalf of your listing agent. Please do not reply.</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Disclosures <noreply@ourokrealty.com>",
      to: recipients,
      subject: "Action Required: Complete Your Property Disclosure Form",
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Invite email error:", err);
    return NextResponse.json({ error: err.message || "Failed to send invite" }, { status: 500 });
  }
}
