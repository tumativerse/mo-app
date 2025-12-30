"use client";

import { useEffect, useState } from "react";

interface ProfileLoadingAnimationProps {
  gender?: "male" | "female" | "non_binary" | "prefer_not_to_say" | null;
  loadingContext?: "profile" | "training" | "equipment" | "lifestyle" | "preferences" | string;
  minDisplayTime?: number; // milliseconds
  className?: string;
}

/**
 * Enhanced gender-aware loading animation with beautiful liquid fill effect
 * Shows an anatomical human body outline that fills with wavy liquid animation
 * Includes particle effects, shimmer, and context-aware loading messages
 */
export function ProfileLoadingAnimation({
  gender = null,
  loadingContext = "profile",
  minDisplayTime = 3500, // 3.5 seconds for smoother experience
  className = "",
}: ProfileLoadingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"fade-in" | "filling" | "complete" | "fade-out">("fade-in");
  const [time, setTime] = useState(0);

  // Context-specific loading messages
  const getLoadingMessage = () => {
    const messages: Record<string, { title: string; subtitle: string }> = {
      profile: {
        title: "Loading your profile...",
        subtitle: "Retrieving personal information",
      },
      training: {
        title: "Loading training preferences...",
        subtitle: "Preparing your workout settings",
      },
      equipment: {
        title: "Loading equipment settings...",
        subtitle: "Checking available gear",
      },
      lifestyle: {
        title: "Loading lifestyle data...",
        subtitle: "Gathering activity patterns",
      },
      preferences: {
        title: "Loading app preferences...",
        subtitle: "Customizing your experience",
      },
    };

    return messages[loadingContext] || {
      title: "Loading...",
      subtitle: "Preparing your data",
    };
  };

  const message = getLoadingMessage();

  // Determine colors based on gender
  const getGradientColors = () => {
    switch (gender) {
      case "male":
        return {
          from: "#60A5FA", // blue-400
          mid: "#3B82F6", // blue-500
          to: "#2563EB", // blue-600
          glow: "#1D4ED8", // blue-700
          particles: "#93C5FD", // blue-300
        };
      case "female":
        return {
          from: "#F9A8D4", // pink-300
          mid: "#F472B6", // pink-400
          to: "#EC4899", // pink-500
          glow: "#DB2777", // pink-600
          particles: "#FBCFE8", // pink-200
        };
      case "non_binary":
      case "prefer_not_to_say":
      default:
        return {
          from: "#86EFAC", // green-300
          mid: "#4ADE80", // green-400
          to: "#22C55E", // green-500
          glow: "#16A34A", // green-600
          particles: "#BBF7D0", // green-200
        };
    }
  };

  const colors = getGradientColors();

  // Animate progress with easing
  useEffect(() => {
    const startTime = Date.now();
    const fadeInDuration = 300; // 300ms fade in
    const fillDuration = minDisplayTime - fadeInDuration - 500; // Reserve time for completion
    const completeDuration = 500; // 500ms completion glow

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      // Phase management
      if (elapsed < fadeInDuration) {
        setPhase("fade-in");
        setProgress(0);
      } else if (elapsed < fadeInDuration + fillDuration) {
        setPhase("filling");
        const fillProgress = (elapsed - fadeInDuration) / fillDuration;
        // Ease-in-out curve for smoother animation
        const eased = fillProgress < 0.5
          ? 2 * fillProgress * fillProgress
          : 1 - Math.pow(-2 * fillProgress + 2, 2) / 2;
        setProgress(eased * 100);
      } else if (elapsed < fadeInDuration + fillDuration + completeDuration) {
        setPhase("complete");
        setProgress(100);
      } else {
        setPhase("fade-out");
        setProgress(100);
      }

      setTime(elapsed / 1000); // Time in seconds for wave animation

      if (phase !== "fade-out") {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [minDisplayTime, phase]);

  // Generate particle positions
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 40,
    delay: Math.random() * 2,
    size: 1 + Math.random() * 2,
  }));

  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 transition-opacity duration-300 ${
        phase === "fade-in" ? "opacity-0" : "opacity-100"
      } ${className}`}
    >
      {/* SVG Human Body Outline */}
      <div className="relative w-40 h-64">
        <svg
          viewBox="0 0 100 160"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Define gradients */}
          <defs>
            {/* Multi-stop gradient for liquid fill */}
            <linearGradient id="fillGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={colors.from}>
                <animate
                  attributeName="stop-color"
                  values={`${colors.from};${colors.mid};${colors.from}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor={colors.mid}>
                <animate
                  attributeName="stop-color"
                  values={`${colors.mid};${colors.to};${colors.mid}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor={colors.to}>
                <animate
                  attributeName="stop-color"
                  values={`${colors.to};${colors.glow};${colors.to}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>

            {/* Shimmer gradient */}
            <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.to} stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="100%" stopColor={colors.to} stopOpacity="0" />
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                from="-1 -1"
                to="1 1"
                dur="3s"
                repeatCount="indefinite"
              />
            </linearGradient>

            {/* Glow effect */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Stronger glow for completion */}
            <filter id="strongGlow">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Clip path for wavy liquid fill */}
            <clipPath id="fillClip">
              {/* Base rectangle that moves up */}
              <rect
                x="0"
                y={160 - (progress / 100) * 160}
                width="100"
                height={(progress / 100) * 160}
              />
              {/* Wavy top edge using sine wave */}
              <path
                d={`
                  M 0,${160 - (progress / 100) * 160 - 3}
                  Q 12.5,${160 - (progress / 100) * 160 - 3 + Math.sin(time * 3) * 2} 25,${160 - (progress / 100) * 160 - 3}
                  T 50,${160 - (progress / 100) * 160 - 3}
                  T 75,${160 - (progress / 100) * 160 - 3}
                  T 100,${160 - (progress / 100) * 160 - 3}
                  L 100,160 L 0,160 Z
                `}
              />
            </clipPath>
          </defs>

          {/* Body outline (unfilled) with subtle breathing animation */}
          <g
            stroke="#A1A1AA"
            strokeWidth="2"
            fill="none"
            opacity={phase === "fade-in" ? 0 : 1}
            style={{
              transition: "opacity 300ms ease-in-out",
            }}
          >
            {gender === "male" ? (
              // Male body outline - broader shoulders, narrower hips
              <>
                {/* Head */}
                <circle cx="50" cy="18" r="12" />
                {/* Neck */}
                <path d="M 50,30 L 50,38" />
                {/* Shoulders */}
                <path d="M 28,42 Q 35,38 50,38 Q 65,38 72,42" />
                {/* Torso */}
                <path d="M 28,42 L 32,75 Q 32,85 35,95" />
                <path d="M 72,42 L 68,75 Q 68,85 65,95" />
                {/* Waist */}
                <path d="M 35,95 Q 50,98 65,95" />
                {/* Left arm */}
                <path d="M 28,42 Q 18,55 16,72" strokeLinecap="round" />
                <path d="M 16,72 L 14,88" strokeLinecap="round" />
                {/* Right arm */}
                <path d="M 72,42 Q 82,55 84,72" strokeLinecap="round" />
                <path d="M 84,72 L 86,88" strokeLinecap="round" />
                {/* Left leg */}
                <path d="M 40,95 L 38,128 L 36,155" strokeLinecap="round" />
                {/* Right leg */}
                <path d="M 60,95 L 62,128 L 64,155" strokeLinecap="round" />
              </>
            ) : gender === "female" ? (
              // Female body outline - narrower shoulders, curved hips
              <>
                {/* Head */}
                <circle cx="50" cy="18" r="12" />
                {/* Neck */}
                <path d="M 50,30 L 50,38" />
                {/* Shoulders */}
                <path d="M 32,42 Q 38,38 50,38 Q 62,38 68,42" />
                {/* Torso with waist curve */}
                <path d="M 32,42 L 34,65 Q 36,75 38,85 Q 40,92 42,95" />
                <path d="M 68,42 L 66,65 Q 64,75 62,85 Q 60,92 58,95" />
                {/* Hips */}
                <path d="M 42,95 Q 38,100 38,108" />
                <path d="M 58,95 Q 62,100 62,108" />
                {/* Left arm */}
                <path d="M 32,42 Q 22,55 20,72" strokeLinecap="round" />
                <path d="M 20,72 L 18,88" strokeLinecap="round" />
                {/* Right arm */}
                <path d="M 68,42 Q 78,55 80,72" strokeLinecap="round" />
                <path d="M 80,72 L 82,88" strokeLinecap="round" />
                {/* Left leg */}
                <path d="M 38,108 L 37,135 L 36,155" strokeLinecap="round" />
                {/* Right leg */}
                <path d="M 62,108 L 63,135 L 64,155" strokeLinecap="round" />
              </>
            ) : (
              // Non-binary / neutral body outline
              <>
                {/* Head */}
                <circle cx="50" cy="18" r="12" />
                {/* Neck */}
                <path d="M 50,30 L 50,38" />
                {/* Shoulders */}
                <path d="M 30,42 Q 37,38 50,38 Q 63,38 70,42" />
                {/* Torso */}
                <path d="M 30,42 L 33,75 Q 35,85 37,95" />
                <path d="M 70,42 L 67,75 Q 65,85 63,95" />
                {/* Waist */}
                <path d="M 37,95 Q 50,97 63,95" />
                {/* Left arm */}
                <path d="M 30,42 Q 20,55 18,72" strokeLinecap="round" />
                <path d="M 18,72 L 16,88" strokeLinecap="round" />
                {/* Right arm */}
                <path d="M 70,42 Q 80,55 82,72" strokeLinecap="round" />
                <path d="M 82,72 L 84,88" strokeLinecap="round" />
                {/* Left leg */}
                <path d="M 42,95 L 39,128 L 37,155" strokeLinecap="round" />
                {/* Right leg */}
                <path d="M 58,95 L 61,128 L 63,155" strokeLinecap="round" />
              </>
            )}
          </g>

          {/* Filled body with liquid animation */}
          <g
            clipPath="url(#fillClip)"
            filter={phase === "complete" ? "url(#strongGlow)" : "url(#glow)"}
            opacity={phase === "fade-in" ? 0 : 1}
            style={{
              transition: "opacity 300ms ease-in-out",
            }}
          >
            {/* Main fill */}
            <rect
              x="0"
              y="0"
              width="100"
              height="160"
              fill="url(#fillGradient)"
            />

            {/* Shimmer overlay */}
            <rect
              x="0"
              y="0"
              width="100"
              height="160"
              fill="url(#shimmer)"
              opacity="0.5"
            />

            {/* Particles rising through the liquid */}
            {particles.map((particle) => (
              <circle
                key={particle.id}
                cx={particle.x}
                cy="0"
                r={particle.size}
                fill={colors.particles}
                opacity="0.6"
              >
                <animate
                  attributeName="cy"
                  from="160"
                  to="-10"
                  dur={`${3 + particle.delay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.6;0.6;0"
                  dur={`${3 + particle.delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        </svg>

        {/* Completion pulse effect */}
        {phase === "complete" && (
          <div className="absolute inset-0 animate-ping opacity-75 rounded-full bg-current"
            style={{ color: colors.glow }}
          />
        )}
      </div>

      {/* Loading text */}
      <div className="text-center space-y-2 max-w-xs">
        <p className="text-base font-semibold text-zinc-100">
          {message.title}
        </p>
        <p className="text-sm text-zinc-400">
          {message.subtitle}
        </p>

        {/* Animated dots */}
        <div className="flex items-center gap-2 justify-center pt-1">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" />
          </div>
        </div>

        {/* Progress percentage */}
        <p className="text-xs font-mono text-zinc-500 pt-1">
          {progress < 100 ? `${Math.round(progress)}%` : "Complete!"}
        </p>
      </div>
    </div>
  );
}
