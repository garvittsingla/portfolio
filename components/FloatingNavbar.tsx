"use client";

import React, { useState, useEffect } from "react";
import { ThemeToggleSwitch } from "./ThemeToggleSwitch";

export function FloatingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState("--:--");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };

    updateTime();
    const timer = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(timer);
  }, []);

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
          pointer-events-auto w-[calc(100%-1.25rem)] sm:w-[calc(100%-2rem)] flex items-center justify-between rounded-full
          navbar-morph-card
          ${
            isScrolled
              ? "max-w-[340px] sm:max-w-[430px] px-3.5 sm:px-5 py-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
              : "max-w-4xl px-3 sm:px-8 py-3 sm:py-4 bg-transparent border border-transparent shadow-none"
          }
        `}
      >
        {/* Navigation Links */}
        <nav className="flex items-center gap-3.5 sm:gap-6 text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400">
          <a
            href="#intro"
            className="hover:text-neutral-950 dark:hover:text-white transition-colors"
          >
            intro
          </a>
          <a
            href="#activity"
            className="hover:text-neutral-950 dark:hover:text-white transition-colors"
          >
            activity
          </a>
          <a
            href="#leetcode"
            className="hover:text-neutral-950 dark:hover:text-white transition-colors"
          >
            leetcode
          </a>
          <a
            href="#achievements"
            className="hover:text-neutral-950 dark:hover:text-white transition-colors"
          >
            wins
          </a>
        </nav>

        {/* Right: Local time & Theme Toggle Switch */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`flex items-center gap-1.5 rounded-full font-mono text-[10px] sm:text-[11px] text-neutral-600 dark:text-neutral-300 ${isScrolled ? "px-1.5 py-1" : "px-2 py-1.5"}`}
            aria-label={`Current time in India: ${currentTime} IST`}
            title="Current local time · GMT+5:30"
          >
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_9px_rgba(34,197,94,0.9)]" />
            <span>{currentTime} IST</span>
          </div>

          {/* Animated Theme Switch */}
          <ThemeToggleSwitch size={isScrolled ? "sm" : "md"} />
        </div>
      </div>
    </header>
  );
}
