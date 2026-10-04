"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { ArrowUpRight, Award, Trophy } from "lucide-react";

interface Achievement {
  title: string;
  event: string;
  detail: string;
  badge: string;
  image: string;
  href: string;
  icon: typeof Trophy;
  cardTilt: number;
}

const achievements: Achievement[] = [
  {
    title: "Pinnacle Performer Award",
    event: "Avinya 3.0 · ZenithLabs",
    detail:
      "Built Voxel, a collaborative multiplayer browser game with live player sync, chat, and drawing.",
    badge: "podium finish",
    image: "/achievement-avinya.jpg",
    href: "https://www.linkedin.com/posts/garvittsingla_after-a-long-gap-of-no-posting-heres-again-activity-7401679075288776705-LzBV",
    icon: Trophy,
    cardTilt: -0.8,
  },
  {
    title: "2nd Place",
    event: "Tech Abhivyakti 3.0 · Chitkara University · May 2025",
    detail: "Secured second place at the Tech Abhivyakti 3.0 hackathon.",
    badge: "runner-up",
    image: "/achievement-tech-abhivyakti.jpg",
    href: "https://www.linkedin.com/in/garvittsingla",
    icon: Award,
    cardTilt: 0.6,
  },
  {
    title: "3rd Place · Technovision 4.0",
    event: "DICE · Chitkara University · May 2025",
    detail:
      "Placed third at the annual innovation challenge after building and pitching an end-to-end software solution.",
    badge: "third place",
    image: "/achievement-technovision.jpg",
    href: "https://www.linkedin.com/posts/garvittsingla_technovision4-chitkarauniversity-dice-activity-7334695333765005312-eCOf",
    icon: Award,
    cardTilt: -0.5,
  },
];

// Rich, festive 6-color palette for fairy lights
const FAIRY_PALETTE = [
  { bulb: "#f59e0b", glow: "rgba(245, 158, 11, 0.85)", name: "gold" },
  { bulb: "#10b981", glow: "rgba(16, 185, 129, 0.85)", name: "emerald" },
  { bulb: "#f43f5e", glow: "rgba(244, 63, 94, 0.85)", name: "ruby" },
  { bulb: "#0ea5e9", glow: "rgba(14, 165, 233, 0.85)", name: "sky" },
  { bulb: "#a855f7", glow: "rgba(168, 85, 247, 0.85)", name: "violet" },
  { bulb: "#f97316", glow: "rgba(249, 115, 22, 0.85)", name: "coral" },
];

// Evaluate point on a cubic Bézier curve for deep catenary gravity sag
function getCubicPoint(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  const x = Math.round(mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x);
  const y = Math.round(mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y);
  return { x, y };
}

