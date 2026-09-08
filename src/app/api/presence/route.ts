export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { readPresence, setUserPresence, getOnlineUserIds } from "@/lib/presence";

export async function GET() {
  try {
    const onlineUserIds = getOnlineUserIds();
    const presence = readPresence();
    return NextResponse.json({ onlineUserIds, presence }, { status: 200 });
  } catch (error) {
    console.error("GET Presence Error:", error);
    return NextResponse.json({ onlineUserIds: [], presence: {} }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, status } = body;
    if (!userId || !status) {
      return NextResponse.json({ error: "userId and status are required." }, { status: 400 });
    }

    if (status !== "online" && status !== "offline") {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    setUserPresence(userId, status);
    const onlineUserIds = getOnlineUserIds();

    return NextResponse.json({ success: true, status, onlineUserIds }, { status: 200 });
  } catch (error) {
    console.error("POST Presence Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
