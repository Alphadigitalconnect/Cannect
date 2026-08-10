import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { data: users, error: usersError } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    const { data: firms, error: firmsError } = await supabase.from('firms').select('*');

    if (usersError || firmsError) {
      throw new Error("Failed to fetch approvals data");
    }

    // Filter out passwords
    const allUsers = (users || []).map(u => {
      const { password, ...safeUser } = u;
      return safeUser;
    });

    return NextResponse.json({ users: allUsers, firms: firms || [] }, { status: 200 });
  } catch (error) {
    console.error("Admin Approvals GET Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetUserId, status } = body;

    if (!targetUserId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Update User
    const { error: userError } = await supabase
      .from('users')
      .update({ status })
      .eq('id', targetUserId);

    if (userError) {
      console.error("User approval update error:", userError);
      return NextResponse.json({ error: "Target user not found or failed to update" }, { status: 404 });
    }

    // Also update associated Firm if it exists
    await supabase
      .from('firms')
      .update({ status })
      .eq('userId', targetUserId);

    return NextResponse.json({ message: `User status successfully updated to ${status}` }, { status: 200 });
  } catch (error) {
    console.error("Admin Approvals POST Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
