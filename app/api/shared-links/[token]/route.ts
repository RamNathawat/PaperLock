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
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await getSupabase();
  const body = await req.json();

  // =============================
  // 1. UPDATE shared_links
  // =============================
  const { data, error } = await supabase
    .from("shared_links")
    .update({
      form_data: body.form_data,
      is_submitted: body.is_submitted ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq("token", token)
    .select()
    .single();

  if (error) {
    console.error("SHARED_LINK ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // =============================
  // 2. CREATE / UPDATE DISCLOSURE
  // =============================
  let disclosureId = data?.disclosure_id;

  if (!disclosureId) {
    const { data: newDisclosure, error: insertError } = await supabase
      .from("disclosures")
      .insert({
        property_identifier:
          body.form_data?.propertyIdentifier || "Untitled",
        form_data: body.form_data,
      })
      .select()
      .single();

    console.log("DISCLOSURE INSERT RESULT:", newDisclosure);
    console.log("DISCLOSURE INSERT ERROR:", insertError);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    if (newDisclosure) {
      disclosureId = newDisclosure.id;

      const { error: linkError } = await supabase
        .from("shared_links")
        .update({ disclosure_id: disclosureId })
        .eq("token", token);

      if (linkError) {
        console.error("LINK UPDATE ERROR:", linkError);
      }
    }
  } else {
    const { error: updateError } = await supabase
      .from("disclosures")
      .update({
        property_identifier:
          body.form_data?.propertyIdentifier || "Untitled",
        form_data: body.form_data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", disclosureId);

    if (updateError) {
      console.error("DISCLOSURE UPDATE ERROR:", updateError);
    }
  }

  return NextResponse.json({ link: data });
}