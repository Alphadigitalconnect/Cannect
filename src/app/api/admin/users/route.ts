export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = readDb();
    const currentUser = db.users.find(u => u.id === userId);

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // Return users, hiding passwords
    const users = db.users.map(u => {
      const { password, ...safeUser } = u;
      return safeUser;
    });

    return NextResponse.json({ users, firms: db.firms }, { status: 200 });
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

    const db = readDb();
    const adminUser = db.users.find(u => u.id === adminId);

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const targetUser = db.users.find(u => u.id === targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Update User
    targetUser.status = status;

    // Also update associated Firm if it exists
    const targetFirm = db.firms.find(f => f.userId === targetUserId);
    if (targetFirm) {
      targetFirm.status = status;
    }

    const success = writeDb(db);
    if (!success) {
      return NextResponse.json({ error: "Failed to persist changes" }, { status: 500 });
    }

    return NextResponse.json({ message: `User status updated to ${status}` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
