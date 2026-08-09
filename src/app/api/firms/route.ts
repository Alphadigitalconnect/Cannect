import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

// GET all firms (used for the directory)
export async function GET() {
  try {
    const db = readDb();
    // Map firms to include count of accepted connections
    const firmsWithConnections = db.firms.map((firm) => {
      const connectionCount = db.connections.filter(
        (c) =>
          c.status === "accepted" &&
          (c.senderId === firm.userId || c.receiverId === firm.userId)
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

    const db = readDb();
    
    // Find user and firm
    const userIndex = db.users.findIndex((u) => u.id === userId);
    const firmIndex = db.firms.findIndex((f) => f.userId === userId);

    if (userIndex === -1 || firmIndex === -1) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      );
    }

    // Update User record
    db.users[userIndex] = {
      ...db.users[userIndex],
      caName: caName || db.users[userIndex].caName,
      firmName: firmName || db.users[userIndex].firmName,
      specialisations: specialisations || db.users[userIndex].specialisations,
      city: city || db.users[userIndex].city,
      state: state || db.users[userIndex].state,
      area: area !== undefined ? area : (db.users[userIndex] as any).area,
      yearsOfPractice: yearsOfPractice !== undefined ? Number(yearsOfPractice) : db.users[userIndex].yearsOfPractice,
      phone: phone !== undefined ? phone : db.users[userIndex].phone,
      bio: bio !== undefined ? bio : db.users[userIndex].bio,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : db.users[userIndex].avatarUrl,
      isPrivate: isPrivate !== undefined ? isPrivate : (db.users[userIndex] as any).isPrivate,
      experience: experience !== undefined ? experience : (db.users[userIndex] as any).experience
    };

    // Update Firm record
    db.firms[firmIndex] = {
      ...db.firms[firmIndex],
      caName: caName || db.firms[firmIndex].caName,
      firmName: firmName || db.firms[firmIndex].firmName,
      specialisations: specialisations || db.firms[firmIndex].specialisations,
      city: city || db.firms[firmIndex].city,
      state: state || db.firms[firmIndex].state,
      area: area !== undefined ? area : (db.firms[firmIndex] as any).area,
      yearsOfPractice: yearsOfPractice !== undefined ? Number(yearsOfPractice) : db.firms[firmIndex].yearsOfPractice,
      phone: phone !== undefined ? phone : db.firms[firmIndex].phone,
      bio: bio !== undefined ? bio : db.firms[firmIndex].bio,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : db.firms[firmIndex].avatarUrl,
      isPrivate: isPrivate !== undefined ? isPrivate : (db.firms[firmIndex] as any).isPrivate,
      experience: experience !== undefined ? experience : (db.firms[firmIndex] as any).experience
    };

    const success = writeDb(db);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to save profile changes." },
        { status: 500 }
      );
    }

    // Exclude password from return payload
    const { password: _, ...safeUser } = db.users[userIndex];

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
