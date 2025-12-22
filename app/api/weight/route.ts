import { NextRequest, NextResponse } from "next/server";
import { db, weightEntries } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc, and, gte } from "drizzle-orm";
import { z } from "zod";

const weightSchema = z.object({
  weight: z.number().positive().max(999),
  date: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/weight - Get weight entries for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get days query param (default 30)
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await db
      .select()
      .from(weightEntries)
      .where(
        and(
          eq(weightEntries.userId, user.id),
          gte(weightEntries.date, startDate)
        )
      )
      .orderBy(desc(weightEntries.date));

    // Calculate stats
    const weights = entries.map(e => parseFloat(e.weight));
    const stats = {
      current: weights[0] || null,
      weekAgo: weights.find((_, i) => {
        const entryDate = new Date(entries[i]?.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate <= weekAgo;
      }) || null,
      lowest: weights.length ? Math.min(...weights) : null,
      highest: weights.length ? Math.max(...weights) : null,
      average: weights.length
        ? Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10
        : null,
    };

    return NextResponse.json({ entries, stats });
  } catch (error) {
    console.error("Error fetching weight entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch weight entries" },
      { status: 500 }
    );
  }
}

// POST /api/weight - Log a weight entry
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = weightSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { weight, date, notes } = parsed.data;

    // Use provided date or today
    const entryDate = date ? new Date(date) : new Date();
    // Normalize to start of day in user's timezone (we'll use UTC for now)
    entryDate.setHours(0, 0, 0, 0);

    // Check if entry exists for this date (upsert logic)
    const existing = await db.query.weightEntries.findFirst({
      where: and(
        eq(weightEntries.userId, user.id),
        eq(weightEntries.date, entryDate)
      ),
    });

    let entry;
    if (existing) {
      // Update existing entry
      [entry] = await db
        .update(weightEntries)
        .set({
          weight: weight.toString(),
          notes: notes || null,
        })
        .where(eq(weightEntries.id, existing.id))
        .returning();
    } else {
      // Create new entry
      [entry] = await db
        .insert(weightEntries)
        .values({
          userId: user.id,
          weight: weight.toString(),
          date: entryDate,
          notes: notes || null,
        })
        .returning();
    }

    return NextResponse.json({ entry }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Error logging weight:", error);
    return NextResponse.json(
      { error: "Failed to log weight" },
      { status: 500 }
    );
  }
}