// Realistic wooden clothespin peg
function Clothespin({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none z-30 select-none ${className}`}
    >
      <div className="relative w-3.5 h-6 rounded-[2px] bg-gradient-to-r from-[#d9a066] via-[#ebb988] to-[#b8804c] dark:from-[#8c5e35] dark:via-[#aa7748] dark:to-[#6d4522] border border-[#855627]/60 dark:border-[#4d2f14] shadow-[0_2px_5px_rgba(0,0,0,0.22)] flex flex-col items-center justify-between py-0.5">
        {/* Wood grain split */}
        <div className="w-[1px] h-full bg-[#855627]/25 dark:bg-black/30 absolute left-1.5" />
        {/* Metal spring coil */}
        <div className="w-4 h-1.5 -mx-0.5 my-auto bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-400 dark:from-neutral-600 dark:via-neutral-400 dark:to-neutral-700 rounded-[1px] border border-neutral-500/60 shadow-2xs z-10" />
      </div>
    </div>
  );
}

// Realistic Oval / Teardrop Fairy Light Bulb with socket, filament & specular shine
function OvalFairyLight({
  x,
  y,
  color,
  delay = 0,
  duration = 2.4,
  scale = 1,
}: {
  x: number;
  y: number;
  color: { bulb: string; glow: string; name: string };
  delay?: number;
  duration?: number;
  scale?: number;
}) {
  return (
    <g
      className="fairy-light-bulb"
      style={
        {
          "--glow-color": color.glow,
          animationDelay: `${delay}ms`,
          animationDuration: `${duration}s`,
          transformOrigin: `${x}px ${y + 8 * scale}px`,
        } as React.CSSProperties
      }
    >
      <g transform={`translate(${x}, ${y}) scale(${scale})`}>
        {/* Dark socket cap gripping wire */}
        <rect
          x="-1.6"
          y="-2"
          width="3.2"
          height="3"
          rx="0.5"
          fill="#2b2016"
          className="dark:fill-[#1a130c]"
        />
        {/* Ribbed socket body */}
        <rect
          x="-3"
          y="1"
          width="6"
          height="4.8"
          rx="0.8"
          fill="#3d3023"
          stroke="#261d15"
          strokeWidth="0.5"
          className="dark:fill-[#271e16] dark:stroke-[#140e09]"
        />
        {/* Brass collar ring */}
        <rect x="-2.5" y="4.6" width="5" height="1.2" fill="#c49a45" opacity="0.85" />

        {/* Atmospheric Colored Glow Halo */}
        <ellipse
          cx="0"
          cy="12"
          rx="11"
          ry="14"
          fill={color.bulb}
          opacity="0.36"
          filter="url(#bulb-glow-filter)"
        />

        {/* Vintage Oval / Teardrop Glass Bulb Body */}
        <path
          d="M -2.7 5.8 C -4.8 8.8 -5.8 12.8 0 17.5 C 5.8 12.8 4.8 8.8 2.7 5.8 Z"
          fill={color.bulb}
          stroke={color.glow}
          strokeWidth="0.6"
          style={{ filter: `drop-shadow(0 0 6px ${color.glow})` }}
        />

        {/* Inner Glowing Filament */}
        <path
          d="M -1.2 7.5 Q 0 12 1.2 7.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.85"
          strokeLinecap="round"
          opacity="0.95"
        />
        <circle cx="0" cy="9.8" r="1.1" fill="#ffffff" opacity="0.95" />

        {/* Curved Glass Specular Highlight (creates authentic 3D glass gloss) */}
        <path
          d="M -3 8.5 C -4 10.8 -3.5 13.5 -1.2 15.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Soft secondary rim reflection on right */}
        <path
          d="M 2.8 9 C 3.4 11 3 13 1.6 14.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.45"
          strokeLinecap="round"
          opacity="0.45"
        />
      </g>
    </g>
  );
}

// Shared Card Component matching the notebook paper aesthetic of other components
function AchievementCardItem({ item }: { item: Achievement }) {
  const Icon = item.icon;
  return (
    <div
      className="group relative flex flex-col justify-between h-full overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5
        border border-[#e7e1d0] bg-[#faf7ee]/95
        shadow-[0_10px_28px_rgba(100,70,30,0.06),0_2px_6px_rgba(80,50,15,0.04)]
        dark:border-neutral-800/90 dark:bg-[#12131a]/95 dark:shadow-[0_14px_38px_rgba(0,0,0,0.45)]
        transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(100,70,30,0.12)] dark:hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
    >
      {/* 1. Subtle Paper Dot Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[.16] dark:opacity-[.08]"
        style={{
          backgroundImage: "radial-gradient(#000 0.4px, transparent 0.4px)",
          backgroundSize: "4px 4px",
        }}
      />

      {/* 2. Paper noise overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25 dark:opacity-10 mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundImage: "url('/paper-noise.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "160px 160px",
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Photo frame */}
          <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-200/60 dark:bg-neutral-900/60 shadow-xs mb-3.5">
            <Image
              src={item.image}
              alt={`${item.title} photo`}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover transition-transform duration-500 group-hover:scale-105 filter contrast-[1.03] brightness-[0.98]"
            />
            {/* Photo film grain */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-15 mix-blend-multiply dark:mix-blend-screen"
              style={{
                backgroundImage: "radial-gradient(#000 0.5px, transparent 0.5px)",
                backgroundSize: "3px 3px",
              }}
            />
            {/* Badge Pill in corner */}
            <div className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full border border-neutral-300/80 bg-white/95 px-2 py-0.5 font-mono text-[9px] font-medium tracking-tight text-neutral-800 backdrop-blur-xs shadow-xs dark:border-neutral-700/80 dark:bg-neutral-900/90 dark:text-neutral-200">
              <Icon className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
              <span>{item.badge}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-handwriting text-lg sm:text-[19px] leading-tight text-neutral-800 dark:text-neutral-100 group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors">
            {item.title}
          </h3>

          {/* Event & Date */}
          <p className="mt-1 font-mono text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
            {item.event}
          </p>

          {/* Description */}
          <p className="mt-2.5 text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed">
            {item.detail}
          </p>
        </div>

        {/* Card Footer Divider & Link */}
        <div className="mt-4 pt-3 border-t border-dashed border-neutral-300/70 dark:border-neutral-800/80 flex items-center justify-between gap-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            hackathon
          </span>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-neutral-300/80 bg-white/80 px-2.5 py-1 font-mono text-[10px] text-neutral-700 hover:text-black hover:border-neutral-400 hover:bg-white dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-neutral-300 dark:hover:text-white dark:hover:border-neutral-500 transition-all shadow-2xs group/btn"
            aria-label={`View story for ${item.title}`}
          >
            <span>story</span>
            <ArrowUpRight className="w-3 h-3 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function AchievementsHanging() {
  // Precompute 21 realistic oval fairy lights along the deep gravity U-curve on desktop
  const desktopFullWidthLights = useMemo(() => {
    const tValues = [
      0.04, 0.08, 0.13, 0.17, 0.22, 0.27, 0.31, 0.36, 0.41, 0.45, 0.50, 0.55,
      0.59, 0.64, 0.69, 0.73, 0.78, 0.83, 0.87, 0.92, 0.96,
    ];
    // Deep U-curve pulling down heavily due to gravity
    const p0 = { x: -10, y: 15 };
    const p1 = { x: 320, y: 175 };
    const p2 = { x: 880, y: 175 };
    const p3 = { x: 1210, y: 15 };

    return tValues.map((t, idx) => {
      const pt = getCubicPoint(t, p0, p1, p2, p3);
      const color = FAIRY_PALETTE[idx % FAIRY_PALETTE.length];
      const delay = (idx * 220) % 2400;
      const duration = 1.8 + (idx % 4) * 0.3;
      return {
        ...pt,
        color,
        delay,
        duration,
      };
    });
  }, []);

  // Precompute 10 realistic oval fairy lights along the mobile U-curve
  const mobileFullWidthLights = useMemo(() => {
    const tValues = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];
    const p0 = { x: -5, y: 12 };
    const p1 = { x: 95, y: 88 };
    const p2 = { x: 265, y: 88 };
    const p3 = { x: 365, y: 12 };

    return tValues.map((t, idx) => {
      const pt = getCubicPoint(t, p0, p1, p2, p3);
      const color = FAIRY_PALETTE[idx % FAIRY_PALETTE.length];
      const delay = (idx * 270) % 2200;
      const duration = 1.9 + (idx % 3) * 0.35;
      return {
        ...pt,
        color,
        delay,
        duration,
      };
    });
  }, []);

  return (
    <section
      id="achievements"
      aria-label="Achievements Wall Hanging"
      className="relative w-full overflow-hidden mb-16 mt-16 sm:mt-20 sm:mb-20 scroll-mt-28"
    >
      {/* Centered Section Header */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 mb-3 sm:mb-4 flex items-end justify-between gap-4">
        <div>
          {/*<p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            little milestones · garland
          </p>*/}
          <h2 className="font-handwriting text-2xl text-neutral-800 dark:text-neutral-100 sm:text-3xl">
            wins & hackathons
          </h2>
        </div>
        {/*<span className="hidden -rotate-2 font-handwriting text-xs text-neutral-400 dark:text-neutral-500 sm:inline">
          hanging fairy lights ✨
        </span>*/}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP / TABLET VIEW:
             Deep U-shaped rope pulled down by gravity across the page,
             with realistic oval fairy lights and centered cards below.
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block relative w-full">
        {/* Full-width wall rope taking a deep catenary U shape under gravity */}
        <div className="relative w-full h-36 -mb-10 overflow-visible pointer-events-none">
          <svg
            viewBox="0 0 1200 170"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <filter id="bulb-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Deep gravity rope drop shadow */}
            <path
              d="M -10 18 C 320 178, 880 178, 1210 18"
              fill="none"
              stroke="rgba(0,0,0,0.18)"
              strokeWidth="4"
              className="dark:stroke-black/60"
            />

            {/* Main twisted hemp/jute rope body */}
            <path
              d="M -10 15 C 320 175, 880 175, 1210 15"
              fill="none"
              stroke="#684e34"
              strokeWidth="2.4"
              strokeDasharray="5 2"
              className="dark:stroke-[#9c7d5c]"
            />

            {/* Realistic inner twisted twine highlight strand */}
            <path
              d="M -10 14 C 320 174, 880 174, 1210 14"
              fill="none"
              stroke="#d4ab78"
              strokeWidth="0.9"
              strokeDasharray="3 4"
              opacity="0.75"
              className="dark:stroke-[#cfb18c] dark:opacity-40"
            />

            {/* 21 Realistic Oval / Teardrop Fairy Lights hanging vertically under gravity */}
            {desktopFullWidthLights.map((light, idx) => (
              <OvalFairyLight
                key={idx}
                x={light.x}
                y={light.y}
                color={light.color}
                delay={light.delay}
                duration={light.duration}
                scale={1}
              />
            ))}
          </svg>
        </div>

        {/* Cards hanging below in the center — center card dips lower with the U curve */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-5 sm:gap-6 items-start">
            {achievements.map((item, index) => {
              const isCenter = index === 1;
              // Center card hangs directly below the deep U belly with shorter cord,
              // while side cards hang from the higher rope section with longer cords.
              const cordHeight = isCenter ? "h-7" : "h-14";
              const marginTop = isCenter ? "mt-8 sm:mt-10" : "mt-0";

              return (
                <div
                  key={item.title}
                  className={`relative flex flex-col items-center transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:rotate-0 ${marginTop}`}
                  style={{
                    transform: `rotate(${item.cardTilt}deg)`,
                  }}
                >
                  {/* Vertical drop cord connecting overhead deep U-rope to clothespin */}
                  <div
                    aria-hidden="true"
                    className={`w-full ${cordHeight} flex flex-col items-center justify-end relative pointer-events-none -mb-3 z-30`}
                  >
                    {/* Twisted twine drop cord */}
                    <div className="w-[1.8px] h-full bg-[#684e34] dark:bg-[#9c7d5c] opacity-85" />
                    {/* Wooden Clothespin peg */}
                    <Clothespin className="absolute -bottom-3 left-1/2 -translate-x-1/2" />
                  </div>

                  {/* Card Item */}
                  <div className="w-full">
                    <AchievementCardItem item={item} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE VIEW:
             Deep U-rope across mobile width + vertical chained cards.
          ───────────────────────────────────────────────────────────── */}
      <div className="block md:hidden relative w-full">
        {/* Full-width top U-rope pulling down due to gravity on mobile */}
        <div className="relative w-full h-20 overflow-visible pointer-events-none -mb-4">
          <svg
            viewBox="0 0 360 85"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <filter id="bulb-glow-filter-mob" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Rope soft drop shadow */}
            <path
              d="M -5 14 C 95 90, 265 90, 365 14"
              fill="none"
              stroke="rgba(0,0,0,0.18)"
              strokeWidth="3.5"
              className="dark:stroke-black/60"
            />
            {/* Main twisted rope */}
            <path
              d="M -5 12 C 95 88, 265 88, 365 12"
              fill="none"
              stroke="#684e34"
              strokeWidth="2.2"
              strokeDasharray="4 2"
              className="dark:stroke-[#9c7d5c]"
            />
            {/* Highlight strand */}
            <path
              d="M -5 11 C 95 87, 265 87, 365 11"
              fill="none"
              stroke="#d4ab78"
              strokeWidth="0.8"
              strokeDasharray="2 3"
              opacity="0.75"
              className="dark:stroke-[#cfb18c]"
            />

            {/* Realistic Oval Fairy Lights along the mobile U curve */}
            {mobileFullWidthLights.map((light, idx) => (
              <OvalFairyLight
                key={idx}
                x={light.x}
                y={light.y}
                color={light.color}
                delay={light.delay}
                duration={light.duration}
                scale={0.9}
              />
            ))}
          </svg>
        </div>

        {/* Chained cards hanging below in the center */}
        <div className="relative mx-auto max-w-[340px] px-2 z-10">
          {/* Drop cord from bottom of U-rope to Card 1 */}
          <div
            aria-hidden="true"
            className="w-full h-8 flex flex-col items-center justify-end relative pointer-events-none -mb-3 z-30"
          >
            <div className="w-[1.8px] h-full bg-[#684e34] dark:bg-[#9c7d5c] opacity-85" />
            <Clothespin className="absolute -bottom-3 left-1/2 -translate-x-1/2" />
          </div>

          {/* CARD 1: Pinnacle Performer Award */}
          <div className="relative group transition-transform duration-300">
            <AchievementCardItem item={achievements[0]} />
          </div>

          {/* VERTICAL HANGING CONNECTOR 1: Connecting Card 1 to Card 2 with slack */}
          <div className="relative h-16 w-full flex items-center justify-center my-0.5 pointer-events-none select-none">
            <svg viewBox="0 0 90 64" className="w-24 h-16 overflow-visible" aria-hidden="true">
              {/* Left and right drooping twisted cords with natural gravity slack */}
              <path
                d="M 32 0 C 30 25, 36 40, 42 64"
                fill="none"
                stroke="#684e34"
                strokeWidth="1.8"
                strokeDasharray="3 1"
                className="dark:stroke-[#9c7d5c] opacity-85"
              />
              <path
                d="M 58 0 C 60 25, 54 40, 48 64"
                fill="none"
                stroke="#684e34"
                strokeWidth="1.8"
                strokeDasharray="3 1"
                className="dark:stroke-[#9c7d5c] opacity-85"
              />

              {/* Realistic Oval Fairy Light 1 on left cord (Emerald) */}
              <OvalFairyLight
                x={32}
                y={22}
                color={FAIRY_PALETTE[1]}
                delay={320}
                duration={2.1}
                scale={0.88}
              />

              {/* Realistic Oval Fairy Light 2 on right cord (Ruby) */}
              <OvalFairyLight
                x={54}
                y={38}
                color={FAIRY_PALETTE[2]}
                delay={980}
                duration={2.5}
                scale={0.88}
              />
            </svg>
            {/* Clothespin clamping top of Card 2 */}
            <Clothespin className="absolute -bottom-2.5 left-1/2 -translate-x-1/2" />
          </div>

          {/* CARD 2: 2nd Place */}
          <div className="relative group transition-transform duration-300">
            <AchievementCardItem item={achievements[1]} />
          </div>

          {/* VERTICAL HANGING CONNECTOR 2: Connecting Card 2 to Card 3 */}
          <div className="relative h-16 w-full flex items-center justify-center my-0.5 pointer-events-none select-none">
            <svg viewBox="0 0 90 64" className="w-24 h-16 overflow-visible" aria-hidden="true">
              <path
                d="M 32 0 C 30 25, 36 40, 42 64"
                fill="none"
                stroke="#684e34"
                strokeWidth="1.8"
                strokeDasharray="3 1"
                className="dark:stroke-[#9c7d5c] opacity-85"
              />
              <path
                d="M 58 0 C 60 25, 54 40, 48 64"
                fill="none"
                stroke="#684e34"
                strokeWidth="1.8"
                strokeDasharray="3 1"
                className="dark:stroke-[#9c7d5c] opacity-85"
              />

              {/* Realistic Oval Fairy Light 1 on left cord (Sky) */}
              <OvalFairyLight
                x={32}
                y={22}
                color={FAIRY_PALETTE[3]}
                delay={540}
                duration={2.3}
                scale={0.88}
              />

              {/* Realistic Oval Fairy Light 2 on right cord (Gold) */}
              <OvalFairyLight
                x={54}
                y={38}
                color={FAIRY_PALETTE[0]}
                delay={1280}
                duration={2.0}
                scale={0.88}
              />
            </svg>
            {/* Clothespin clamping top of Card 3 */}
            <Clothespin className="absolute -bottom-2.5 left-1/2 -translate-x-1/2" />
          </div>

          {/* CARD 3: 3rd Place · Technovision 4.0 */}
          <div className="relative group transition-transform duration-300">
            <AchievementCardItem item={achievements[2]} />
          </div>

          {/* Bottom decorative hanging cord tassel finish */}
          <div className="h-8 w-full flex items-center justify-center pointer-events-none mt-1">
            <svg viewBox="0 0 50 32" className="w-12 h-8 overflow-visible" aria-hidden="true">
              <path
                d="M 25 0 L 25 18"
                stroke="#684e34"
                strokeWidth="1.8"
                strokeDasharray="2 1"
                className="dark:stroke-[#9c7d5c] opacity-75"
              />
              {/* Little bead with oval fairy light */}
              <OvalFairyLight
                x={25}
                y={12}
                color={FAIRY_PALETTE[4]}
                delay={750}
                duration={2.2}
                scale={0.75}
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
