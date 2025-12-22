import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/mo-self";
import { getStreak, getStreakStats } from "@/lib/mo-self";

// GET /api/streaks - Get current streak data
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [streak, stats] = await Promise.all([
      getStreak(user.id),
      getStreakStats(user.id),
    ]);

    return NextResponse.json({
      streak,
      stats,
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak" },
      { status: 500 }
    );
  }
}
