export const dynamic = "force-dynamic";
﻿import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

// GET messages for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const db = readDb();
    const userGroupIds = db.chatGroups.filter((g) => g.memberIds.includes(userId)).map((g) => g.id);
    const userMessages = db.messages.filter(
      (m) => m.senderId === userId || m.receiverId === userId || userGroupIds.includes(m.receiverId)
    );
    const userGroups = db.chatGroups.filter((g) => g.memberIds.includes(userId));
    return NextResponse.json({ messages: userMessages, chatGroups: userGroups }, { status: 200 });
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
    if (!senderId || !receiverId) return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    const db = readDb();
    const newMessage = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      senderId, senderName, receiverId,
      content: content || "",
      imageUrl: imageUrl || undefined,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    db.messages.push(newMessage);
    writeDb(db);
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
    if (!userId || !peerId) return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    const db = readDb();
    db.messages = db.messages.map((m) => {
      if (isGroup) {
        if (m.receiverId === peerId && m.senderId !== userId && !m.isRead) return { ...m, isRead: true };
      } else {
        if (m.senderId === peerId && m.receiverId === userId && !m.isRead) return { ...m, isRead: true };
      }
      return m;
    });
    writeDb(db);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH Messages Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
