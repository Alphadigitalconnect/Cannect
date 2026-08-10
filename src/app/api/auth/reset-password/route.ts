import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const db = readDb();
    
    // Find the token
    const tokenIndex = db.passwordResetTokens.findIndex(t => t.token === token);
    if (tokenIndex === -1) {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
    }

    const resetToken = db.passwordResetTokens[tokenIndex];

    // Check if token has expired
    if (new Date(resetToken.expiresAt) < new Date()) {
      // Remove expired token
      db.passwordResetTokens.splice(tokenIndex, 1);
      writeDb(db);
      return NextResponse.json({ error: "Token has expired. Please request a new one." }, { status: 400 });
    }

    // Find the user
    const userIndex = db.users.findIndex(u => u.email.toLowerCase() === resetToken.email.toLowerCase());
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Update password
    db.users[userIndex].password = newPassword;

    // Remove the used token
    db.passwordResetTokens.splice(tokenIndex, 1);

    const success = writeDb(db);
    if (!success) {
      return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
    }

    return NextResponse.json({ message: "Password has been successfully reset." }, { status: 200 });

  } catch (error) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
