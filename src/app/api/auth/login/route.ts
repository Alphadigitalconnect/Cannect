import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Find user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('password', password) // In a real app, you would use bcrypt to compare hashes!
      .maybeSingle();

    if (error || !user) {
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
