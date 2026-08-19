export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET all firms and members (used for the directory)
export async function GET() {
  try {
    // 1. Fetch all members from users table
    const { data: rawUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Filter out users who explicitly marked their profile as private (isPrivate === true)
    const users = (rawUsers || []).filter((u) => u.isPrivate !== true);

    // 2. Fetch any firms records
    const { data: firms } = await supabase.from('firms').select('*');

    // 3. Fetch connections
    const { data: connections } = await supabase
      .from('connections')
      .select('senderId, receiverId')
      .eq('status', 'accepted');

    // 4. Map users into directory peers
    const directoryMembers = users.map((user) => {
      const userFirm = (firms || []).find((f) => f.userId === user.id);
      const connectionCount = (connections || []).filter(
        (c) => c.senderId === user.id || c.receiverId === user.id
      ).length;

      return {
        id: user.id,
        userId: user.id,
        caName: user.caName || "Member",
        membershipNo: user.membershipNo || "",
        firmName: (userFirm?.firmName && userFirm.firmName !== "Individual Member")
          ? userFirm.firmName
          : (user.firmName || "Individual Practice"),
        specialisations: (user.specialisations && user.specialisations.length > 0)
          ? user.specialisations
          : (userFirm?.specialisations || []),
        city: user.city || userFirm?.city || "N/A",
        state: user.state || userFirm?.state || "N/A",
        area: user.area || userFirm?.area || "",
        yearsOfPractice: Number(user.yearsOfPractice || userFirm?.yearsOfPractice || 1),
        phone: user.phone || userFirm?.phone || "",
        email: user.email,
        bio: user.bio || userFirm?.bio || "",
        avatarUrl: user.avatarUrl || userFirm?.avatarUrl || null,
        isPrivate: user.isPrivate === true,
        status: user.status || "approved",
        hasCop: user.hasCop,
        experience: user.experience || userFirm?.experience || [],
        linkedInUrl: user.linkedInUrl || userFirm?.linkedInUrl,
        twitterUrl: user.twitterUrl || userFirm?.twitterUrl,
        websiteUrl: user.websiteUrl || userFirm?.websiteUrl,
        connectionCount,
        created_at: user.created_at
      };
    });

    return NextResponse.json({ firms: directoryMembers }, { status: 200 });
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

    // Update User record in Supabase
    const { data: updatedUser, error: userError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (userError || !updatedUser) {
      console.error("User profile update error:", userError);
      return NextResponse.json(
        { error: userError?.message || "Profile not found or failed to update user." },
        { status: 404 }
      );
    }

    // Also update or insert Firm record if applicable
    try {
      const { data: existingFirm } = await supabase
        .from('firms')
        .select('id')
        .eq('userId', userId)
        .maybeSingle();

      if (existingFirm) {
        await supabase
          .from('firms')
          .update(updatePayload)
          .eq('userId', userId);
      } else if (firmName && firmName !== "Individual Member") {
        await supabase
          .from('firms')
          .insert([
            {
              userId,
              caName: updatedUser.caName,
              membershipNo: updatedUser.membershipNo,
              firmName: updatedUser.firmName,
              specialisations: updatedUser.specialisations || [],
              city: updatedUser.city || "N/A",
              state: updatedUser.state || "N/A",
              yearsOfPractice: updatedUser.yearsOfPractice || 1,
              phone: updatedUser.phone || "",
              email: updatedUser.email,
              bio: updatedUser.bio || "",
              status: updatedUser.status || "approved"
            }
          ]);
      }
    } catch (firmErr) {
      console.warn("Firm sync notice:", firmErr);
    }

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
