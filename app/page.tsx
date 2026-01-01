import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Dumbbell } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Dumbbell className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Mo</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-md">
          Track your workouts, log your weight, and see your progress over time.
        </p>
        <div className="flex gap-2 sm:gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary hover:opacity-90 active:opacity-90 text-primary-foreground rounded-lg font-medium transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-secondary hover:bg-secondary/80 active:bg-secondary/80 text-secondary-foreground rounded-lg font-medium transition-all"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
