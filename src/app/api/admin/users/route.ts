export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ADMIN_EMAIL } from "@/lib/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !currentUser || currentUser.role !== "admin" || currentUser.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    const { data: firms } = await supabase.from('firms').select('*');

    // Return users, hiding passwords
    const allUsers = (users || []).map(u => {
      const { password, ...safeUser } = u;
      return safeUser;
    });

    return NextResponse.json({ users: allUsers, firms: firms || [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { adminId, targetUserId, status } = body;

    if (!adminId || !targetUserId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', adminId)
      .maybeSingle();

    if (adminError || !adminUser || adminUser.role !== "admin" || adminUser.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // Update User
    const { error: updateError } = await supabase
      .from('users')
      .update({ status })
      .eq('id', targetUserId);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update user or user not found" }, { status: 404 });
    }

    // Also update associated Firm if it exists
    await supabase
      .from('firms')
      .update({ status })
      .eq('userId', targetUserId);

    return NextResponse.json({ message: `User status updated to ${status}` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
