import { createServerClient } from "@supabase/ssr";
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

  const isSubmitted = body.is_submitted === true;

  // 1. fetch the shared link
  const { data: existingLink, error: fetchError } = await supabase
    .from("shared_links")
    .select("*")
    .eq("token", token)
    .single();

  if (fetchError || !existingLink) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const realtorUserId = existingLink.created_by;

  // 2. update shared_links with form data
  const { data: updatedLink, error: updateError } = await supabase
    .from("shared_links")
    .update({
      form_data: body.form_data,
      is_submitted: isSubmitted,
      updated_at: new Date().toISOString(),
    })
    .eq("token", token)
    .select()
    .single();

  if (updateError) {
    console.error("SHARED_LINK UPDATE ERROR:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 3. only create/update disclosure + send email on final submit
  if (!isSubmitted) {
    return NextResponse.json({ link: updatedLink });
  }

  // 4. on submit — create or update the linked disclosure
  const disclosureId = existingLink.disclosure_id;

  if (!disclosureId) {
    if (!realtorUserId) {
      return NextResponse.json({ link: updatedLink });
    }

    const { data: newDisclosure, error: insertError } = await supabase
      .from("disclosures")
      .insert({
        user_id: realtorUserId,
        property_identifier: body.form_data?.propertyIdentifier || "Untitled",
        form_data: body.form_data,
        status: "submitted",
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
        form_data: body.form_data,
        status: "submitted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", disclosureId);
  }

  // 5. generate PDF and email to buyer + seller
  const buyerEmail = existingLink.buyer_email;
  const sellerEmail = existingLink.seller_email;

  if (buyerEmail || sellerEmail) {
    try {
      // generate the PDF
      const pdfRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/disclosure/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body.form_data),
      });

      if (pdfRes.ok) {
        const pdfBuffer = await pdfRes.arrayBuffer();
        const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
        const property = body.form_data?.propertyIdentifier || "Oklahoma Property";

        const recipients = [buyerEmail, sellerEmail].filter(Boolean) as string[];

        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: recipients,
          subject: `Disclosure Form — ${property}`,
          html: `
            <p>Hello,</p>
            <p>The Oklahoma RPCD Disclosure form for <strong>${property}</strong> has been completed and signed.</p>
            <p>Please find the completed disclosure attached to this email.</p>
            <p>This document was generated via the Oklahoma RPCD Disclosure App.</p>
          `,
          attachments: [
            {
              filename: "oklahoma-disclosure.pdf",
              content: pdfBase64,
            },
          ],
        });

        console.log(`✅ Disclosure PDF emailed to: ${recipients.join(", ")}`);
      } else {
        console.error("PDF generation failed for email:", await pdfRes.text());
      }
    } catch (emailError) {
      // don't fail the whole request if email fails
      console.error("Email send failed:", emailError);
    }
  }

  return NextResponse.json({ link: updatedLink });
}