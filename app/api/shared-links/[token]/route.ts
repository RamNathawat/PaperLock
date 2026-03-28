import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

  // 3. only create/update disclosure on final submit
  // ✅ this prevents the race condition where multiple autosaves
  //    each try to insert a new disclosure simultaneously
  if (!isSubmitted) {
    return NextResponse.json({ link: updatedLink });
  }

  // 4. on submit — create or update the linked disclosure
  const disclosureId = existingLink.disclosure_id;

  if (!disclosureId) {
    // no disclosure yet — create one under the realtor's account
    if (!realtorUserId) {
      // no realtor user_id — skip disclosure creation
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
    // disclosure already exists — update it to submitted
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

  return NextResponse.json({ link: updatedLink });
}