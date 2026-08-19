export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { ADMIN_EMAIL } from "@/lib/admin";

// GET request to fetch the entire database for admin use
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: userId is required." }, { status: 401 });
    }

    // Verify the requesting user is THE admin
    const { data: currentUser, error: userCheckError } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', userId)
      .maybeSingle();

    if (userCheckError || !currentUser || currentUser.role !== "admin" || currentUser.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden: Admins only." }, { status: 403 });
    }

    const db = readDb();
    
    // Fetch users and firms from Supabase
    const { data: rawUsers } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: rawFirms } = await supabase
      .from('firms')
      .select('*')
      .order('created_at', { ascending: false });

    // Mask passwords for security in dashboard display
    const sanitizedUsers = (rawUsers || []).map((u) => {
      const { password, ...rest } = u;
      return rest;
    });

    return NextResponse.json(
      {
        users: sanitizedUsers,
        firms: rawFirms || db.firms || [],
        articles: db.articles || [],
        events: db.events || []
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin Data API Error:", error);
    return NextResponse.json(
      { error: "Failed to load database records." },
      { status: 500 }
    );
  }
}
