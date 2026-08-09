import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const db = readDb();

    // Return users that are pending
    const pendingUsers = db.users
      .filter(u => u.status === "pending")
      .map(u => {
        const { password, ...safeUser } = u;
        return safeUser;
      });

    return NextResponse.json({ users: pendingUsers, firms: db.firms }, { status: 200 });
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

    const db = readDb();

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

    return NextResponse.json({ message: `User status successfully updated to ${status}` }, { status: 200 });
  } catch (error) {
    console.error("Admin Approvals POST Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
