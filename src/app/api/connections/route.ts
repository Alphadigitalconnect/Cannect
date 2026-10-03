export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readDb, writeDb, Connection } from "@/lib/db";

// GET connections & requests for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    let connections: any[] = [];

    // 1. Fetch from Supabase
    try {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .or(`senderId.eq.${userId},receiverId.eq.${userId}`);

      if (!error && data) {
        connections = [...data];
      }
    } catch (e) {
      console.warn("Supabase connections fetch warning:", e);
    }

    // 2. Merge with persistent local DB so connections are never lost
    try {
      const db = readDb();
      const localConns = (db.connections || []).filter(
        (c) => c.senderId === userId || c.receiverId === userId
      );

      localConns.forEach((lc) => {
        const idx = connections.findIndex(
          (c) =>
            c.id === lc.id ||
            (c.senderId === lc.senderId && c.receiverId === lc.receiverId) ||
            (c.senderId === lc.receiverId && c.receiverId === lc.senderId)
        );
        if (idx === -1) {
          connections.push(lc);
        } else if (lc.status === "accepted" && connections[idx].status !== "accepted") {
          connections[idx].status = "accepted";
        }
      });

      // Mirror any connections into local db for backup
      let changed = false;
      const allDbConns = [...(db.connections || [])];
      connections.forEach((sc) => {
        const existingIdx = allDbConns.findIndex(
          (c) =>
            c.id === sc.id ||
            (c.senderId === sc.senderId && c.receiverId === sc.receiverId) ||
            (c.senderId === sc.receiverId && c.receiverId === sc.senderId)
        );
        if (existingIdx === -1) {
          allDbConns.push({
            id: sc.id || `conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            senderId: sc.senderId,
            receiverId: sc.receiverId,
            status: sc.status,
            timestamp: sc.timestamp || new Date().toISOString(),
          });
          changed = true;
        } else if (allDbConns[existingIdx].status !== sc.status) {
          allDbConns[existingIdx].status = sc.status;
          changed = true;
        }
      });
      if (changed) {
        writeDb({ ...db, connections: allDbConns });
      }
    } catch (e) {
      console.warn("Local DB connection sync error:", e);
    }

    // 3. Get all unique peer user IDs
    const peerIds = new Set<string>();
    connections.forEach((c) => {
      if (c.senderId !== userId) peerIds.add(c.senderId);
      if (c.receiverId !== userId) peerIds.add(c.receiverId);
    });

    // 4. Fetch peer user profiles with ALL fields (specialisations, yearsOfPractice, bio, etc.)
    let peerProfiles: Record<string, any> = {};
    if (peerIds.size > 0) {
      try {
        const { data: users } = await supabase
          .from("users")
          .select("id, caName, membershipNo, firmName, specialisations, city, state, area, yearsOfPractice, phone, email, bio, avatarUrl, isPrivate, status, hasCop, experience, linkedInUrl, twitterUrl, websiteUrl")
          .in("id", Array.from(peerIds));
        (users || []).forEach((u) => {
          peerProfiles[u.id] = u;
        });
      } catch (e) {
        console.warn("Error fetching peer users from Supabase:", e);
      }

      // Fallback to local DB for any missing profile
      try {
        const db = readDb();
        (db.users || []).forEach((u) => {
          if (peerIds.has(u.id) && !peerProfiles[u.id]) {
            const { password: _p, ...safeUser } = u;
            peerProfiles[u.id] = safeUser;
          }
        });
      } catch (e) {}
    }

    const incoming: any[] = [];
    const outgoing: any[] = [];
    const accepted: any[] = [];

    connections.forEach((conn) => {
      const isSender = conn.senderId === userId;
      const peerId = isSender ? conn.receiverId : conn.senderId;
      const peer = peerProfiles[peerId];
      if (!peer) return;

      const detail = {
        id: conn.id,
        connectionId: conn.id,
        status: conn.status,
        userId: peer.id,
        caName: peer.caName || "Member",
        membershipNo: peer.membershipNo || "",
        firmName: peer.firmName || "Independent Practice",
        specialisations: peer.specialisations || [],
        city: peer.city || "N/A",
        state: peer.state || "N/A",
        area: peer.area || "",
        yearsOfPractice: Number(peer.yearsOfPractice || 1),
        bio: peer.bio || "",
        hasCop: peer.hasCop || false,
        avatarUrl: peer.avatarUrl || "",
        email: conn.status === "accepted" ? peer.email : undefined,
        phone: conn.status === "accepted" ? peer.phone : undefined,
        experience: peer.experience || [],
        linkedInUrl: peer.linkedInUrl,
        twitterUrl: peer.twitterUrl,
        websiteUrl: peer.websiteUrl,
        timestamp: conn.timestamp || new Date().toISOString(),
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

      // Check local DB
      const db = readDb();
      const existingLocal = (db.connections || []).find(
        (c) =>
          (c.senderId === senderId && c.receiverId === receiverId) ||
          (c.senderId === receiverId && c.receiverId === senderId)
      );

      if (existingLocal && existingLocal.status !== "rejected") {
        return NextResponse.json({ error: "Connection request already exists between you." }, { status: 400 });
      }

      // Check Supabase
      try {
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
      } catch (e) {}

      const newId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newConnection: Connection = {
        id: newId,
        senderId,
        receiverId,
        status: "pending",
        timestamp: new Date().toISOString(),
      };

      // 1. Save to Supabase
      let createdConn = newConnection;
      try {
        const { data, error } = await supabase
          .from("connections")
          .insert([{ senderId, receiverId, status: "pending" }])
          .select()
          .maybeSingle();
        if (!error && data) {
          createdConn = data;
        }
      } catch (e) {
        console.warn("Supabase connection insert warning:", e);
      }

      // 2. Save to local DB
      const updatedConns = [...(db.connections || [])];
      const matchIdx = updatedConns.findIndex(
        (c) =>
          (c.senderId === senderId && c.receiverId === receiverId) ||
          (c.senderId === receiverId && c.receiverId === senderId)
      );
      if (matchIdx !== -1) {
        updatedConns[matchIdx] = createdConn;
      } else {
        updatedConns.push(createdConn);
      }
      writeDb({ ...db, connections: updatedConns });

      return NextResponse.json(
        { message: "Connection request sent successfully.", connection: createdConn },
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

      let updatedConn: any = null;

      // 1. Update in Supabase
      try {
        const { data } = await supabase
          .from("connections")
          .update({ status })
          .eq("id", connectionId)
          .select()
          .maybeSingle();
        if (data) updatedConn = data;
      } catch (e) {}

      // 2. Update in local DB
      const db = readDb();
      const updatedConns = (db.connections || []).map((c) => {
        if (c.id === connectionId) {
          return { ...c, status: status as any };
        }
        return c;
      });
      writeDb({ ...db, connections: updatedConns });

      if (!updatedConn) {
        updatedConn = updatedConns.find((c) => c.id === connectionId);
      }

      return NextResponse.json(
        { message: `Request successfully ${status}.`, connection: updatedConn },
        { status: 200 }
      );
    }

    // ACTION: Disconnect / delete connection
    if (action === "disconnect") {
      const { userId, peerUserId } = body;
      if (!userId || !peerUserId) {
        return NextResponse.json({ error: "User IDs are required." }, { status: 400 });
      }

      // 1. Delete from Supabase
      try {
        await supabase
          .from("connections")
          .delete()
          .or(
            `and(senderId.eq.${userId},receiverId.eq.${peerUserId}),and(senderId.eq.${peerUserId},receiverId.eq.${userId})`
          );
      } catch (e) {}

      // 2. Delete from local DB
      const db = readDb();
      const remaining = (db.connections || []).filter(
        (c) =>
          !(
            (c.senderId === userId && c.receiverId === peerUserId) ||
            (c.senderId === peerUserId && c.receiverId === userId)
          )
      );
      writeDb({ ...db, connections: remaining });

      return NextResponse.json({ message: "Connection successfully removed." }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("POST Connections Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
