import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/mo-self";
import {
  getWarmupTemplate,
  startWarmup,
  updateWarmupProgress,
  completeWarmup,
  skipWarmup,
  getWarmupLog,
} from "@/lib/mo-pulse";
import { db } from "@/lib/db";
import { workoutSessions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// GET /api/warmup?sessionId=xxx or ?dayType=push
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");
    const dayType = searchParams.get("dayType");

    if (sessionId) {
      // Get warmup log for a session
      const log = await getWarmupLog(sessionId);
      return NextResponse.json({ log });
    }

    if (dayType) {
      // Get warmup template for a day type
      const template = await getWarmupTemplate(dayType);
      return NextResponse.json({ template });
    }

    return NextResponse.json(
      { error: "sessionId or dayType required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching warmup:", error);
    return NextResponse.json(
      { error: "Failed to fetch warmup" },
      { status: 500 }
    );
  }
}

const warmupActionSchema = z.object({
  sessionId: z.string().uuid(),
  action: z.enum(["start", "progress", "complete", "skip"]),
  templateId: z.string().uuid().optional(),
  phasesCompleted: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// POST /api/warmup - Warmup actions (start, progress, complete, skip)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = warmupActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, action, templateId, phasesCompleted, notes } = parsed.data;

    // Verify session belongs to user
    const session = await db.query.workoutSessions.findFirst({
      where: and(
        eq(workoutSessions.id, sessionId),
        eq(workoutSessions.userId, user.id)
      ),
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    let log;
    switch (action) {
      case "start":
        log = await startWarmup(sessionId, templateId);
        break;
      case "progress":
        if (phasesCompleted === undefined) {
          return NextResponse.json(
            { error: "phasesCompleted required for progress action" },
            { status: 400 }
          );
        }
        log = await updateWarmupProgress(sessionId, phasesCompleted);
        break;
      case "complete":
        log = await completeWarmup(sessionId, notes);
        break;
      case "skip":
        log = await skipWarmup(sessionId);
        break;
    }

    return NextResponse.json({ log });
  } catch (error) {
    console.error("Error handling warmup action:", error);
    return NextResponse.json(
      { error: "Failed to process warmup action" },
      { status: 500 }
    );
  }
}
