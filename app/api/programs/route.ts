import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { programs, userPrograms } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

// GET /api/programs - Get all available programs
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allPrograms = await db.query.programs.findMany({
      where: eq(programs.isActive, true),
      with: {
        days: {
          columns: {
            id: true,
            name: true,
            dayNumber: true,
            isRestDay: true,
            workoutType: true,
          },
        },
      },
    });

    // Get user's active program if any
    const activeProgram = await db.query.userPrograms.findFirst({
      where: and(
        eq(userPrograms.userId, user.id),
        eq(userPrograms.status, "active")
      ),
    });

    return NextResponse.json({
      programs: allPrograms,
      activeProgram: activeProgram,
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

// POST /api/programs - Enroll in a program
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { programId } = body;

    if (!programId) {
      return NextResponse.json(
        { error: "Program ID required" },
        { status: 400 }
      );
    }

    // Pause any existing active programs
    await db
      .update(userPrograms)
      .set({ status: "paused" })
      .where(
        and(
          eq(userPrograms.userId, user.id),
          eq(userPrograms.status, "active")
        )
      );

    // Enroll in new program
    const [enrollment] = await db
      .insert(userPrograms)
      .values({
        userId: user.id,
        programId,
        currentDay: 1,
        currentWeek: 1,
        status: "active",
      })
      .returning();

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error("Error enrolling in program:", error);
    return NextResponse.json(
      { error: "Failed to enroll in program" },
      { status: 500 }
    );
  }
}
