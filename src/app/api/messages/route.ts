export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET messages & chat groups for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    // Get groups this user is a member of
    const { data: groups, error: groupError } = await supabase
      .from("chat_groups")
      .select("*")
      .contains("memberIds", [userId]);

    if (groupError) throw groupError;

    const groupIds = (groups || []).map((g) => g.id);

    // Fetch all relevant messages (direct or group)
    let allMessages: any[] = [];

    // Direct messages
    const { data: directMsgs, error: dmError } = await supabase
      .from("messages")
      .select("*")
      .or(`senderId.eq.${userId},receiverId.eq.${userId}`)
      .order("timestamp", { ascending: true });

    if (dmError) throw dmError;
    allMessages = [...(directMsgs || [])];

    // Group messages
    if (groupIds.length > 0) {
      const { data: groupMsgs, error: gmError } = await supabase
        .from("messages")
        .select("*")
        .in("receiverId", groupIds)
        .order("timestamp", { ascending: true });

      if (gmError) throw gmError;
      // Merge and deduplicate
      const existingIds = new Set(allMessages.map((m) => m.id));
      (groupMsgs || []).forEach((m) => {
        if (!existingIds.has(m.id)) allMessages.push(m);
      });
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

    const newMessage = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      senderId,
      senderName: senderName || "",
      receiverId,
      content: content || "",
      imageUrl: imageUrl || null,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const { data, error } = await supabase.from("messages").insert([newMessage]).select().single();
    if (error) throw error;

    return NextResponse.json({ message: data }, { status: 201 });
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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH Messages Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
