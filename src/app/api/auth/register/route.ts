import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    // Check if user already exists
    const { data: existingUser, error: existError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 409 }
      );
    }

    // Check if membership number already registered
    const { data: existingMem, error: memError } = await supabase
      .from('users')
      .select('id')
      .eq('membershipNo', membershipNo)
      .maybeSingle();

    if (existingMem) {
      return NextResponse.json(
        { error: "This ICAI membership number is already registered." },
        { status: 409 }
      );
    }

    const isAdmin = email.toLowerCase() === "admin@cannect.com";
    const status = isAdmin ? "approved" : "pending";
    const role = isAdmin ? "admin" : "user";

    // Insert User record
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email: email.toLowerCase(),
          password, // In a real app, hash this with bcrypt before saving!
          caName,
          membershipNo,
          firmName: hasCop ? firmName : null,
          specialisations: specialisations || [],
          city: hasCop ? city : '',
          state: hasCop ? state : '',
          yearsOfPractice: Number(yearsOfPractice) || 1,
          phone: phone || "",
          bio: bio || "",
          status,
          role
        }
      ])
      .select()
      .single();

    if (userError || !newUser) {
      console.error("User insert error:", userError);
      return NextResponse.json(
        { error: "Failed to persist user details." },
        { status: 500 }
      );
    }

    // Insert Firm record only if user has CoP
    if (hasCop) {
      const { error: firmError } = await supabase
        .from('firms')
        .insert([
          {
            userId: newUser.id,
            caName,
            membershipNo,
            firmName,
            specialisations: specialisations || [],
            city,
            state,
            yearsOfPractice: Number(yearsOfPractice) || 1,
            phone: phone || "",
            email: email.toLowerCase(),
            bio: bio || "",
            status
          }
        ]);

      if (firmError) {
        console.error("Firm insert error:", firmError);
        // Even if firm fails, user was created, but we should return an error
        return NextResponse.json(
          { error: "User created but failed to persist firm details." },
          { status: 500 }
        );
      }
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
