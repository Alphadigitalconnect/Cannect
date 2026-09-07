export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readDb, writeDb } from "@/lib/db";

// GET messages & chat groups for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    let supabaseGroups: any[] = [];
    let supabaseMessages: any[] = [];

    // 1. Fetch from Supabase
    try {
      const { data: groups } = await supabase
        .from("chat_groups")
        .select("*")
        .contains("memberIds", [userId]);
      if (groups) supabaseGroups = groups;

      const groupIds = (groups || []).map((g) => g.id);

      const { data: directMsgs } = await supabase
        .from("messages")
        .select("*")
        .or(`senderId.eq.${userId},receiverId.eq.${userId}`)
        .order("timestamp", { ascending: true });
      if (directMsgs) supabaseMessages.push(...directMsgs);

      if (groupIds.length > 0) {
        const { data: groupMsgs } = await supabase
          .from("messages")
          .select("*")
          .in("receiverId", groupIds)
          .order("timestamp", { ascending: true });
        if (groupMsgs) supabaseMessages.push(...groupMsgs);
      }
    } catch (sbErr) {
      console.warn("Supabase messages fetch warning:", sbErr);
    }

    // 2. Fetch from local db.json
    const localDb = readDb();
    const localMessages = (localDb.messages || []).filter(
      (m: any) =>
        m.senderId === userId ||
        m.receiverId === userId ||
        (localDb.chatGroups || []).some((g: any) => g.id === m.receiverId && g.memberIds?.includes(userId))
    );

    const localGroups = (localDb.chatGroups || []).filter((g: any) =>
      g.memberIds?.includes(userId)
    );

    // 3. Merge & Deduplicate
    const messageMap = new Map<string, any>();
    supabaseMessages.forEach((m) => messageMap.set(m.id, m));
    localMessages.forEach((m: any) => messageMap.set(m.id, m));

    const groupMap = new Map<string, any>();
    supabaseGroups.forEach((g) => groupMap.set(g.id, g));
    localGroups.forEach((g: any) => groupMap.set(g.id, g));

    const allMessages = Array.from(messageMap.values());
    allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json(
      { messages: allMessages, chatGroups: Array.from(groupMap.values()) },
      { status: 200 }
    );
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

    let messageId: string;
    try {
      messageId = crypto.randomUUID();
    } catch {
      messageId = "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    }

    const newMessage: Record<string, any> = {
      id: messageId,
      senderId,
      senderName: senderName || "",
      receiverId,
      content: content || "",
      imageUrl: imageUrl || null,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    let savedMessage = { ...newMessage };

    // 1. Try Supabase insert
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([newMessage])
        .select()
        .single();
      if (!error && data) {
        savedMessage = data;
      }
    } catch (sbErr) {
      console.warn("Supabase messages insert skipped/failed:", sbErr);
    }

    // 2. Always persist into local db.json
    try {
      const localDb = readDb();
      if (!localDb.messages) localDb.messages = [];
      localDb.messages.push(savedMessage as any);
      writeDb(localDb);
    } catch (dbErr) {
      console.error("Local db message write error:", dbErr);
    }

    return NextResponse.json({ message: savedMessage }, { status: 201 });
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

    // Update in Supabase
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
    } catch (e) {}

    // Update in local db.json
    try {
      const localDb = readDb();
      if (localDb.messages) {
        localDb.messages.forEach((m: any) => {
          if (isGroup) {
            if (m.receiverId === peerId && m.senderId !== userId) m.isRead = true;
          } else {
            if (m.senderId === peerId && m.receiverId === userId) m.isRead = true;
          }
        });
        writeDb(localDb);
      }
    } catch (e) {}

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH Messages Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
