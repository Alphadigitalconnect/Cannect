export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readDb, writeDb } from "@/lib/db";

// GET chat groups for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    let supabaseGroups: any[] = [];
    try {
      const { data: userGroups } = await supabase
        .from("chat_groups")
        .select("*")
        .contains("memberIds", [userId]);
      if (userGroups) supabaseGroups = userGroups;
    } catch (e) {}

    const localDb = readDb();
    const localGroups = (localDb.chatGroups || []).filter((g: any) =>
      g.memberIds?.includes(userId)
    );

    const groupMap = new Map<string, any>();
    supabaseGroups.forEach((g) => groupMap.set(g.id, g));
    localGroups.forEach((g: any) => groupMap.set(g.id, g));

    return NextResponse.json({ chatGroups: Array.from(groupMap.values()) }, { status: 200 });
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

    const groupId = "group_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);

    const newGroup: Record<string, any> = {
      id: groupId,
      name,
      isGroup: true,
      memberIds,
    };

    let savedGroup = { ...newGroup };

    try {
      const { data, error } = await supabase.from("chat_groups").insert([newGroup]).select().single();
      if (!error && data) {
        savedGroup = data;
      }
    } catch (e) {
      console.warn("Supabase chat_groups insert warning:", e);
    }

    try {
      const localDb = readDb();
      if (!localDb.chatGroups) localDb.chatGroups = [];
      localDb.chatGroups.push(savedGroup as any);
      writeDb(localDb);
    } catch (e) {
      console.error("Local db chat group write error:", e);
    }

    return NextResponse.json({ chatGroup: savedGroup }, { status: 201 });
  } catch (error) {
    console.error("POST Chat Group Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
