import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

// GET request to fetch the entire database for admin use
export async function GET() {
  try {
    const db = readDb();
    
    // We mask the passwords for security in dashboard display
    const sanitizedUsers = db.users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });

    return NextResponse.json(
      {
        users: sanitizedUsers,
        firms: db.firms,
        articles: db.articles,
        events: db.events
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin Data API Error:", error);
    return NextResponse.json(
      { error: "Failed to load database records." },
      { status: 500 }
    );
  }
}
