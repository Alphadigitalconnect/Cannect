export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ADMIN_EMAIL } from "@/lib/admin";

// Helper: verify admin
async function verifyAdmin(adminId: string) {
  const { data: adminUser, error } = await supabase
    .from("users")
    .select("role, email")
    .eq("id", adminId)
    .maybeSingle();

  if (
    error ||
    !adminUser ||
    adminUser.role !== "admin" ||
    adminUser.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
  ) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { data: users } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: firms } = await supabase.from("firms").select("*");

    // Return users, hiding passwords
    const allUsers = (users || []).map((u) => {
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

    const isAdmin = await verifyAdmin(adminId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // If rejected, permanently delete the user and their associated data
    if (status === "rejected") {
      await supabase.from("connections").delete().or(`senderId.eq.${targetUserId},receiverId.eq.${targetUserId}`);
      await supabase.from("messages").delete().or(`senderId.eq.${targetUserId},receiverId.eq.${targetUserId}`);
      await supabase.from("firms").delete().eq("userId", targetUserId);
      await supabase.from("users").delete().eq("id", targetUserId);

      return NextResponse.json({ message: "User rejected and permanently removed." }, { status: 200 });
    }

    // Otherwise update User status
    const { error: updateError } = await supabase
      .from("users")
      .update({ status })
      .eq("id", targetUserId);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update user or user not found" }, { status: 404 });
    }

    // Also update associated Firm if it exists
    await supabase
      .from("firms")
      .update({ status })
      .eq("userId", targetUserId);

    return NextResponse.json({ message: `User status updated to ${status}` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// DELETE: Permanently delete a member by Admin
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId");
    const targetUserId = searchParams.get("targetUserId");

    if (!adminId || !targetUserId) {
      return NextResponse.json({ error: "Admin ID and Target User ID are required." }, { status: 400 });
    }

    const isAdmin = await verifyAdmin(adminId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // Clean up all related records
    await supabase.from("connections").delete().or(`senderId.eq.${targetUserId},receiverId.eq.${targetUserId}`);
    await supabase.from("messages").delete().or(`senderId.eq.${targetUserId},receiverId.eq.${targetUserId}`);
    await supabase.from("firms").delete().eq("userId", targetUserId);
    const { error: delError } = await supabase.from("users").delete().eq("id", targetUserId);

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Member successfully removed." }, { status: 200 });
  } catch (error) {
    console.error("Admin DELETE user error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
