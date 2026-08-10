import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Check if user exists in Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();
      
    if (userError || !user) {
      // Return 200 even if user doesn't exist to prevent email enumeration
      return NextResponse.json({ message: "If an account exists, a password reset link has been sent." }, { status: 200 });
    }

    // Generate a secure random token
    const token = crypto.randomUUID();
    
    // Set expiry to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Remove any existing tokens for this email to prevent spam
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('email', user.email.toLowerCase());
      
    // Save new token
    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert([
        {
          token,
          email: user.email.toLowerCase(),
          expiresAt: expiresAt.toISOString()
        }
      ]);
      
    if (insertError) {
      console.error("Token insert error:", insertError);
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
