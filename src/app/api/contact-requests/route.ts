export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Find the firm belonging to this user
    const { data: firm, error: firmError } = await supabase
      .from("firms")
      .select("id")
      .eq("userId", userId)
      .maybeSingle();

    if (firmError) throw firmError;

    if (!firm) {
      return NextResponse.json({ requests: [] }, { status: 200 });
    }

    // Fetch contact requests for this firm, newest first
    const { data: requests, error: reqError } = await supabase
      .from("contact_requests")
      .select("*")
      .eq("firmId", firm.id)
      .order("timestamp", { ascending: false });

    if (reqError) throw reqError;

    return NextResponse.json({ requests: requests || [] }, { status: 200 });
  } catch (error) {
    console.error("GET Contact Requests Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
