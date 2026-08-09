import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const db = readDb();
    
    // Find user
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
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
