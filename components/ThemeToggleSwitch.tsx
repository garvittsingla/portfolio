"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleSwitchProps {
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

let sharedAudioCtx: AudioContext | null = null;

function playThemeTick(isNextDark: boolean) {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) {
      const audio = new Audio(isNextDark ? "/toggle-tick-down.wav" : "/toggle-tick.wav");
      audio.volume = 0.2;
      audio.play().catch(() => {});
      return;
    }

    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }

    const ctx = sharedAudioCtx;
    const now = ctx.currentTime;

    // Primary gentle tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const startFreq = isNextDark ? 920 : 1240;
    const endFreq = isNextDark ? 280 : 380;

    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.022);

    // Subtle volume (decaying in 24ms)
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.065, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);

    // Micro tactile snap transient (9ms)
    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();

    snap.type = "triangle";
    snap.frequency.setValueAtTime(isNextDark ? 1600 : 2100, now);
    snap.frequency.exponentialRampToValueAtTime(400, now + 0.008);

    snapGain.gain.setValueAtTime(0.0001, now);
    snapGain.gain.linearRampToValueAtTime(0.035, now + 0.001);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

    snap.connect(snapGain);
    snapGain.connect(ctx.destination);

    snap.start(now);
    snap.stop(now + 0.009);
  } catch {
    // Fail silently if browser audio permissions block
  }
}

export function ThemeToggleSwitch({ showLabel = false, size = "md" }: ThemeToggleSwitchProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";

  const handleToggle = () => {
    playThemeTick(!isDark);
    toggleTheme();
  };

  const sizeClasses = {
    sm: {
      track: "h-7 w-12 p-0.5",
      thumb: "h-5.5 w-5.5",
      translateDark: "translate-x-5",
      translateLight: "translate-x-0",
      icon: "w-3 h-3",
      trackIcons: "px-1.5",
    },
    md: {
      track: "h-8 w-15 p-1",
      thumb: "h-6 w-6",
      translateDark: "translate-x-7",
      translateLight: "translate-x-0",
      icon: "w-3.5 h-3.5",
      trackIcons: "px-2",
    },
    lg: {
      track: "h-11 w-20 p-1.5",
      thumb: "h-8 w-8",
      translateDark: "translate-x-9",
      translateLight: "translate-x-0",
      icon: "w-4.5 h-4.5",
      trackIcons: "px-2.5",
    },
  }[size];

  return (
    <div className="flex items-center gap-2 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={handleToggle}
        className={`
          group relative inline-flex shrink-0 cursor-pointer items-center rounded-full
          border transition-all duration-500 ease-out focus:outline-none focus-visible:ring-2
          focus-visible:ring-offset-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500
          ${sizeClasses.track}
          ${
            isDark
              ? "bg-neutral-900/90 border-neutral-700/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
              : "bg-neutral-100/90 border-neutral-300/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]"
          }
          backdrop-blur-xs hover:scale-105 active:scale-95
        `}
      >
        {/* Track background icons (subtle indicators) */}
        <div className={`absolute inset-0 flex items-center justify-between ${sizeClasses.trackIcons} pointer-events-none`}>
          <Sun
            className={`
              ${sizeClasses.icon} text-amber-500 transition-opacity duration-300
              ${isDark ? "opacity-25" : "opacity-0"}
            `}
          />
          <Moon
            className={`
              ${sizeClasses.icon} text-indigo-400 transition-opacity duration-300
              ${isDark ? "opacity-0" : "opacity-35"}
            `}
          />
        </div>

        {/* Sliding Thumb */}
        <span
          className={`
            relative flex items-center justify-center rounded-full shadow-md
            transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            group-active:scale-95
            ${sizeClasses.thumb}
            ${
              isDark
                ? `${sizeClasses.translateDark} bg-neutral-950 text-indigo-300 ring-1 ring-neutral-700 shadow-[0_0_12px_rgba(99,102,241,0.35)]`
                : `${sizeClasses.translateLight} bg-white text-amber-500 ring-1 ring-neutral-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_8px_rgba(245,158,11,0.25)]`
            }
          `}
        >
          {/* Sun icon */}
          <Sun
            className={`
              absolute ${sizeClasses.icon} transition-all duration-500
              ${
                isDark
                  ? "rotate-90 scale-0 opacity-0"
                  : "rotate-0 scale-100 opacity-100"
              }
            `}
          />

          {/* Moon icon */}
          <Moon
            className={`
              absolute ${sizeClasses.icon} transition-all duration-500
              ${
                isDark
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0"
              }
            `}
          />
        </span>
      </button>

      {showLabel && (
        <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400 hidden sm:inline">
          {mounted ? (isDark ? "Dark" : "Light") : "Theme"}
        </span>
      )}
    </div>
  );
}
