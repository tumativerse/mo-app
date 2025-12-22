import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Dumbbell } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <Dumbbell className="h-12 w-12 text-blue-500" />
          <h1 className="text-4xl font-bold">Mo</h1>
        </div>
        <p className="text-zinc-400 text-lg max-w-md">
          Track your workouts, log your weight, and see your progress over time.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
