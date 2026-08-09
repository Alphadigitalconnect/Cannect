export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const db = readDb();
    
    // Find the firm belonging to this user
    const firm = db.firms.find((f) => f.userId === userId);
    
    if (!firm) {
      return NextResponse.json({ requests: [] }, { status: 200 });
    }

    // Filter contact requests for this firm
    const requests = db.contactRequests.filter((req) => req.firmId === firm.id);
    
    // Sort by newest first
    requests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error("GET Contact Requests Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
