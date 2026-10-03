"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";

export function DotGridBackground() {
  const { theme, dotConfig } = useTheme();

  // Active dot color with dynamic opacity
  const dotColor =
    theme === "dark"
      ? `rgba(255, 255, 255, ${dotConfig.opacity})`
      : `rgba(0, 0, 0, ${dotConfig.opacity})`;

  const dotRadius = dotConfig.size / 2;
  const spacing = dotConfig.spacing;

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-500 ease-out"
      style={{
        backgroundColor: theme === "dark" ? "#09090b" : "#ffffff",
      }}
      aria-hidden="true"
    >
      {/* High-precision SVG Dot Grid Pattern */}
      <svg
        className="w-full h-full opacity-100 transition-opacity duration-300"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="spiral-dot-pattern"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
            x="0"
            y="0"
          >
            <circle
              cx={spacing / 2}
              cy={spacing / 2}
              r={dotRadius}
              fill={dotColor}
              style={{
                transition: "fill 0.4s ease-out, r 0.3s ease-out",
              }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#spiral-dot-pattern)" />
      </svg>

      {/* Subtle edge fade to soften viewport boundaries gracefully */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background:
            theme === "dark"
              ? "radial-gradient(ellipse at 50% 30%, transparent 60%, rgba(9,9,11,0.5) 100%)"
              : "radial-gradient(ellipse at 50% 30%, transparent 65%, rgba(255,255,255,0.6) 100%)",
        }}
      />
    </div>
  );
}
