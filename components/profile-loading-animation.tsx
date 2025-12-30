"use client";

import { useEffect, useState } from "react";

interface ProfileLoadingAnimationProps {
  gender?: "male" | "female" | "non_binary" | "prefer_not_to_say" | null;
  minDisplayTime?: number; // milliseconds
  className?: string;
}

/**
 * Gender-aware loading animation for profile/settings pages
 * Shows a human body outline that fills from bottom to top
 * Color changes based on gender
 */
export function ProfileLoadingAnimation({
  gender = null,
  minDisplayTime = 2500, // 2.5 seconds default
  className = "",
}: ProfileLoadingAnimationProps) {
  const [progress, setProgress] = useState(0);

  // Determine color based on gender
  const getGradientColors = () => {
    switch (gender) {
      case "male":
        return {
          from: "#60A5FA", // blue-400
          to: "#3B82F6", // blue-500
          glow: "#2563EB", // blue-600
        };
      case "female":
        return {
          from: "#F9A8D4", // pink-300
          to: "#EC4899", // pink-500
          glow: "#DB2777", // pink-600
        };
      case "non_binary":
      case "prefer_not_to_say":
      default:
        return {
          from: "#86EFAC", // green-300
          to: "#22C55E", // green-500
          glow: "#16A34A", // green-600
        };
    }
  };

  const colors = getGradientColors();

  // Animate progress from 0 to 100 over minDisplayTime
  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + minDisplayTime;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = Math.min((elapsed / minDisplayTime) * 100, 100);

      setProgress(newProgress);

      if (now < endTime) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [minDisplayTime]);

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {/* SVG Human Body Outline */}
      <div className="relative w-32 h-48">
        <svg
          viewBox="0 0 100 150"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Define gradient for fill */}
          <defs>
            <linearGradient id="fillGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>

            {/* Glow effect */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Clip path for fill animation */}
            <clipPath id="fillClip">
              <rect
                x="0"
                y={150 - (progress / 100) * 150}
                width="100"
                height={(progress / 100) * 150}
              />
            </clipPath>
          </defs>

          {/* Body outline (unfilled) */}
          <g stroke="#A1A1AA" strokeWidth="2" fill="none">
            {/* Head */}
            <circle cx="50" cy="15" r="10" />

            {/* Neck */}
            <line x1="50" y1="25" x2="50" y2="35" />

            {/* Torso */}
            <ellipse cx="50" cy="60" rx="18" ry="25" />

            {/* Left arm */}
            <path d="M 32 40 Q 20 50 18 65" />
            <line x1="18" y1="65" x2="15" y2="75" />

            {/* Right arm */}
            <path d="M 68 40 Q 80 50 82 65" />
            <line x1="82" y1="65" x2="85" y2="75" />

            {/* Left leg */}
            <line x1="42" y1="85" x2="38" y2="120" />
            <line x1="38" y1="120" x2="35" y2="145" />

            {/* Right leg */}
            <line x1="58" y1="85" x2="62" y2="120" />
            <line x1="62" y1="120" x2="65" y2="145" />
          </g>

          {/* Filled body (same outline with gradient fill) */}
          <g
            stroke="none"
            fill="url(#fillGradient)"
            clipPath="url(#fillClip)"
            filter="url(#glow)"
          >
            {/* Head */}
            <circle cx="50" cy="15" r="10" />

            {/* Neck */}
            <rect x="48" y="25" width="4" height="10" />

            {/* Torso */}
            <ellipse cx="50" cy="60" rx="18" ry="25" />

            {/* Left arm */}
            <path d="M 32 40 Q 20 50 18 65 L 15 75 L 20 76 L 22 66 Q 34 52 35 41 Z" />

            {/* Right arm */}
            <path d="M 68 40 Q 80 50 82 65 L 85 75 L 80 76 L 78 66 Q 66 52 65 41 Z" />

            {/* Left leg */}
            <path d="M 42 85 L 38 120 L 35 145 L 40 146 L 43 121 L 46 86 Z" />

            {/* Right leg */}
            <path d="M 58 85 L 62 120 L 65 145 L 60 146 L 57 121 L 54 86 Z" />
          </g>
        </svg>
      </div>

      {/* Loading text */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-zinc-100">
          Loading your profile...
        </p>
        <div className="flex items-center gap-2 justify-center">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" />
          </div>
        </div>
        <p className="text-xs text-zinc-400">
          {progress < 100 ? `${Math.round(progress)}%` : "Almost there..."}
        </p>
      </div>
    </div>
  );
}
