export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

const localBlogsFile = path.join(process.cwd(), "data", "blogs.json");

function getLocalBlogs(): any[] {
  try {
    if (fs.existsSync(localBlogsFile)) {
      return JSON.parse(fs.readFileSync(localBlogsFile, "utf8"));
    }
  } catch (e) {
    console.error("Error reading local blogs:", e);
  }
  return [];
}

function saveLocalBlogs(blogs: any[]) {
  try {
    const dir = path.dirname(localBlogsFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localBlogsFile, JSON.stringify(blogs, null, 2), "utf8");
  } catch (e) {
    console.error("Error saving local blogs:", e);
  }
}

// GET blogs - optionally filter by userId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // 1. Try 'blogs' table first
    let query = supabase
      .from("blogs")
      .select("*")
      .order("timestamp", { ascending: false });

    if (userId) {
      query = query.eq("userId", userId);
    }

    const { data: blogs, error } = await query;

    if (!error && blogs && blogs.length > 0) {
      return NextResponse.json({ blogs }, { status: 200 });
    }

    // 2. If 'blogs' table is missing or empty, fetch from 'articles' table
    const { data: articles, error: artError } = await supabase
      .from("articles")
      .select("*")
      .order("date", { ascending: false });

    if (!artError && articles && articles.length > 0) {
      let mappedBlogs = articles.map((art) => {
        let meta: any = {};
        try {
          if (art.excerpt && art.excerpt.startsWith("{")) {
            meta = JSON.parse(art.excerpt);
          }
        } catch (e) {}

        return {
          id: art.id,
          userId: meta.userId || "system",
          authorName: meta.authorName || art.author || "CA Practitioner",
          authorFirmName: meta.authorFirmName || "Independent Practitioner",
          authorAvatarUrl: meta.authorAvatarUrl || "",
          title: art.title,
          content: art.content,
          tags: meta.tags || [art.category || "General"],
          imageUrl: meta.imageUrl || null,
          timestamp: art.date || art.created_at,
        };
      });

      if (userId) {
        mappedBlogs = mappedBlogs.filter((b) => b.userId === userId);
      }

      if (mappedBlogs.length > 0) {
        return NextResponse.json({ blogs: mappedBlogs }, { status: 200 });
      }
    }

    // 3. Fallback to local blogs store
    let local = getLocalBlogs();
    if (userId) {
      local = local.filter((b) => b.userId === userId);
    }

    return NextResponse.json({ blogs: local }, { status: 200 });
  } catch (error) {
    console.error("GET Blogs Error:", error);
    return NextResponse.json({ blogs: getLocalBlogs() }, { status: 200 });
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
    const { data: user } = await supabase
      .from("users")
      .select("caName, firmName, avatarUrl")
      .eq("id", userId)
      .maybeSingle();

    const authorName = user?.caName || "CA Member";
    const authorFirmName = user?.firmName || "Independent Practitioner";
    const authorAvatarUrl = user?.avatarUrl || "";

    const newBlog: Record<string, any> = {
      userId,
      authorName,
      authorFirmName,
      authorAvatarUrl,
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
      imageUrl: imageUrl || null,
      timestamp: new Date().toISOString(),
    };

    let insertedBlog: any = null;

    // 1. Attempt insert into 'blogs' table
    const { data: blogData, error: blogError } = await supabase
      .from("blogs")
      .insert([newBlog])
      .select()
      .single();

    if (!blogError && blogData) {
      insertedBlog = blogData;
    } else {
      // 2. If 'blogs' table is missing or errored, insert into 'articles' table
      const articleRow = {
        title: title.trim(),
        slug: `${userId.slice(0, 8)}-${Date.now()}`,
        category: (tags && tags[0]) || "General",
        date: new Date().toISOString(),
        author: authorName,
        excerpt: JSON.stringify({
          userId,
          authorName,
          authorFirmName,
          authorAvatarUrl,
          tags: tags || [],
          imageUrl: imageUrl || null,
        }),
        content: content.trim(),
      };

      const { data: articleData, error: articleError } = await supabase
        .from("articles")
        .insert([articleRow])
        .select()
        .single();

      if (!articleError && articleData) {
        insertedBlog = {
          id: articleData.id,
          ...newBlog,
        };
      } else {
        console.error("Fallback article insert error:", articleError);
      }
    }

    // 3. Always maintain in local JSON as backup
    const local = getLocalBlogs();
    const finalBlog = insertedBlog || {
      id: "blog_" + Date.now(),
      ...newBlog,
    };
    local.unshift(finalBlog);
    saveLocalBlogs(local);

    return NextResponse.json(
      { message: "Post published successfully.", blog: finalBlog },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Blog Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error." }, { status: 500 });
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

    // Attempt delete from blogs
    await supabase.from("blogs").delete().eq("id", blogId);

    // Attempt delete from articles
    await supabase.from("articles").delete().eq("id", blogId);

    // Remove from local JSON
    const local = getLocalBlogs();
    const filtered = local.filter((b) => b.id !== blogId);
    saveLocalBlogs(filtered);

    return NextResponse.json({ message: "Blog deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("DELETE Blog Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
