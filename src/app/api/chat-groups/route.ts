export const dynamic = "force-dynamic";
﻿import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

// GET chat groups for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const db = readDb();
    const userGroups = db.chatGroups.filter((g) => g.memberIds.includes(userId));
    return NextResponse.json({ chatGroups: userGroups }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST to create a new chat group
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, memberIds } = body;
    if (!name || !memberIds) return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    const db = readDb();
    const newGroup = {
      id: "group_" + Date.now(),
      name,
      isGroup: true as const,
      memberIds,
    };
    db.chatGroups.push(newGroup);
    writeDb(db);
    return NextResponse.json({ chatGroup: newGroup }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
