import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface ParamsProps {
  params: {
    id: string;
  };
}

export async function DELETE(request: Request, { params }: ParamsProps) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete User Error:", error);
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
