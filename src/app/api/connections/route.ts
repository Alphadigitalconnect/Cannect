export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET connections & requests for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    // Fetch all connections involving this user
    const { data: connections, error } = await supabase
      .from("connections")
      .select("*")
      .or(`senderId.eq.${userId},receiverId.eq.${userId}`);

    if (error) throw error;

    // Get all unique peer user IDs
    const peerIds = new Set<string>();
    (connections || []).forEach((c) => {
      if (c.senderId !== userId) peerIds.add(c.senderId);
      if (c.receiverId !== userId) peerIds.add(c.receiverId);
    });

    // Fetch peer user profiles in bulk
    let peerProfiles: Record<string, any> = {};
    if (peerIds.size > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, caName, firmName, city, state, avatarUrl, email, phone")
        .in("id", Array.from(peerIds));
      (users || []).forEach((u) => {
        peerProfiles[u.id] = u;
      });
    }

    const incoming: any[] = [];
    const outgoing: any[] = [];
    const accepted: any[] = [];

    (connections || []).forEach((conn) => {
      const isSender = conn.senderId === userId;
      const peerId = isSender ? conn.receiverId : conn.senderId;
      const peer = peerProfiles[peerId];
      if (!peer) return;

      const detail = {
        id: conn.id,
        status: conn.status,
        userId: peer.id,
        caName: peer.caName,
        firmName: peer.firmName,
        city: peer.city,
        state: peer.state,
        avatarUrl: peer.avatarUrl || "",
        email: conn.status === "accepted" ? peer.email : undefined,
        phone: conn.status === "accepted" ? peer.phone : undefined,
        timestamp: conn.timestamp,
      };

      if (conn.status === "accepted") {
        accepted.push(detail);
      } else if (conn.status === "pending") {
        if (isSender) outgoing.push(detail);
        else incoming.push(detail);
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

    // ACTION: Send request
    if (action === "request") {
      if (!senderId || !receiverId) {
        return NextResponse.json({ error: "Sender and Receiver IDs are required." }, { status: 400 });
      }

      if (senderId === receiverId) {
        return NextResponse.json({ error: "You cannot connect with yourself." }, { status: 400 });
      }

      // Check if connection already exists
      const { data: existing } = await supabase
        .from("connections")
        .select("id")
        .or(
          `and(senderId.eq.${senderId},receiverId.eq.${receiverId}),and(senderId.eq.${receiverId},receiverId.eq.${senderId})`
        )
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: "Connection request already exists between you." }, { status: 400 });
      }

      const newConnection = {
        id: "conn_" + Date.now(),
        senderId,
        receiverId,
        status: "pending",
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await supabase.from("connections").insert([newConnection]).select().single();
      if (error) throw error;

      return NextResponse.json(
        { message: "Connection request sent successfully.", connection: data },
        { status: 201 }
      );
    }

    // ACTION: Respond to request (accept/reject)
    if (action === "respond") {
      if (!connectionId || !status) {
        return NextResponse.json({ error: "Connection ID and status are required." }, { status: 400 });
      }

      if (status !== "accepted" && status !== "rejected") {
        return NextResponse.json({ error: "Status must be 'accepted' or 'rejected'." }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("connections")
        .update({ status })
        .eq("id", connectionId)
        .select()
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json({ error: "Connection request not found." }, { status: 404 });
      }

      return NextResponse.json(
        { message: `Request successfully ${status}.`, connection: data },
        { status: 200 }
      );
    }

    // ACTION: Disconnect / delete connection
    if (action === "disconnect") {
      const { userId, peerUserId } = body;
      if (!userId || !peerUserId) {
        return NextResponse.json({ error: "User IDs are required." }, { status: 400 });
      }

      const { error } = await supabase
        .from("connections")
        .delete()
        .or(
          `and(senderId.eq.${userId},receiverId.eq.${peerUserId}),and(senderId.eq.${peerUserId},receiverId.eq.${userId})`
        );

      if (error) throw error;

      return NextResponse.json({ message: "Connection successfully removed." }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("POST Connections Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
