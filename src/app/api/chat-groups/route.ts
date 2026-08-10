export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET chat groups for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data: userGroups, error } = await supabase
      .from("chat_groups")
      .select("*")
      .contains("memberIds", [userId]);

    if (error) throw error;

    return NextResponse.json({ chatGroups: userGroups || [] }, { status: 200 });
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

    const newGroup = {
      id: "group_" + Date.now(),
      name,
      isGroup: true,
      memberIds,
    };

    const { data, error } = await supabase.from("chat_groups").insert([newGroup]).select().single();
    if (error) throw error;

    return NextResponse.json({ chatGroup: data }, { status: 201 });
  } catch (error) {
    console.error("POST Chat Group Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
