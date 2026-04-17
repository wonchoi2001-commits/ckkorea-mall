import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "");
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, spec, shipping, description, image_url, is_active, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("SUPABASE GET ERROR:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data ?? [] }, { status: 200 });
  } catch (error) {
    console.error("API GET ERROR:", error);
    return NextResponse.json(
      { message: "상품 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price, spec, shipping, description, image_url, is_active } = body;

    const supabase = await createServerSupabaseClient();
    const slug = makeSlug(name);

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          slug,
          price,
          spec,
          shipping,
          description,
          image_url,
          is_active,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 200 });
  } catch (error) {
    console.error("API POST ERROR:", error);
    return NextResponse.json(
      { message: "상품 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}