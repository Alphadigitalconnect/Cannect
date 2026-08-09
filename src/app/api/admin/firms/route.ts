import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

// POST to toggle verification status of a CA user
export async function POST(request: Request) {
  try {
    const { userId, isVerified } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    const db = readDb();
    
    // Find user
    const userIndex = db.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Set custom parameter inside user object to track verification state
    // Let's add an optional property verified: boolean
    const updatedUser = {
      ...db.users[userIndex],
      verified: isVerified
    } as any;
    db.users[userIndex] = updatedUser;

    // Sync corresponding firm record verification
    const firmIndex = db.firms.findIndex((f) => f.userId === userId);
    if (firmIndex !== -1) {
      const updatedFirm = {
        ...db.firms[firmIndex],
        verified: isVerified
      } as any;
      db.firms[firmIndex] = updatedFirm;
    }

    const success = writeDb(db);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to persist database updates." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: `CA status successfully updated to ${isVerified ? "Verified" : "Pending"}.`, user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin Firms API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
