import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      caName,
      membershipNo,
      firmName,
      specialisations,
      city,
      state,
      yearsOfPractice,
      phone,
      bio,
      hasCop,
      otherQualifications
    } = body;

    // Core field validation
    if (!email || !password || !caName || !membershipNo) {
      return NextResponse.json(
        { error: "Required base fields are missing." },
        { status: 400 }
      );
    }
    
    if (hasCop && (!firmName || !city || !state)) {
      return NextResponse.json(
        { error: "Required firm fields are missing for CoP holders." },
        { status: 400 }
      );
    }

    const db = readDb();
    
    // Check if user already exists
    const emailExists = db.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 409 }
      );
    }

    // Check if membership number already registered
    const membershipExists = db.users.some((u: any) => u.membershipNo === membershipNo);
    if (membershipExists) {
      return NextResponse.json(
        { error: "This ICAI membership number is already registered." },
        { status: 409 }
      );
    }

    const userId = "u_" + Date.now();
    const firmId = "f_" + Date.now();

    const isAdmin = email.toLowerCase() === "admin@cannect.com";
    const status: "approved" | "pending" = isAdmin ? "approved" : "pending";
    const role: "admin" | "user" = isAdmin ? "admin" : "user";

    // Create User record
    const newUser = {
      id: userId,
      email,
      password,
      caName,
      membershipNo,
      firmName: hasCop ? firmName : undefined,
      specialisations: specialisations || [],
      city: hasCop ? city : undefined,
      state: hasCop ? state : undefined,
      yearsOfPractice: Number(yearsOfPractice) || 1,
      phone: phone || "",
      bio: bio || "",
      hasCop: !!hasCop,
      otherQualifications: otherQualifications || "",
      status,
      role
    };

    db.users.push(newUser);

    // Create Firm record only if user has CoP
    if (hasCop) {
      const newFirm = {
        id: firmId,
        userId,
        caName,
        membershipNo,
        firmName,
        specialisations: specialisations || [],
        city,
        state,
        yearsOfPractice: Number(yearsOfPractice) || 1,
        phone: phone || "",
        email,
        bio: bio || "",
        status
      };
      db.firms.push(newFirm);
    }

    const success = writeDb(db);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to persist registration details." },
        { status: 500 }
      );
    }

    // Exclude password from return payload
    const { password: _, ...safeUser } = newUser;

    return NextResponse.json(
      { message: "Registration successful.", user: safeUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
