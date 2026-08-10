export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET all posts (newest first)
export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ posts: posts || [] }, { status: 200 });
  } catch (error) {
    console.error("GET Posts Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST: Create a new post, toggle like, or add comment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, content, imageUrl, postId, commentText, commentId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    // Fetch user info
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("caName, firmName, avatarUrl")
      .eq("id", userId)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // ACTION: Create post
    if (!action || action === "create") {
      if (!content || content.trim() === "") {
        return NextResponse.json({ error: "Post content cannot be empty." }, { status: 400 });
      }

      const newPost = {
        id: "post_" + Date.now(),
        userId,
        caName: user.caName,
        firmName: user.firmName || "Independent Practitioner",
        avatarUrl: user.avatarUrl || "",
        content,
        imageUrl: imageUrl || null,
        likes: [],
        comments: [],
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await supabase.from("posts").insert([newPost]).select().single();
      if (error) throw error;

      return NextResponse.json({ message: "Post created successfully.", post: data }, { status: 201 });
    }

    // ACTION: Like/Unlike post
    if (action === "like") {
      if (!postId) return NextResponse.json({ error: "Post ID is required." }, { status: 400 });

      const { data: post, error: fetchError } = await supabase
        .from("posts")
        .select("likes")
        .eq("id", postId)
        .maybeSingle();

      if (fetchError || !post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

      const likes: string[] = post.likes || [];
      const likeIndex = likes.indexOf(userId);
      if (likeIndex > -1) likes.splice(likeIndex, 1);
      else likes.push(userId);

      const { data: updated, error: updateError } = await supabase
        .from("posts")
        .update({ likes })
        .eq("id", postId)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({ message: "Like updated.", post: updated }, { status: 200 });
    }

    // ACTION: Comment on post
    if (action === "comment") {
      if (!postId) return NextResponse.json({ error: "Post ID is required." }, { status: 400 });
      if (!commentText || commentText.trim() === "") {
        return NextResponse.json({ error: "Comment text cannot be empty." }, { status: 400 });
      }

      const { data: post, error: fetchError } = await supabase
        .from("posts")
        .select("comments")
        .eq("id", postId)
        .maybeSingle();

      if (fetchError || !post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

      const comments = post.comments || [];
      const newComment = {
        id: "comment_" + Date.now(),
        userId,
        caName: user.caName,
        content: commentText,
        timestamp: new Date().toISOString(),
      };
      comments.push(newComment);

      const { data: updated, error: updateError } = await supabase
        .from("posts")
        .update({ comments })
        .eq("id", postId)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({ message: "Comment added.", post: updated }, { status: 201 });
    }

    // ACTION: Delete post
    if (action === "delete_post") {
      if (!postId) return NextResponse.json({ error: "Post ID is required." }, { status: 400 });

      const { data: post, error: fetchError } = await supabase
        .from("posts")
        .select("userId")
        .eq("id", postId)
        .maybeSingle();

      if (fetchError || !post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
      if (post.userId !== userId) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });

      const { error: deleteError } = await supabase.from("posts").delete().eq("id", postId);
      if (deleteError) throw deleteError;

      return NextResponse.json({ message: "Post deleted successfully." }, { status: 200 });
    }

    // ACTION: Delete comment
    if (action === "delete_comment") {
      if (!postId || !commentId) {
        return NextResponse.json({ error: "Post ID and Comment ID are required." }, { status: 400 });
      }

      const { data: post, error: fetchError } = await supabase
        .from("posts")
        .select("userId, comments")
        .eq("id", postId)
        .maybeSingle();

      if (fetchError || !post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

      const comments = post.comments || [];
      const commentIndex = comments.findIndex((c: any) => c.id === commentId);
      if (commentIndex === -1) return NextResponse.json({ error: "Comment not found." }, { status: 404 });

      const comment = comments[commentIndex];
      if (comment.userId !== userId && post.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
      }

      comments.splice(commentIndex, 1);

      const { data: updated, error: updateError } = await supabase
        .from("posts")
        .update({ comments })
        .eq("id", postId)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({ message: "Comment deleted.", post: updated }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("POST Posts API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
