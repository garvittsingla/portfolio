"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  FALLBACK_CONTRIBUTION_DATA,
  ContributionDay,
  ContributionData,
} from "./githubContributionsData";
import { ChevronDown, ExternalLink, GitPullRequest, Star, Sparkles } from "lucide-react";

interface MonthLabel {
  name: string;
  weekIndex: number;
}

interface OSSProject {
  title: string;
  repo: string;
  repoUrl: string;
  prUrl: string;
  prNumber: number;
  prTitle: string;
  status: "Merged" | "Open";
  description: string;
  language: string;
  langColor: string;
  stars?: string;
}

const OSS_PROJECTS: OSSProject[] = [
  {
    title: "ImageDiff",
    repo: "sev-/ImageDiff",
    repoUrl: "https://github.com/sev-/ImageDiff",
    prUrl: "https://github.com/sev-/ImageDiff/pull/2",
    prNumber: 2,
    prTitle: "Add caching and pagination; display builds in increasing order",
    status: "Merged",
    description: "Added cached timeline ranges and paginated build listings, with builds sorted chronologically.",
    language: "Python",
    langColor: "#3572A5",
    stars: "1",
  },
  {
    title: "rs-tiled",
    repo: "mapeditor/rs-tiled",
    repoUrl: "https://github.com/mapeditor/rs-tiled",
    prUrl: "https://github.com/mapeditor/rs-tiled/pull/337",
    prNumber: 337,
    prTitle: "Make SFML and GGEZ examples optional features so tests can run",
    status: "Merged",
    description: "Decoupled heavy game framework dependencies into optional cargo features to fix headless CI test execution.",
    language: "Rust",
    langColor: "#dea584",
    stars: "850",
  },
];

