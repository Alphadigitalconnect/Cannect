import { NextResponse } from "next/server";
import { readDb, writeDb, Post, PostComment } from "@/lib/db";

// GET all posts
export async function GET() {
  try {
    const db = readDb();
    // Sort posts chronologically descending
    const posts = [...db.posts].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error("GET Posts Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST: Create a new post, toggle like, or add comment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, content, imageUrl, postId, commentText } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const db = readDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // ACTION: Create post
    if (!action || action === "create") {
      if (!content || content.trim() === "") {
        return NextResponse.json({ error: "Post content cannot be empty." }, { status: 400 });
      }

      const newPost: Post = {
        id: "post_" + Date.now(),
        userId,
        caName: user.caName,
        firmName: user.firmName || "Independent Practitioner",
        avatarUrl: user.avatarUrl || "",
        content,
        imageUrl: imageUrl || undefined,
        likes: [],
        comments: [],
        timestamp: new Date().toISOString(),
      };

      db.posts.push(newPost);
      writeDb(db);
      return NextResponse.json({ message: "Post created successfully.", post: newPost }, { status: 201 });
    }

    // ACTION: Like/Unlike post
    if (action === "like") {
      if (!postId) {
        return NextResponse.json({ error: "Post ID is required to like." }, { status: 400 });
      }

      const postIndex = db.posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) {
        return NextResponse.json({ error: "Post not found." }, { status: 404 });
      }

      const post = db.posts[postIndex];
      const likeIndex = post.likes.indexOf(userId);

      if (likeIndex > -1) {
        // Unlike
        post.likes.splice(likeIndex, 1);
      } else {
        // Like
        post.likes.push(userId);
      }

      db.posts[postIndex] = post;
      writeDb(db);
      return NextResponse.json({ message: "Like updated successfully.", post }, { status: 200 });
    }

    // ACTION: Comment on post
    if (action === "comment") {
      if (!postId) {
        return NextResponse.json({ error: "Post ID is required to comment." }, { status: 400 });
      }
      if (!commentText || commentText.trim() === "") {
        return NextResponse.json({ error: "Comment text cannot be empty." }, { status: 400 });
      }

      const postIndex = db.posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) {
        return NextResponse.json({ error: "Post not found." }, { status: 404 });
      }

      const newComment: PostComment = {
        id: "comment_" + Date.now(),
        userId,
        caName: user.caName,
        content: commentText,
        timestamp: new Date().toISOString(),
      };

      db.posts[postIndex].comments.push(newComment);
      writeDb(db);
      return NextResponse.json({ message: "Comment added successfully.", post: db.posts[postIndex] }, { status: 201 });
    }

    // ACTION: Delete post
    if (action === "delete_post") {
      if (!postId) {
        return NextResponse.json({ error: "Post ID is required to delete." }, { status: 400 });
      }

      const postIndex = db.posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) {
        return NextResponse.json({ error: "Post not found." }, { status: 404 });
      }

      const post = db.posts[postIndex];
      if (post.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized to delete this post." }, { status: 403 });
      }

      db.posts.splice(postIndex, 1);
      writeDb(db);
      return NextResponse.json({ message: "Post deleted successfully." }, { status: 200 });
    }

    // ACTION: Delete comment
    if (action === "delete_comment") {
      const { commentId } = body;
      if (!postId || !commentId) {
        return NextResponse.json({ error: "Post ID and Comment ID are required." }, { status: 400 });
      }

      const postIndex = db.posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) {
        return NextResponse.json({ error: "Post not found." }, { status: 404 });
      }

      const post = db.posts[postIndex];
      const commentIndex = post.comments.findIndex((c) => c.id === commentId);
      if (commentIndex === -1) {
        return NextResponse.json({ error: "Comment not found." }, { status: 404 });
      }

      const comment = post.comments[commentIndex];
      if (comment.userId !== userId && post.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized to delete this comment." }, { status: 403 });
      }

      post.comments.splice(commentIndex, 1);
      db.posts[postIndex] = post;
      writeDb(db);
      return NextResponse.json({ message: "Comment deleted successfully.", post }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("POST Posts API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
