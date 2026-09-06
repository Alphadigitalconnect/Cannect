export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET blogs - optionally filter by userId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let query = supabase
      .from("blogs")
      .select("*")
      .order("timestamp", { ascending: false });

    if (userId) {
      query = query.eq("userId", userId);
    }

    const { data: blogs, error } = await query;

    if (error) throw error;

    return NextResponse.json({ blogs: blogs || [] }, { status: 200 });
  } catch (error) {
    console.error("GET Blogs Error:", error);
    return NextResponse.json({ blogs: [], error: "Failed to fetch blogs." }, { status: 200 });
  }
}

// POST: Create a new blog
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, content, tags, imageUrl } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Post title cannot be empty." }, { status: 400 });
    }

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Post content cannot be empty." }, { status: 400 });
    }

    // Fetch user info for author snapshot
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("caName, firmName, avatarUrl")
      .eq("id", userId)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const newBlog = {
      id: "blog_" + Date.now(),
      userId,
      authorName: user.caName,
      authorFirmName: user.firmName || "Independent Practitioner",
      authorAvatarUrl: user.avatarUrl || "",
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
      imageUrl: imageUrl || null,
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("blogs").insert([newBlog]).select().single();
    if (error) throw error;

    return NextResponse.json({ message: "Post published successfully.", blog: data }, { status: 201 });
  } catch (error) {
    console.error("POST Blog Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// DELETE a blog
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get("blogId");
    const userId = searchParams.get("userId");

    if (!blogId || !userId) {
      return NextResponse.json({ error: "Blog ID and User ID are required." }, { status: 400 });
    }

    // Verify ownership
    const { data: blog, error: fetchError } = await supabase
      .from("blogs")
      .select("userId")
      .eq("id", blogId)
      .maybeSingle();

    if (fetchError || !blog) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    if (blog.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized. You can only delete your own blogs." }, { status: 403 });
    }

    const { error: deleteError } = await supabase.from("blogs").delete().eq("id", blogId);
    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Blog deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("DELETE Blog Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
