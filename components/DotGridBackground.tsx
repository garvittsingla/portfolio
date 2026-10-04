"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";
import {
  NOTEBOOK_HORIZONTAL_LINES,
  NOTEBOOK_PATTERN_WIDTH,
  NOTEBOOK_PATTERN_HEIGHT,
} from "./linedPaperPaths";

interface DotGridBackgroundProps {
  /**
   * If true, renders horizontal notebook lines in dark mode (white lines)
   * instead of the default dot grid. Used specifically in the blog section.
   */
  linesInDark?: boolean;
}

export function DotGridBackground({
  linesInDark = false,
}: DotGridBackgroundProps = {}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const paperBg = isDark ? "#090a0f" : "#fdfbf7";

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-500 ease-out"
      style={{
        backgroundColor: paperBg,
      }}
      aria-hidden="true"
    >
      {/* 1. Light Mode (All Pages): Hand-Drawn Notebook Lines with 4% transparency */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-out ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            {/* Seamless 1600px x 504px horizontal hand-drawn lines pattern (36px spacing) */}
            <pattern
              id="handdrawn-lined-paper-light"
              width={NOTEBOOK_PATTERN_WIDTH}
              height={NOTEBOOK_PATTERN_HEIGHT}
              patternUnits="userSpaceOnUse"
            >
              {NOTEBOOK_HORIZONTAL_LINES.map((line, idx) => {
                // 4% base transparency with uneven hand-drawn variation
                const currentOpacity = (0.04 * line.opacityMultiplier).toFixed(4);
                const strokeColor = `rgba(90, 130, 218, ${currentOpacity})`;

                return (
                  <path
                    key={idx}
                    d={line.d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={line.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}
            </pattern>
          </defs>

          {/* Lined paper pattern fill */}
          <rect width="100%" height="100%" fill="url(#handdrawn-lined-paper-light)" />
        </svg>
      </div>

      {/* 2. Dark Mode */}
      {linesInDark ? (
        /* Blog Section: Hand-Drawn Notebook Lines in subtle white color */
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-out ${
            isDark ? "opacity-100" : "opacity-0"
          }`}
        >
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="handdrawn-lined-paper-dark"
                width={NOTEBOOK_PATTERN_WIDTH}
                height={NOTEBOOK_PATTERN_HEIGHT}
                patternUnits="userSpaceOnUse"
              >
                {NOTEBOOK_HORIZONTAL_LINES.map((line, idx) => {
                  const currentOpacity = (0.045 * line.opacityMultiplier).toFixed(4);
                  const strokeColor = `rgba(255, 255, 255, ${currentOpacity})`;

                  return (
                    <path
                      key={idx}
                      d={line.d}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={line.strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#handdrawn-lined-paper-dark)" />
          </svg>
        </div>
      ) : (
        /* Portfolio Main Page: Default Dot Grid (20% opacity, 24px spacing, 1.8px dot size) */
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-out ${
            isDark ? "opacity-100" : "opacity-0"
          }`}
        >
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="spiral-dot-pattern"
                width={24}
                height={24}
                patternUnits="userSpaceOnUse"
                patternContentUnits="userSpaceOnUse"
              >
                <circle
                  cx={12}
                  cy={12}
                  r={0.9}
                  fill="rgba(255, 255, 255, 0.20)"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#spiral-dot-pattern)" />
          </svg>
        </div>
      )}

      {/* Authentic Tactile Paper Noise Texture (Light & Dark modes) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          backgroundImage: "url('/paper-noise.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          opacity: isDark ? (linesInDark ? 0.045 : 0.06) : 0.055,
          mixBlendMode: isDark ? "screen" : "multiply",
        }}
        aria-hidden="true"
      />

      {/* Center vignette */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at 50% 35%, transparent 65%, rgba(9,10,15,0.45) 100%)"
            : "radial-gradient(ellipse at 50% 35%, transparent 65%, rgba(253,251,247,0.4) 100%)",
        }}
      />
    </div>
  );
}
