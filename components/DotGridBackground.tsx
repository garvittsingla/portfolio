"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";
import {
  NOTEBOOK_HORIZONTAL_LINES,
  NOTEBOOK_PATTERN_WIDTH,
  NOTEBOOK_PATTERN_HEIGHT,
} from "./linedPaperPaths";

export function DotGridBackground() {
  const { theme, dotConfig, backgroundStyle } = useTheme();

  // Dynamic opacity based on customizer setting
  // Base subtle line opacity: light mode ~0.35, dark mode ~0.22
  const baseLineOpacity = theme === "dark" ? 0.22 : 0.35;
  const lineOpacity = Math.min(
    0.7,
    Math.max(0.08, (dotConfig.opacity / 0.12) * baseLineOpacity)
  );

  // Active dot color for dot-grid fallback
  const dotColor =
    theme === "dark"
      ? `rgba(255, 255, 255, ${dotConfig.opacity})`
      : `rgba(0, 0, 0, ${dotConfig.opacity})`;

  const paperBg = theme === "dark" ? "#090a0f" : "#fdfbf7";

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-500 ease-out"
      style={{
        backgroundColor: paperBg,
      }}
      aria-hidden="true"
    >
      {backgroundStyle === "dots" ? (
        // Dot Grid Pattern
        <svg
          className="w-full h-full opacity-100 transition-opacity duration-300"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="spiral-dot-pattern"
              width={dotConfig.spacing}
              height={dotConfig.spacing}
              patternUnits="userSpaceOnUse"
              patternContentUnits="userSpaceOnUse"
            >
              <circle
                cx={dotConfig.spacing / 2}
                cy={dotConfig.spacing / 2}
                r={dotConfig.size / 2}
                fill={dotColor}
                style={{
                  transition: "fill 0.4s ease-out, r 0.3s ease-out",
                }}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#spiral-dot-pattern)" />
        </svg>
      ) : (
        // Hand-Drawn Uneven Horizontal Ruled Notebook Lines
        <svg
          className="w-full h-full transition-opacity duration-500"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            {/* Seamless 1600px x 504px horizontal hand-drawn lines pattern (36px spacing) */}
            <pattern
              id="handdrawn-lined-paper"
              width={NOTEBOOK_PATTERN_WIDTH}
              height={NOTEBOOK_PATTERN_HEIGHT}
              patternUnits="userSpaceOnUse"
            >
              {NOTEBOOK_HORIZONTAL_LINES.map((line, idx) => {
                // Uneven opacity: each line has its own unique opacity multiplier
                const currentOpacity = Math.min(
                  0.85,
                  Math.max(0.06, lineOpacity * line.opacityMultiplier)
                );

                // Hand-drawn blue notebook ink in light mode, luminous chalk/gel pen in dark mode
                const strokeColor =
                  theme === "dark"
                    ? `rgba(138, 175, 248, ${currentOpacity.toFixed(3)})`
                    : `rgba(90, 130, 218, ${currentOpacity.toFixed(3)})`;

                return (
                  <path
                    key={idx}
                    d={line.d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={line.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transition: "stroke 0.4s ease-out, stroke-width 0.3s ease-out",
                    }}
                  />
                );
              })}
            </pattern>
          </defs>

          {/* Lined paper pattern fill */}
          <rect width="100%" height="100%" fill="url(#handdrawn-lined-paper)" />
        </svg>
      )}

      {/* Authentic Tactile Paper Noise Texture (Light & Dark modes) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          backgroundImage: "url('/paper-noise.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          opacity: theme === "dark" ? 0.06 : 0.055,
          mixBlendMode: theme === "dark" ? "screen" : "multiply",
        }}
        aria-hidden="true"
      />

      {/* Gentle center vignette keeping text comfortable to read */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background:
            theme === "dark"
              ? "radial-gradient(ellipse at 50% 35%, transparent 60%, rgba(9,10,15,0.45) 100%)"
              : "radial-gradient(ellipse at 50% 35%, transparent 65%, rgba(253,251,247,0.4) 100%)",
        }}
      />
    </div>
  );
}
