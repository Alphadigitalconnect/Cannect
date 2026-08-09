import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

// POST to create or update an article
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, slug, excerpt, category, date, author, content } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required fields." },
        { status: 400 }
      );
    }

    const db = readDb();

    // Check if updating
    if (id) {
      const idx = db.articles.findIndex((a) => a.id === id);
      if (idx === -1) {
        return NextResponse.json(
          { error: "Article to update not found." },
          { status: 404 }
        );
      }
      db.articles[idx] = {
        id,
        title,
        slug,
        excerpt: excerpt || title.substring(0, 100) + "...",
        category: category || "Due Dates",
        date: date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        author: author || "CAnnect Editorial",
        content
      };
      
      const success = writeDb(db);
      if (!success) return NextResponse.json({ error: "DB write failure" }, { status: 500 });
      return NextResponse.json({ message: "Article updated successfully.", article: db.articles[idx] });
    } else {
      // Create new article
      // Verify duplicate slug
      const slugExists = db.articles.some((a) => a.slug === slug);
      if (slugExists) {
        return NextResponse.json(
          { error: "An article with this URL slug already exists." },
          { status: 409 }
        );
      }

      const newArticle = {
        id: "a_" + Date.now(),
        title,
        slug,
        excerpt: excerpt || title.substring(0, 100) + "...",
        category: category || "Due Dates",
        date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        author: author || "CAnnect Editorial",
        content
      };

      db.articles.push(newArticle);
      const success = writeDb(db);
      if (!success) return NextResponse.json({ error: "DB write failure" }, { status: 500 });
      return NextResponse.json({ message: "Article published successfully.", article: newArticle }, { status: 201 });
    }
  } catch (error) {
    console.error("Admin Articles POST error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// DELETE to remove an article
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Article ID is required for deletion." },
        { status: 400 }
      );
    }

    const db = readDb();
    const initialLength = db.articles.length;
    db.articles = db.articles.filter((a) => a.id !== id);

    if (db.articles.length === initialLength) {
      return NextResponse.json(
        { error: "Article to delete not found." },
        { status: 404 }
      );
    }

    const success = writeDb(db);
    if (!success) return NextResponse.json({ error: "DB write failure" }, { status: 500 });
    return NextResponse.json({ message: "Article deleted successfully." });
  } catch (error) {
    console.error("Admin Articles DELETE error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