export function GithubContributionsSticky() {
  const [data, setData] = useState<ContributionData>(FALLBACK_CONTRIBUTION_DATA);
  const [hoveredDay, setHoveredDay] = useState<{
    day: ContributionDay;
    x: number;
    y: number;
  } | null>(null);
  const [isOssExpanded, setIsOssExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Re-fetch latest live contributions from public API on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveContributions() {
      try {
        const res = await fetch(
          "https://github-contributions-api.jogruber.de/v4/garvittsingla?y=last"
        );
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json && json.contributions && json.contributions.length > 0) {
            setData(json);
          }
        }
      } catch {
        // Fallback to static pre-bundled data gracefully
      }
    }

    fetchLiveContributions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll the contribution grid to the right on mobile screens so recent activity is visible
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [data]);

  // Group 371 days into 53 weeks (columns of 7 days) and detect month headers accurately
  const { weeks, monthLabels } = useMemo(() => {
    const rawDays = data.contributions || [];
    const weeksList: ContributionDay[][] = [];
    const months: MonthLabel[] = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    let currentMonth = -1;

    for (let i = 0; i < rawDays.length; i += 7) {
      const week = rawDays.slice(i, i + 7);
      const weekIdx = Math.floor(i / 7);
      weeksList.push(week);

      // Use Wednesday (mid-week) to determine the dominant month of the column
      if (week.length > 0) {
        const midDay = week[Math.min(3, week.length - 1)];
        const dateObj = new Date(midDay.date + "T00:00:00Z");
        const m = dateObj.getUTCMonth();
        if (m !== currentMonth) {
          currentMonth = m;
          const lastMonth = months[months.length - 1];
          if (!lastMonth || weekIdx - lastMonth.weekIndex >= 3) {
            months.push({
              name: monthNames[m],
              weekIndex: weekIdx,
            });
          }
        }
      }
    }

    return { weeks: weeksList, monthLabels: months };
  }, [data]);

  // Format date helper: "1 contribution on Jul 6, 2026"
  const formatDateString = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00Z");
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${monthNames[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  };

  // Color classes for squares depending on light/dark mode and level
  const getCellColorClass = (level: number) => {
    switch (level) {
      case 1:
        return "bg-[#9be9a8] dark:bg-[#0e4429]";
      case 2:
        return "bg-[#40c463] dark:bg-[#006d32]";
      case 3:
        return "bg-[#30a14e] dark:bg-[#26a641]";
      case 4:
        return "bg-[#216e39] dark:bg-[#39d353]";
      case 0:
      default:
        return "bg-[#ebedf0] dark:bg-[#1b1f24]/90";
    }
  };

  const totalContributions = data.total?.lastYear ?? 1328;

  return (
    <section
      aria-label="GitHub Contributions Activity"
      className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 select-none mt-20 sm:mt-24 mb-10 sm:mb-14"
    >
      {/* Main Sticky Note Container with Organic Tilt and Uneven Tapes */}
      <div className="relative group/note">
        {/* UNEVEN TAPES HOLDING THE STICKY NOTE DIRECTLY ABOVE */}
        {/* 1. Left Tape: smaller, tilted -3.5deg, serrated cut, placed directly above top edge */}
        <div
          className="absolute -top-2 sm:-top-2.5 left-7 sm:left-12 z-30 pointer-events-none transition-transform duration-300 group-hover/note:scale-[1.03]"
          style={{
            transform: "rotate(-3.5deg)",
          }}
        >
          <div
            className="w-14 sm:w-16 h-3.5 sm:h-4 relative
              bg-amber-100/75 dark:bg-amber-200/20 backdrop-blur-[2px]
              border-y border-amber-300/50 dark:border-amber-400/25
              shadow-[0_2px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
            style={{
              clipPath:
                "polygon(0% 4%, 96% 0%, 100% 16%, 95% 32%, 100% 48%, 96% 64%, 100% 80%, 95% 96%, 98% 100%, 0% 100%, 4% 84%, 0% 68%, 5% 52%, 1% 36%, 4% 20%, 0% 8%)",
            }}
          >
            {/* Tape highlight & translucent texture */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-black/5 pointer-events-none" />
          </div>
        </div>

        {/* 2. Right Tape: smaller, tilted +4.5deg, different offset & serration (Uneven) */}
        <div
          className="absolute -top-1.5 sm:-top-2 right-7 sm:right-12 z-30 pointer-events-none transition-transform duration-300 group-hover/note:scale-[1.03]"
          style={{
            transform: "rotate(4.5deg)",
          }}
        >
          <div
            className="w-12 sm:w-14 h-3 sm:h-3.5 relative
              bg-amber-100/70 dark:bg-amber-200/20 backdrop-blur-[2px]
              border-y border-amber-300/45 dark:border-amber-400/20
              shadow-[0_2px_4px_rgba(0,0,0,0.07)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
            style={{
              clipPath:
                "polygon(0% 0%, 95% 3%, 100% 20%, 94% 38%, 99% 56%, 94% 74%, 100% 90%, 96% 100%, 0% 100%, 5% 82%, 0% 66%, 4% 50%, 0% 34%, 5% 18%, 1% 6%)",
            }}
          >
            {/* Tape highlight & translucent texture */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/5 pointer-events-none" />
          </div>
        </div>

        {/* The Physical Sticky Note Card */}
        <div
          ref={cardRef}
          className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8
            bg-[#FAF7EE] dark:bg-[#12131a]
            border border-[#E7E1D0] dark:border-neutral-800/90
            shadow-[0_12px_36px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]
            dark:shadow-[0_18px_50px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.4)]
            rotate-[-0.35deg] hover:rotate-0
            transition-all duration-400 ease-out"
        >
          {/* Subtle tactile paper noise & stationery grain */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl opacity-35 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen"
            style={{
              backgroundImage: "radial-gradient(#000 0.4px, transparent 0.4px)",
              backgroundSize: "4px 4px",
            }}
          />

          {/* Top Row: Contribution count with yellow highlighter marker matching screenshot */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6">
            <div className="relative inline-flex items-center">
              {/* Authentic Yellow Highlighter Marker Stroke */}
              <span
                className="absolute inset-x-[-4px] -inset-y-0.5
                  bg-amber-200/80 dark:bg-amber-400/20
                  rounded-xs -rotate-[0.4deg] pointer-events-none"
              />
              <h3 className="relative text-sm sm:text-base md:text-[17px] font-sans font-medium sm:font-semibold text-neutral-800 dark:text-neutral-100 tracking-tight">
                {totalContributions.toLocaleString()} contributions in the last year
              </h3>
            </div>

            {/* GitHub profile link */}
            <a
              href="https://github.com/garvittsingla"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <span>@garvittsingla</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

          {/* Heatmap Section */}
          <div className="relative z-10">
            {/* Scrollable Container for Heatmap */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto pb-2 pt-1 scrollbar-none scroll-smooth select-none"
              style={{
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div className="min-w-[690px] w-full flex flex-col gap-1.5">
                {/* Month Labels with soft highlighter rectangles matching screenshot */}
                <div className="relative h-5 w-full">
                  {monthLabels.map((m, idx) => (
                    <div
                      key={idx}
                      className="absolute top-0"
                      style={{
                        left: `${(m.weekIndex / 53) * 100}%`,
                      }}
                    >
                      <span
                        className="inline-block px-1.5 py-0.5 rounded-[2px]
                          bg-amber-200/50 dark:bg-amber-400/15
                          text-[11px] font-mono font-medium text-neutral-700 dark:text-neutral-300
                          shadow-2xs leading-none"
                      >
                        {m.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 53 Columns x 7 Rows Contribution Grid */}
                <div className="flex gap-[3px] sm:gap-[3.5px] items-center pt-1">
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-[3px] sm:gap-[3.5px]">
                      {week.map((day) => {
                        const cellColor = getCellColorClass(day.level);
                        const isHovered = hoveredDay?.day.date === day.date;

                        return (
                          <div
                            key={day.date}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const cardBounds = cardRef.current?.getBoundingClientRect();
                              if (cardBounds) {
                                setHoveredDay({
                                  day,
                                  x: rect.left - cardBounds.left + rect.width / 2,
                                  y: rect.top - cardBounds.top,
                                });
                              }
                            }}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`w-[9.5px] h-[9.5px] sm:w-[10.5px] sm:h-[10.5px] rounded-[2.5px] cursor-pointer transition-transform duration-100 ${cellColor} ${
                              isHovered ? "scale-135 z-20 ring-1.5 ring-neutral-900 dark:ring-white" : "hover:scale-120"
                            }`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Interactive Tooltip: Matches screenshot dark pill */}
            {hoveredDay && (
              <div
                className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 transition-all duration-150"
                style={{
                  left: hoveredDay.x,
                  top: hoveredDay.y - 8,
                }}
              >
                <div className="relative px-2.5 py-1 rounded-md bg-[#18191c] text-white text-[11px] font-mono tracking-tight shadow-xl border border-neutral-700/80 whitespace-nowrap">
                  <span>
                    {hoveredDay.day.count === 0
                      ? "No contributions"
                      : `${hoveredDay.day.count} contribution${
                          hoveredDay.day.count === 1 ? "" : "s"
                        }`}{" "}
                    on {formatDateString(hoveredDay.day.date)}
                  </span>
                  {/* Tooltip downward caret arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#18191c]" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar: OSS Contributions & Circular Stacked Badges */}
          <div className="relative z-10 mt-6 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-[15px] font-sans font-medium text-neutral-800 dark:text-neutral-200 tracking-tight">
                OSS contributions:
              </span>
            </div>

            {/* Circular Stacked Badges + Expand Toggle (Matches screenshot) */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center -space-x-1.5">
                {/* Tiled project icon */}
                <div
                  title="Tiled"
                  className="relative w-6 h-6 sm:w-7 sm:h-7 overflow-hidden rounded-full bg-white border-2 border-[#FAF7EE] dark:border-[#12131a] shadow-xs"
                >
                  <Image src="/oss-icons/tiled.png" alt="Tiled" width={28} height={28} className="h-full w-full object-cover" />
                </div>

                {/* ScummVM project icon */}
                <div
                  title="ScummVM"
                  className="relative w-6 h-6 sm:w-7 sm:h-7 overflow-hidden rounded-full bg-white border-2 border-[#FAF7EE] dark:border-[#12131a] shadow-xs"
                >
                  <Image src="/oss-icons/scummvm.png" alt="ScummVM" width={28} height={28} className="h-full w-full object-cover" />
                </div>
              </div>

              {/* 4. Dropdown Chevron Toggle Button */}
              <button
                type="button"
                onClick={() => setIsOssExpanded((prev) => !prev)}
                aria-label={isOssExpanded ? "Collapse OSS details" : "Expand OSS details"}
                title={isOssExpanded ? "Collapse OSS details" : "Expand OSS details"}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 dark:hover:border-neutral-500 bg-white/60 dark:bg-neutral-800/60 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all duration-300 cursor-pointer shadow-2xs"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    isOssExpanded ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Expandable OSS Drawer Details */}
          {isOssExpanded && (
            <div className="relative z-10 mt-4 pt-4 border-t border-dashed border-neutral-300 dark:border-neutral-800/80 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OSS_PROJECTS.map((proj) => (
                  <div
                    key={proj.repo}
                    className="p-3 sm:p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xs flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-700 transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <a
                          href={proj.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{proj.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-800/60">
                          <GitPullRequest className="w-2.5 h-2.5" />
                          #{proj.prNumber}
                        </span>
                      </div>

                      <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2 mb-2 font-mono">
                        {proj.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: proj.langColor }}
                        />
                        <span>{proj.language}</span>
                      </div>

                      {proj.stars && (
                        <div className="flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 text-amber-500" />
                          <span>{proj.stars}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
