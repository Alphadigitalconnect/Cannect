import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Find user in Supabase by email only (never query plain password in database)
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid professional email or password." },
        { status: 401 }
      );
    }

    // Verify password: check if stored password is a bcrypt hash or legacy plaintext
    const isBcryptHash = typeof user.password === "string" && user.password.startsWith("$2");
    let isPasswordValid = false;

    if (isBcryptHash) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plain-text check
      isPasswordValid = user.password === password;
      if (isPasswordValid) {
        // Upgrade legacy plain-text password to bcrypt hash in the background
        const upgradedHash = await bcrypt.hash(password, 10);
        await supabase
          .from('users')
          .update({ password: upgradedHash })
          .eq('id', user.id);
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid professional email or password." },
        { status: 401 }
      );
    }

    // Return user details without password
    const { password: _, ...safeUser } = user;

    return NextResponse.json(
      { message: "Authentication successful.", user: safeUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
