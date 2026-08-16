export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface ParamsProps {
  params: {
    id: string;
  };
}

// GET single firm details
export async function GET(request: Request, { params }: ParamsProps) {
  try {
    // 1. Try to find in firms by id or userId
    let { data: firm } = await supabase
      .from('firms')
      .select('*')
      .or(`id.eq.${params.id},userId.eq.${params.id}`)
      .maybeSingle();

    // 2. If not found in firms, fetch from users table
    if (!firm) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

      if (user) {
        firm = {
          id: user.id,
          userId: user.id,
          caName: user.caName || "Member",
          membershipNo: user.membershipNo || "",
          firmName: user.firmName || "Individual Practice",
          specialisations: user.specialisations || [],
          city: user.city || "N/A",
          state: user.state || "N/A",
          area: user.area || "",
          yearsOfPractice: Number(user.yearsOfPractice || 1),
          phone: user.phone || "",
          email: user.email,
          bio: user.bio || "",
          avatarUrl: user.avatarUrl || null,
          status: user.status || "approved",
          experience: user.experience || []
        };
      }
    }
      
    if (!firm) {
      return NextResponse.json(
        { error: "Member profile not found." },
        { status: 404 }
      );
    }

    const targetUserId = firm.userId || firm.id;
    
    const { data: connections } = await supabase
      .from('connections')
      .select('senderId, receiverId')
      .eq('status', 'accepted')
      .or(`senderId.eq.${targetUserId},receiverId.eq.${targetUserId}`);

    const connectionCount = (connections || []).length;

    const firmWithConnections = {
      ...firm,
      connectionCount,
    };
    
    return NextResponse.json({ firm: firmWithConnections }, { status: 200 });
  } catch (error) {
    console.error("GET Single Firm Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST contact inquiry/request
export async function POST(request: Request, { params }: ParamsProps) {
  try {
    const { senderName, senderEmail, senderPhone, message } = await request.json();
    
    if (!senderName || !senderEmail || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const { data: firm, error: firmError } = await supabase
      .from('firms')
      .select('id')
      .eq('id', params.id)
      .maybeSingle();

    if (firmError || !firm) {
      return NextResponse.json(
        { error: "Recipient firm not found." },
        { status: 404 }
      );
    }

    const { error: insertError } = await supabase
      .from('contact_requests')
      .insert([
        {
          firmId: params.id,
          senderName,
          senderEmail,
          senderPhone: senderPhone || "",
          message
        }
      ]);

    if (insertError) {
      console.error("Contact request insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to deliver contact request." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Your message has been delivered to the firm. They will review and contact you." },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST Contact Request Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
