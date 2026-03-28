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

  // 1. fetch the shared link to get the realtor's user_id
  const { data: existingLink, error: fetchError } = await supabase
    .from("shared_links")
    .select("*")
    .eq("token", token)
    .single();

  if (fetchError || !existingLink) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const realtorUserId = existingLink.created_by;

  // 2. update shared_links
  const { data: updatedLink, error: updateError } = await supabase
    .from("shared_links")
    .update({
      form_data: body.form_data,
      is_submitted: body.is_submitted ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq("token", token)
    .select()
    .single();

  if (updateError) {
    console.error("SHARED_LINK UPDATE ERROR:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 3. create or update the linked disclosure
  let disclosureId = existingLink.disclosure_id;

  if (!disclosureId) {
    // only create disclosure if we have a realtor user_id
    if (!realtorUserId) {
      // no user_id available — just save to shared_links only, skip disclosures
      return NextResponse.json({ link: updatedLink });
    }

    const { data: newDisclosure, error: insertError } = await supabase
      .from("disclosures")
      .insert({
        user_id: realtorUserId,
        property_identifier: body.form_data?.propertyIdentifier || "Untitled",
        form_data: body.form_data,
        status: "draft",
      })
      .select()
      .single();

    if (insertError) {
      console.error("DISCLOSURE INSERT ERROR:", insertError);
      // non-fatal — shared_links already saved
      return NextResponse.json({ link: updatedLink });
    }

    if (newDisclosure) {
      disclosureId = newDisclosure.id;
      await supabase
        .from("shared_links")
        .update({ disclosure_id: disclosureId })
        .eq("token", token);
    }
  } else {
    // update existing disclosure
    await supabase
      .from("disclosures")
      .update({
        property_identifier: body.form_data?.propertyIdentifier || "Untitled",
        form_data: body.form_data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", disclosureId);
  }

  return NextResponse.json({ link: updatedLink });
}