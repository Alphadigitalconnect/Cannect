import { NextResponse } from "next/server";
import { readDb, writeDb, PasswordResetToken } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const db = readDb();
    
    // Check if user exists
    const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Return 200 even if user doesn't exist to prevent email enumeration
      return NextResponse.json({ message: "If an account exists, a password reset link has been sent." }, { status: 200 });
    }

    // Generate a secure random token
    const token = crypto.randomUUID();
    
    // Set expiry to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const resetToken: PasswordResetToken = {
      token,
      email: user.email,
      expiresAt: expiresAt.toISOString(),
    };

    // Remove any existing tokens for this email to prevent spam
    db.passwordResetTokens = db.passwordResetTokens.filter(t => t.email.toLowerCase() !== user.email.toLowerCase());
    
    // Save new token
    db.passwordResetTokens.push(resetToken);
    
    const success = writeDb(db);
    if (!success) {
      return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
    }

    // ------------------------------------------------------------------
    // SIMULATED EMAIL SENDING
    // In a real application, you would use a service like SendGrid, 
    // AWS SES, or Nodemailer here. For now, we simulate by logging.
    // ------------------------------------------------------------------
    const resetUrl = `${request.headers.get("origin") || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    console.log("===========================================");
    console.log(`[SIMULATED EMAIL] To: ${user.email}`);
    console.log(`Subject: Reset your CAnnect Password`);
    console.log(`Body: Click the link below to reset your password:`);
    console.log(resetUrl);
    console.log("===========================================");

    return NextResponse.json({ 
      message: "If an account exists, a password reset link has been sent.",
      // Returning the link for easy testing since we have no real email setup
      _simulatedLink: resetUrl 
    }, { status: 200 });

  } catch (error) {
    console.error("Forgot Password API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
