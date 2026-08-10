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
    const { data: firm, error: firmError } = await supabase
      .from('firms')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();
      
    if (firmError || !firm) {
      return NextResponse.json(
        { error: "Firm profile not found." },
        { status: 404 }
      );
    }
    
    const { data: connections } = await supabase
      .from('connections')
      .select('senderId, receiverId')
      .eq('status', 'accepted')
      .or(`senderId.eq.${firm.userId},receiverId.eq.${firm.userId}`);

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
