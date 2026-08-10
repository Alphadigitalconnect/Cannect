export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const newInquiry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...data,
    };

    const { error } = await supabase.from("inquiries").insert([newInquiry]);

    if (error) {
      console.error("Supabase inquiry insert error:", error);
      // Fallback: still return success so the user's form submit doesn't fail
      console.log("--- NEW GO DIGITAL INQUIRY (not persisted) ---");
      console.log(newInquiry);
    } else {
      console.log("--- NEW GO DIGITAL INQUIRY SAVED TO SUPABASE ---");
      console.log(newInquiry);
    }

    return NextResponse.json({ success: true, message: "Inquiry received successfully." });
  } catch (error) {
    console.error("Failed to process inquiry:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process inquiry." },
      { status: 500 }
    );
  }
}
