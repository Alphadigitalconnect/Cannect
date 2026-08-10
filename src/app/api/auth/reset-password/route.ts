import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    // Find the token in Supabase
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (tokenError || !resetToken) {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
    }

    // Check if token has expired
    if (new Date(resetToken.expiresAt) < new Date()) {
      // Remove expired token
      await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('id', resetToken.id);
        
      return NextResponse.json({ error: "Token has expired. Please request a new one." }, { status: 400 });
    }

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: newPassword }) // In a real app, hash this!
      .eq('email', resetToken.email.toLowerCase());

    if (updateError) {
      console.error("Password update error:", updateError);
      return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
    }

    // Remove the used token
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('id', resetToken.id);

    return NextResponse.json({ message: "Password has been successfully reset." }, { status: 200 });

  } catch (error) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
