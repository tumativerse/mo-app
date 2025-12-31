"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProfileCompletionStatus } from "@/lib/utils/profile-completion";

interface ProfileCompletionBannerProps {
  status: ProfileCompletionStatus;
}

export function ProfileCompletionBanner({ status }: ProfileCompletionBannerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse after 5 seconds when 100% complete
  useEffect(() => {
    if (status.overallProgress === 100) {
      const timer = setTimeout(() => setIsCollapsed(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [status.overallProgress]);

  const isComplete = status.overallProgress === 100;

  return (
    <AnimatePresence>
      {!isCollapsed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mb-6"
        >
          <div
            className={`p-4 sm:p-6 rounded-xl border-2 ${
              isComplete
                ? "bg-green-500/10 border-green-500/30"
                : status.isMandatoryComplete
                ? "bg-blue-500/10 border-blue-500/30"
                : "bg-orange-500/10 border-orange-500/30"
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isComplete ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle
                    className={`h-6 w-6 ${
                      status.isMandatoryComplete ? "text-blue-500" : "text-orange-500"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-3">
                  <h3
                    className={`text-base sm:text-lg font-semibold ${
                      isComplete
                        ? "text-green-400"
                        : status.isMandatoryComplete
                        ? "text-blue-400"
                        : "text-orange-400"
                    }`}
                  >
                    {isComplete
                      ? "Profile Complete!"
                      : status.isMandatoryComplete
                      ? "Mo Unlocked - Finish Setup for Full Experience"
                      : "Complete Setup to Unlock Mo"}
                  </h3>
                  <span className="text-sm font-medium text-zinc-300 whitespace-nowrap">
                    {status.overallProgress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${status.overallProgress}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-full rounded-full ${
                        isComplete
                          ? "bg-green-500"
                          : status.isMandatoryComplete
                          ? "bg-blue-500"
                          : "bg-orange-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Tab Breakdown */}
                <div className="flex flex-wrap gap-3 sm:gap-4 text-sm mb-3">
                  <div className="flex items-center gap-1.5">
                    {status.profileTabRequired === 4 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-zinc-600" />
                    )}
                    <span className="text-zinc-400">
                      Profile{" "}
                      <span className="text-zinc-300 font-medium">
                        ({status.profileTabComplete}/6)
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {status.trainingTabRequired === 4 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-zinc-600" />
                    )}
                    <span className="text-zinc-400">
                      Training{" "}
                      <span className="text-zinc-300 font-medium">
                        ({status.trainingTabComplete}/7)
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {status.equipmentTabRequired === 1 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-zinc-600" />
                    )}
                    <span className="text-zinc-400">
                      Equipment{" "}
                      <span className="text-zinc-300 font-medium">
                        ({status.equipmentTabComplete}/2)
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 rounded-full border-2 border-zinc-600" />
                    <span className="text-zinc-400">
                      Lifestyle{" "}
                      <span className="text-zinc-300 font-medium">
                        ({status.lifestyleTabComplete}/5)
                      </span>
                    </span>
                  </div>
                </div>

                {/* Missing Fields */}
                {!isComplete && (
                  <div className="text-xs text-zinc-400">
                    {!status.isMandatoryComplete && (
                      <p className="mb-1">
                        <span className="font-medium text-orange-400">Required:</span>{" "}
                        {status.missingMandatoryFields.join(", ")}
                      </p>
                    )}
                    {status.missingOptionalFields.length > 0 && (
                      <p>
                        <span className="font-medium text-blue-400">Optional:</span>{" "}
                        {status.missingOptionalFields.slice(0, 5).join(", ")}
                        {status.missingOptionalFields.length > 5 &&
                          ` +${status.missingOptionalFields.length - 5} more`}
                      </p>
                    )}
                  </div>
                )}

                {isComplete && (
                  <p className="text-sm text-green-400">
                    All set! You're ready to take full advantage of Mo.
                  </p>
                )}
              </div>

              {/* Collapse Button */}
              {isComplete && (
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="flex-shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
