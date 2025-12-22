import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getAllPRs, getRecentPRs } from "@/lib/mo-self";

// GET /api/records - Get all PRs for the user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const recent = searchParams.get("recent");
    const days = parseInt(searchParams.get("days") || "7");

    if (recent === "true") {
      const records = await getRecentPRs(user.id, days);
      return NextResponse.json({ records, type: "recent", days });
    }

    const records = await getAllPRs(user.id);
    return NextResponse.json({ records, type: "all" });
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}
