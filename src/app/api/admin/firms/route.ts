import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST to toggle verification status of a CA user
export async function POST(request: Request) {
  try {
    const { userId, isVerified } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    const status = isVerified ? 'approved' : 'pending';

    // Update User status in Supabase
    const { error: userError } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId);

    if (userError) {
      return NextResponse.json(
        { error: "User not found or failed to update." },
        { status: 404 }
      );
    }

    // Sync corresponding firm record verification
    await supabase
      .from('firms')
      .update({ status })
      .eq('userId', userId);

    return NextResponse.json(
      { message: `CA status successfully updated to ${isVerified ? "Verified" : "Pending"}.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin Firms API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
