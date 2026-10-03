export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readDb, writeDb, ChatGroup } from "@/lib/db";

// GET chat groups for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    let userGroups: any[] = [];

    try {
      const { data, error } = await supabase
        .from("chat_groups")
        .select("*")
        .contains("memberIds", [userId]);

      if (!error && data) {
        userGroups = data;
      }
    } catch (e) {
      console.warn("Supabase chat_groups fetch error:", e);
    }

    try {
      const db = readDb();
      const localGroups = (db.chatGroups || []).filter((g) => (g.memberIds || []).includes(userId));
      const gMap = new Map(userGroups.map((g) => [g.id, g]));
      localGroups.forEach((lg) => {
        if (!gMap.has(lg.id)) {
          userGroups.push(lg);
          gMap.set(lg.id, lg);
        }
      });
    } catch (e) {
      console.warn("Local DB chatGroups error:", e);
    }

    return NextResponse.json({ chatGroups: userGroups }, { status: 200 });
  } catch (error) {
    console.error("GET Chat Groups Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST to create a new chat group
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, memberIds } = body;
    if (!name || !memberIds) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const newGroup: ChatGroup = {
      id: "group_" + Date.now(),
      name,
      isGroup: true,
      memberIds,
    };

    try {
      const db = readDb();
      if (!db.chatGroups) db.chatGroups = [];
      db.chatGroups.push(newGroup);
      writeDb(db);
    } catch (e) {
      console.error("Local DB write group error:", e);
    }

    try {
      await supabase.from("chat_groups").insert([newGroup]);
    } catch (e) {
      console.warn("Supabase group insert error (persisted locally):", e);
    }

    return NextResponse.json({ chatGroup: newGroup }, { status: 201 });
  } catch (error) {
    console.error("POST Chat Group Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
