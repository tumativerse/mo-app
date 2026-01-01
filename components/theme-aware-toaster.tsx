"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ThemedToaster() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <Toaster theme={theme as 'light' | 'dark'} position="bottom-right" />;
}
