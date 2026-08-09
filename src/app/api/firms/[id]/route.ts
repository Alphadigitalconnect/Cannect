import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

interface ParamsProps {
  params: {
    id: string;
  };
}

// GET single firm details
export async function GET(request: Request, { params }: ParamsProps) {
  try {
    const db = readDb();
    const firm = db.firms.find((f) => f.id === params.id);
    
    if (!firm) {
      return NextResponse.json(
        { error: "Firm profile not found." },
        { status: 404 }
      );
    }
    
    const connectionCount = db.connections.filter(
      (c) =>
        c.status === "accepted" &&
        (c.senderId === firm.userId || c.receiverId === firm.userId)
    ).length;

    const firmWithConnections = {
      ...firm,
      connectionCount,
    };
    
    return NextResponse.json({ firm: firmWithConnections }, { status: 200 });
  } catch (error) {
    console.error("GET Single Firm Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST contact inquiry/request
export async function POST(request: Request, { params }: ParamsProps) {
  try {
    const { senderName, senderEmail, senderPhone, message } = await request.json();
    
    if (!senderName || !senderEmail || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const db = readDb();
    const firm = db.firms.find((f) => f.id === params.id);

    if (!firm) {
      return NextResponse.json(
        { error: "Recipient firm not found." },
        { status: 404 }
      );
    }

    const newRequest = {
      id: "req_" + Date.now(),
      firmId: params.id,
      senderName,
      senderEmail,
      senderPhone: senderPhone || "",
      message,
      timestamp: new Date().toISOString()
    };

    if (!db.contactRequests) {
      db.contactRequests = [];
    }

    db.contactRequests.push(newRequest);

    const success = writeDb(db);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to deliver contact request." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Your message has been delivered to the firm. They will review and contact you." },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST Contact Request Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
