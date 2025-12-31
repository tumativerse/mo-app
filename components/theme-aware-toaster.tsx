"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/lib/contexts/theme-context";

export function ThemedToaster() {
  const { theme } = useTheme();

  return <Toaster theme={theme} position="bottom-right" />;
}
