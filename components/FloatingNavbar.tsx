"use client";

import React, { useState, useEffect } from "react";
import { ThemeToggleSwitch } from "./ThemeToggleSwitch";

export function FloatingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled((prev) => {
        // Hysteresis: morph to pill after 45px scroll, return to banner under 15px
        if (!prev && y > 45) return true;
        if (prev && y < 15) return false;
        return prev;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none select-none
        navbar-morph-container
        ${isScrolled ? "pt-2.5 sm:pt-3.5" : "pt-4 sm:pt-6"}
      `}
    >
      <div
        className={`
          pointer-events-auto w-[calc(100%-2rem)] flex items-center justify-between rounded-full
          navbar-morph-card
          ${
            isScrolled
              ? "max-w-[340px] sm:max-w-[430px] px-4 sm:px-5 py-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
              : "max-w-4xl px-6 sm:px-8 py-3.5 sm:py-4 bg-transparent border border-transparent shadow-none"
          }
        `}
      >
        {/* Navigation Links */}
        <nav className="flex items-center gap-4 sm:gap-6 text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400">
          <a
            href="#intro"
            className="hover:text-neutral-950 dark:hover:text-white transition-colors"
          >
            intro
          </a>
          <a
            href="#workspace"
            className="hover:text-neutral-950 dark:hover:text-white transition-colors"
          >
            workspace
          </a>
        </nav>

        {/* Right: GitHub profile & Theme Toggle Switch */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://github.com/garvittsingla"
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center gap-1.5 rounded-full font-mono text-[11px]
              border border-neutral-200/80 dark:border-neutral-800/80
              text-neutral-600 dark:text-neutral-300
              hover:text-neutral-950 dark:hover:text-white
              hover:border-neutral-400 dark:hover:border-neutral-600
              transition-all duration-300
              ${isScrolled ? "px-2.5 py-1" : "px-3 py-1.5"}
            `}
            aria-label="GitHub Profile"
          >
            <svg
              className="w-3.5 h-3.5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="hidden sm:inline">github</span>
          </a>

          {/* Animated Theme Switch */}
          <ThemeToggleSwitch size={isScrolled ? "sm" : "md"} />
        </div>
      </div>
    </header>
  );
}
