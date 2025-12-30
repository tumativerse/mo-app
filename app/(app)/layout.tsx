import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Dumbbell, Scale, Home, History, Activity, Settings } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950" style={{ contain: 'layout style paint' }}>
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
            <Dumbbell className="h-5 w-5 text-blue-500" />
            <span className="text-zinc-100">Mo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950" style={{ contain: 'layout style paint' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <NavLink href="/dashboard" icon={Home} label="Home" />
            <NavLink href="/workout" icon={Dumbbell} label="Workout" />
            <NavLink href="/weight" icon={Scale} label="Weight" />
            <NavLink href="/progress" icon={Activity} label="Progress" />
            <NavLink href="/history" icon={History} label="History" />
          </div>
        </div>
      </nav>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 text-zinc-300 hover:text-zinc-100"
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs">{label}</span>
    </Link>
  );
}
