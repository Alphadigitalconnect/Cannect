export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readDb, writeDb, Message } from "@/lib/db";

// GET messages & chat groups for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    let allMessages: any[] = [];
    let groups: any[] = [];

    // 1. Try Supabase first
    try {
      const { data: supaGroups, error: groupError } = await supabase
        .from("chat_groups")
        .select("*")
        .contains("memberIds", [userId]);

      if (!groupError && supaGroups) {
        groups = supaGroups;
      }

      const groupIds = (groups || []).map((g) => g.id);

      const { data: directMsgs, error: dmError } = await supabase
        .from("messages")
        .select("*")
        .or(`senderId.eq.${userId},receiverId.eq.${userId}`)
        .order("timestamp", { ascending: true });

      if (!dmError && directMsgs) {
        allMessages = [...directMsgs];
      }

      if (groupIds.length > 0) {
        const { data: groupMsgs, error: gmError } = await supabase
          .from("messages")
          .select("*")
          .in("receiverId", groupIds)
          .order("timestamp", { ascending: true });

        if (!gmError && groupMsgs) {
          const existingIds = new Set(allMessages.map((m) => m.id));
          groupMsgs.forEach((m) => {
            if (!existingIds.has(m.id)) allMessages.push(m);
          });
        }
      }
    } catch (e) {
      console.warn("Supabase messages query error, falling back to persistent DB:", e);
    }

    // 2. Merge with persistent local DB so history is NEVER lost
    try {
      const db = readDb();
      const localGroups = (db.chatGroups || []).filter((g) => (g.memberIds || []).includes(userId));
      const groupMap = new Map((groups || []).map((g) => [g.id, g]));
      localGroups.forEach((lg) => {
        if (!groupMap.has(lg.id)) {
          groups.push(lg);
          groupMap.set(lg.id, lg);
        }
      });

      const userGroupIds = new Set(groups.map((g) => g.id));
      const localMsgs = (db.messages || []).filter(
        (m) => m.senderId === userId || m.receiverId === userId || userGroupIds.has(m.receiverId)
      );

      const msgMap = new Map(allMessages.map((m) => [m.id, m]));
      localMsgs.forEach((lm) => {
        if (!msgMap.has(lm.id)) {
          allMessages.push(lm);
          msgMap.set(lm.id, lm);
        }
      });
    } catch (e) {
      console.warn("Local DB fallback error:", e);
    }

    // Sort combined list by timestamp
    allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({ messages: allMessages, chatGroups: groups || [] }, { status: 200 });
  } catch (error) {
    console.error("GET Messages Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST a new message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderId, senderName, receiverId, content, imageUrl } = body;
    if (!senderId || !receiverId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const newMessage: Message = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      senderId,
      senderName: senderName || "",
      receiverId,
      content: content || "",
      imageUrl: imageUrl || undefined,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // 1. Save to persistent local database so it is NEVER lost
    try {
      const db = readDb();
      if (!db.messages) db.messages = [];
      db.messages.push(newMessage);
      writeDb(db);
    } catch (dbErr) {
      console.error("Local DB write error:", dbErr);
    }

    // 2. Also try writing to Supabase
    try {
      await supabase.from("messages").insert([newMessage]);
    } catch (supaErr) {
      console.warn("Supabase messages insert error (persisted locally):", supaErr);
    }

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("POST Message Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// PATCH to mark messages as read
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, peerId, isGroup } = body;
    if (!userId || !peerId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. Update local database
    try {
      const db = readDb();
      if (db.messages) {
        db.messages.forEach((m) => {
          if (isGroup && m.receiverId === peerId && m.senderId !== userId) {
            m.isRead = true;
          } else if (!isGroup && m.senderId === peerId && m.receiverId === userId) {
            m.isRead = true;
          }
        });
        writeDb(db);
      }
    } catch (e) {
      console.warn("Local DB update isRead error:", e);
    }

    // 2. Update Supabase
    try {
      if (isGroup) {
        await supabase
          .from("messages")
          .update({ isRead: true })
          .eq("receiverId", peerId)
          .neq("senderId", userId)
          .eq("isRead", false);
      } else {
        await supabase
          .from("messages")
          .update({ isRead: true })
          .eq("senderId", peerId)
          .eq("receiverId", userId)
          .eq("isRead", false);
      }
    } catch (e) {
      // Supabase error non-blocking
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH Messages Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
