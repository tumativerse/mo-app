"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileSetupToastProps {
  progress: number;
  missingCount: number;
  isDismissible?: boolean;
}

export function ProfileSetupToast({
  progress,
  missingCount,
  isDismissible = true,
}: ProfileSetupToastProps) {
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user has dismissed this before
  useEffect(() => {
    const dismissed = localStorage.getItem("profile-setup-toast-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (isDismissible) {
      localStorage.setItem("profile-setup-toast-dismissed", "true");
    }
  };

  const handleClick = () => {
    router.push("/settings");
  };

  if (isDismissed || progress === 100) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="mb-6"
      >
        <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-xl p-4 sm:p-5 overflow-hidden">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-xl" />

          {/* Content */}
          <div className="relative">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Progress Circle */}
              <div className="flex-shrink-0">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-zinc-800"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                      className="text-blue-500 transition-all duration-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-400">{progress}%</span>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-zinc-100 mb-1">
                  Profile {progress}% Complete
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mb-3">
                  Finish setup to take full advantage of Mo{" "}
                  <span className="text-blue-400 font-medium">
                    ({missingCount} {missingCount === 1 ? "field" : "fields"} remaining)
                  </span>
                </p>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleClick}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors group"
                >
                  Complete Profile
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Dismiss Button */}
              {isDismissible && (
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors -mt-1 -mr-1"
                  aria-label="Dismiss"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
