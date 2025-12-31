"use client";

import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface AppLockScreenProps {
  progress: number;
  missingFields: string[];
}

export function AppLockScreen({ progress, missingFields }: AppLockScreenProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950 overflow-hidden"
    >
      <div className="max-w-md w-full max-h-[95vh] overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center"
        >
          {/* Lock Icon */}
          <div className="mb-4 sm:mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
              <div className="relative bg-zinc-800 p-3 sm:p-4 rounded-full">
                <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-green-500" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 mb-2">
            Complete Setup to Unlock Mo
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mb-4 sm:mb-6">
            Finish your profile to start your fitness journey
          </p>

          {/* Progress Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm text-zinc-500">Setup Progress</span>
              <span className="text-xs sm:text-sm font-medium text-zinc-100">{progress}%</span>
            </div>
            <div className="h-2 sm:h-3 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full"
              />
            </div>
          </div>

          {/* Missing Fields */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
              Still Needed
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {missingFields.slice(0, 5).map((field) => (
                <span
                  key={field}
                  className="inline-flex items-center px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-300"
                >
                  {field}
                </span>
              ))}
              {missingFields.length > 5 && (
                <span className="inline-flex items-center px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-400">
                  +{missingFields.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => router.push("/settings")}
            className="w-full px-6 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors flex items-center justify-center gap-2 group touch-manipulation"
          >
            Complete Profile
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Helper Text */}
          <p className="mt-3 sm:mt-4 text-xs text-zinc-500">
            Takes about 2 minutes · Your data is encrypted
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
