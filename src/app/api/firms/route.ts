import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET all firms (used for the directory)
export async function GET() {
  try {
    const { data: firms, error: firmsError } = await supabase.from('firms').select('*');
    if (firmsError) throw firmsError;

    const { data: connections, error: connError } = await supabase
      .from('connections')
      .select('senderId, receiverId')
      .eq('status', 'accepted');
    if (connError) throw connError;

    // Map firms to include count of accepted connections
    const firmsWithConnections = (firms || []).map((firm) => {
      const connectionCount = (connections || []).filter(
        (c) => c.senderId === firm.userId || c.receiverId === firm.userId
      ).length;
      return {
        ...firm,
        connectionCount,
      };
    });
    return NextResponse.json({ firms: firmsWithConnections }, { status: 200 });
  } catch (error) {
    console.error("GET Firms Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// PUT to update user's own firm and user profile
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      caName,
      firmName,
      specialisations,
      city,
      state,
      area,
      yearsOfPractice,
      phone,
      bio,
      avatarUrl,
      isPrivate,
      experience
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication credentials missing." },
        { status: 401 }
      );
    }

    // Prepare update payload (strip undefined)
    const updatePayload: any = {};
    if (caName !== undefined) updatePayload.caName = caName;
    if (firmName !== undefined) updatePayload.firmName = firmName;
    if (specialisations !== undefined) updatePayload.specialisations = specialisations;
    if (city !== undefined) updatePayload.city = city;
    if (state !== undefined) updatePayload.state = state;
    if (area !== undefined) updatePayload.area = area;
    if (yearsOfPractice !== undefined) updatePayload.yearsOfPractice = Number(yearsOfPractice);
    if (phone !== undefined) updatePayload.phone = phone;
    if (bio !== undefined) updatePayload.bio = bio;
    if (avatarUrl !== undefined) updatePayload.avatarUrl = avatarUrl;
    if (isPrivate !== undefined) updatePayload.isPrivate = isPrivate;
    if (experience !== undefined) updatePayload.experience = experience;

    // Update User record
    const { data: updatedUser, error: userError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (userError || !updatedUser) {
      return NextResponse.json(
        { error: "Profile not found or failed to update user." },
        { status: 404 }
      );
    }

    // Update Firm record
    await supabase
      .from('firms')
      .update(updatePayload)
      .eq('userId', userId);

    // Exclude password from return payload
    const { password: _, ...safeUser } = updatedUser;

    return NextResponse.json(
      { message: "Profile updated successfully.", user: safeUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT Firm Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
