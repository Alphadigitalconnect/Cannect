import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

// POST to create or update an event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, date, time, mode, location, cpeHours, description, status } = body;

    if (!title || !date || !time || !mode || !location || !cpeHours || !description || !status) {
      return NextResponse.json(
        { error: "Required fields are missing." },
        { status: 400 }
      );
    }

    const db = readDb();

    // Check if updating
    if (id) {
      const idx = db.events.findIndex((e) => e.id === id);
      if (idx === -1) {
        return NextResponse.json(
          { error: "Event to update not found." },
          { status: 404 }
        );
      }
      db.events[idx] = {
        id,
        title,
        date,
        time,
        mode,
        location,
        cpeHours: Number(cpeHours),
        description,
        status
      };
      
      const success = writeDb(db);
      if (!success) return NextResponse.json({ error: "DB write failure" }, { status: 500 });
      return NextResponse.json({ message: "Event details updated successfully.", event: db.events[idx] });
    } else {
      // Create new event
      const newEvent = {
        id: "e_" + Date.now(),
        title,
        date,
        time,
        mode,
        location,
        cpeHours: Number(cpeHours),
        description,
        status
      };

      db.events.push(newEvent);
      const success = writeDb(db);
      if (!success) return NextResponse.json({ error: "DB write failure" }, { status: 500 });
      return NextResponse.json({ message: "Event published successfully.", event: newEvent }, { status: 201 });
    }
  } catch (error) {
    console.error("Admin Events POST error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// DELETE to remove an event
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required for deletion." },
        { status: 400 }
      );
    }

    const db = readDb();
    const initialLength = db.events.length;
    db.events = db.events.filter((e) => e.id !== id);

    if (db.events.length === initialLength) {
      return NextResponse.json(
        { error: "Event to delete not found." },
        { status: 404 }
      );
    }

    const success = writeDb(db);
    if (!success) return NextResponse.json({ error: "DB write failure" }, { status: 500 });
    return NextResponse.json({ message: "Event deleted successfully." });
  } catch (error) {
    console.error("Admin Events DELETE error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
