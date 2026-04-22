import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// =============================
// GET — load shared link data
// =============================
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await getSupabase();

  const { data: link, error } = await supabase
    .from("shared_links")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  return NextResponse.json({ link });
}

// =============================
// PATCH — autosave + submit
// =============================
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await getSupabase();
  const body = await req.json();

  const isSubmitted      = body.is_submitted      === true;
  const isSeller2Submit  = body.seller2_submitted === true;

  // 1. Fetch the existing shared link
  const { data: existingLink, error: fetchError } = await supabase
    .from("shared_links")
    .select("*")
    .eq("token", token)
    .single();

  if (fetchError || !existingLink) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const realtorUserId = existingLink.created_by;

  // 2. Build the update payload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePayload: Record<string, any> = {
    form_data:   body.form_data,
    updated_at:  new Date().toISOString(),
  };

  if (isSubmitted)     updatePayload.is_submitted     = true;
  if (isSeller2Submit) updatePayload.seller2_submitted = true;

  const { data: updatedLink, error: updateError } = await supabase
    .from("shared_links")
    .update(updatePayload)
    .eq("token", token)
    .select()
    .single();

  if (updateError) {
    console.error("SHARED_LINK UPDATE ERROR:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 3. Only proceed with disclosure record + email logic on a final submit
  const isFinalSubmit = isSubmitted || isSeller2Submit;
  if (!isFinalSubmit) {
    return NextResponse.json({ link: updatedLink });
  }

  // ── SELLER 1 SUBMITS (is_submitted=true) ────────────────────────────────
  // If there is a Seller 2 email we must NOT send the final PDF yet.
  // Instead, send Seller 2 an invitation to co-sign, then stop.
  if (isSubmitted && !isSeller2Submit) {
    const seller2Email: string | null = existingLink.seller2_email ?? null;

    if (seller2Email) {
      // Send Seller 2 the invitation link
      const fillLink = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/fill/${token}`;
      const property = body.form_data?.propertyIdentifier || "the property";

      const html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eaeaea;border-radius:12px;overflow:hidden;color:#111827;">
          <div style="background-color:#2463EB;padding:32px 40px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;font-weight:600;letter-spacing:-0.025em;">Co-Seller Signature Required</h1>
          </div>
          <div style="padding:40px;">
            <p style="font-size:16px;line-height:24px;margin-top:0;">Hello,</p>
            <p style="font-size:16px;line-height:24px;">
              The primary seller has completed and signed the Oklahoma RPCD Disclosure form for
              <strong>${property}</strong>. As a co-seller, your review and signature are required
              to finalise the document.
            </p>
            <div style="text-align:center;margin:36px 0;">
              <a href="${fillLink}" style="display:inline-block;background-color:#2463EB;color:white;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
                Review &amp; Sign →
              </a>
            </div>
            <div style="background-color:#f9fafb;border:1px solid #f3f4f6;border-radius:8px;padding:20px;margin:24px 0;word-break:break-all;">
              <p style="margin:0 0 6px;font-size:11px;color:#9ca3af;text-transform:uppercase;font-weight:600;letter-spacing:0.05em;">Or copy this link</p>
              <p style="margin:0;font-size:13px;color:#4b5563;">${fillLink}</p>
            </div>
            <p style="font-size:14px;line-height:22px;color:#6b7280;margin-bottom:0;">
              No account or password is needed. The form is pre-filled — you only need to review and sign.
            </p>
          </div>
          <div style="background-color:#f9fafb;border-top:1px solid #f3f4f6;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `;

      try {
        await resend.emails.send({
          from:    "Disclosures <noreply@ourokrealty.com>",
          to:      [seller2Email],
          subject: `Action Required: Co-Sign the Disclosure for ${property}`,
          html,
        });
        console.log(`✉️  Seller 2 invite sent to: ${seller2Email}`);
      } catch (err) {
        console.error("Seller 2 invite email error:", err);
      }

      // Return early — do NOT generate PDF or email the agent yet
      return NextResponse.json({ link: updatedLink });
    }

    // No Seller 2 → fall through to final PDF + email logic below
  }

  // ── FINAL SUBMIT: either Seller 2 co-signed, OR single-seller flow ───────
  // At this point we know the form is fully complete. Create/update the
  // disclosure record and fire the completed-PDF email.

  const disclosureId = existingLink.disclosure_id;

  if (!disclosureId) {
    if (!realtorUserId) {
      return NextResponse.json({ link: updatedLink });
    }

    const { data: newDisclosure, error: insertError } = await supabase
      .from("disclosures")
      .insert({
        user_id:              realtorUserId,
        property_identifier:  body.form_data?.propertyIdentifier || "Untitled",
        form_data:            body.form_data,
        status:               "submitted",
      })
      .select()
      .single();

    if (insertError) {
      console.error("DISCLOSURE INSERT ERROR:", insertError);
      return NextResponse.json({ link: updatedLink });
    }

    if (newDisclosure) {
      await supabase
        .from("shared_links")
        .update({ disclosure_id: newDisclosure.id })
        .eq("token", token);
    }
  } else {
    await supabase
      .from("disclosures")
      .update({
        property_identifier: body.form_data?.propertyIdentifier || "Untitled",
        form_data:           body.form_data,
        status:              "submitted",
        updated_at:          new Date().toISOString(),
      })
      .eq("id", disclosureId);
  }

  // ── Generate PDF and email to agent + seller(s) ──────────────────────────
  const sellerEmail:  string | null = existingLink.seller_email  ?? null;
  const seller2Email: string | null = existingLink.seller2_email ?? null;
  let   agentEmail:   string | null = null;

  if (realtorUserId) {
    try {
      const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data: { user } } = await adminClient.auth.admin.getUserById(realtorUserId);
      if (user?.email) agentEmail = user.email;
    } catch (err) {
      console.warn("Failed to fetch agent email for auto-mailer via admin client.", err);
    }
  }

  const recipients = [sellerEmail, seller2Email, agentEmail].filter(Boolean) as string[];

  if (recipients.length > 0) {
    try {
      const pdfRes = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/disclosure/generate`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body.pdf_payload || body.form_data),
        }
      );

      if (pdfRes.ok) {
        const pdfBuffer = await pdfRes.arrayBuffer();
        const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
        const property  = body.form_data?.propertyIdentifier || "Oklahoma Property";

        const htmlTemplate = `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eaeaea;border-radius:12px;overflow:hidden;color:#111827;">
            <div style="background-color:#2463EB;padding:32px 40px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:24px;font-weight:600;letter-spacing:-0.025em;">Disclosure Completed</h1>
            </div>
            <div style="padding:40px;">
              <p style="font-size:16px;line-height:24px;margin-top:0;">Hello,</p>
              <p style="font-size:16px;line-height:24px;">
                The official Oklahoma RPCD Disclosure form for <strong>${property}</strong> has been
                successfully completed and electronically signed by all required parties.
              </p>
              <div style="background-color:#f9fafb;border:1px solid #f3f4f6;border-radius:8px;padding:24px;margin:32px 0;">
                <p style="margin:0 0 6px;font-size:14px;color:#6b7280;text-transform:uppercase;font-weight:600;letter-spacing:0.05em;">Property Identifier</p>
                <p style="margin:4px 0 0;font-size:18px;font-weight:500;">${property}</p>
              </div>
              <p style="font-size:16px;line-height:24px;">Please find the legally completed, cleanly formatted PDF disclosure securely attached to this email.</p>
              <p style="font-size:14px;line-height:24px;color:#6b7280;margin-bottom:0px;">Automatically generated by the Disclosure Management System.</p>
            </div>
            <div style="background-color:#f9fafb;border-top:1px solid #f3f4f6;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated email. Please do not reply.</p>
            </div>
          </div>
        `;

        await resend.emails.send({
          from:        "Disclosures <noreply@ourokrealty.com>",
          to:          recipients,
          subject:     `✅ Completed Disclosure: ${property}`,
          html:        htmlTemplate,
          attachments: [
            {
              filename: `Disclosure_${property.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`,
              content:  pdfBase64,
            },
          ],
        });

        console.log(`✅ Disclosure PDF emailed to: ${recipients.join(", ")}`);
      } else {
        console.error("PDF generation failed for email:", await pdfRes.text());
      }
    } catch (emailError) {
      // Don't fail the whole request if email fails
      console.error("Email send failed:", emailError);
    }
  }

  return NextResponse.json({ link: updatedLink });
}