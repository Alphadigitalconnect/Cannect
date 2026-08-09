export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { readDb, writeDb, Connection } from "@/lib/db";

// GET connections & requests for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const db = readDb();
    
    // Find incoming pending, outgoing pending, and accepted connections
    const incoming: any[] = [];
    const outgoing: any[] = [];
    const accepted: any[] = [];

    db.connections.forEach((conn) => {
      if (conn.senderId === userId) {
        // Outgoing request from current user
        const receiver = db.users.find((u) => u.id === conn.receiverId);
        if (receiver) {
          const detail = {
            id: conn.id,
            status: conn.status,
            userId: receiver.id,
            caName: receiver.caName,
            firmName: receiver.firmName,
            city: receiver.city,
            state: receiver.state,
            avatarUrl: receiver.avatarUrl || "",
            email: conn.status === "accepted" ? receiver.email : undefined,
            phone: conn.status === "accepted" ? receiver.phone : undefined,
            timestamp: conn.timestamp
          };
          if (conn.status === "pending") {
            outgoing.push(detail);
          } else if (conn.status === "accepted") {
            accepted.push(detail);
          }
        }
      } else if (conn.receiverId === userId) {
        // Incoming request to current user
        const sender = db.users.find((u) => u.id === conn.senderId);
        if (sender) {
          const detail = {
            id: conn.id,
            status: conn.status,
            userId: sender.id,
            caName: sender.caName,
            firmName: sender.firmName,
            city: sender.city,
            state: sender.state,
            avatarUrl: sender.avatarUrl || "",
            email: conn.status === "accepted" ? sender.email : undefined,
            phone: conn.status === "accepted" ? sender.phone : undefined,
            timestamp: conn.timestamp
          };
          if (conn.status === "pending") {
            incoming.push(detail);
          } else if (conn.status === "accepted") {
            accepted.push(detail);
          }
        }
      }
    });

    return NextResponse.json({ incoming, outgoing, accepted }, { status: 200 });
  } catch (error) {
    console.error("GET Connections Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST: Send connection request or update status
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, senderId, receiverId, connectionId, status } = body;

    const db = readDb();

    // ACTION: Send request
    if (action === "request") {
      if (!senderId || !receiverId) {
        return NextResponse.json({ error: "Sender and Receiver IDs are required." }, { status: 400 });
      }

      if (senderId === receiverId) {
        return NextResponse.json({ error: "You cannot connect with yourself." }, { status: 400 });
      }

      // Check if connection already exists
      const existing = db.connections.find(
        (c) =>
          (c.senderId === senderId && c.receiverId === receiverId) ||
          (c.senderId === receiverId && c.receiverId === senderId)
      );

      if (existing) {
        return NextResponse.json({ error: "Connection request already exists between you." }, { status: 400 });
      }

      const newConnection: Connection = {
        id: "conn_" + Date.now(),
        senderId,
        receiverId,
        status: "pending",
        timestamp: new Date().toISOString()
      };

      db.connections.push(newConnection);
      writeDb(db);

      return NextResponse.json(
        { message: "Connection request sent successfully.", connection: newConnection },
        { status: 201 }
      );
    }

    // ACTION: Respond to request
    if (action === "respond") {
      if (!connectionId || !status) {
        return NextResponse.json({ error: "Connection ID and status are required." }, { status: 400 });
      }

      if (status !== "accepted" && status !== "rejected") {
        return NextResponse.json({ error: "Status must be 'accepted' or 'rejected'." }, { status: 400 });
      }

      const connIndex = db.connections.findIndex((c) => c.id === connectionId);
      if (connIndex === -1) {
        return NextResponse.json({ error: "Connection request not found." }, { status: 404 });
      }

      db.connections[connIndex].status = status;
      writeDb(db);

      return NextResponse.json(
        { message: `Request successfully ${status}.`, connection: db.connections[connIndex] },
        { status: 200 }
      );
    }

    // ACTION: Disconnect / delete connection
    if (action === "disconnect") {
      const { userId, peerUserId } = body;
      if (!userId || !peerUserId) {
        return NextResponse.json({ error: "User IDs are required." }, { status: 400 });
      }

      const connIndex = db.connections.findIndex(
        (c) =>
          (c.senderId === userId && c.receiverId === peerUserId) ||
          (c.senderId === peerUserId && c.receiverId === userId)
      );

      if (connIndex === -1) {
        return NextResponse.json({ error: "Connection not found." }, { status: 404 });
      }

      db.connections.splice(connIndex, 1);
      writeDb(db);

      return NextResponse.json(
        { message: "Connection successfully removed." },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("POST Connections Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
