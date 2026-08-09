import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const db = readDb();
    
    // Check for duplicates
    const alreadySubscribed = db.notifyList.some((sub) => sub.email.toLowerCase() === email.toLowerCase());
    
    if (alreadySubscribed) {
      return NextResponse.json(
        { message: "You are already on the early-access list!" },
        { status: 200 }
      );
    }

    // Append subscription
    db.notifyList.push({
      email,
      timestamp: new Date().toISOString()
    });

    const success = writeDb(db);
    
    if (!success) {
      return NextResponse.json(
        { error: "Database write failure." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Successfully registered! We will notify you when early access begins." },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Teaser Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
