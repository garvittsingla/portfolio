"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ExternalLink, Flame, Trophy } from "lucide-react";

const LEETCODE_USERNAME = "garvittsingla";
const DAY_MS = 24 * 60 * 60 * 1000;

interface ContestResult {
  rating: number;
  ranking: number;
  title: string;
  startTime: number;
}

interface LeetCodeData {
  username: string;
  realName: string;
  ranking: number | null;
  solved: { all: number; easy: number; medium: number; hard: number };
  calendar: Record<string, number>;
  activeDays: number;
  streak: number;
  contestRating: number | null;
  contestRanking: number | null;
  contestHistory: ContestResult[];
}

interface CalendarCell {
  date: Date;
  count: number;
}

const formatNumber = (value: number) => value.toLocaleString("en-US");

function ratingPath(history: ContestResult[]) {
  const width = 640;
  const height = 205;
  const padding = { top: 14, right: 18, bottom: 30, left: 42 };

  if (history.length === 0) return null;

  const ratings = history.map((entry) => entry.rating);
  const minRating = Math.floor((Math.min(...ratings) - 50) / 100) * 100;
  const maxRating = Math.ceil((Math.max(...ratings) + 50) / 100) * 100;
  const range = Math.max(maxRating - minRating, 100);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const points = history.map((entry, index) => {
    const x = padding.left + (history.length === 1 ? plotWidth / 2 : (index / (history.length - 1)) * plotWidth);
    const y = padding.top + ((maxRating - entry.rating) / range) * plotHeight;
    return { ...entry, x, y };
  });

  return { width, height, padding, minRating, maxRating, points, plotWidth, plotHeight };
}

export function LeetCodeStats() {
  const [data, setData] = useState<LeetCodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const response = await fetch(`/api/leetcode?username=${LEETCODE_USERNAME}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load LeetCode stats.");
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Could not load LeetCode stats.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const weeks = useMemo(() => {
    const today = new Date();
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const daysToSaturday = 6 - new Date(todayUtc).getUTCDay();
    const end = todayUtc + daysToSaturday * DAY_MS;
    const start = end - 370 * DAY_MS;
    const cells: CalendarCell[] = Array.from({ length: 371 }, (_, index) => {
      const date = new Date(start + index * DAY_MS);
      const key = String(Math.floor(date.getTime() / 1000));
      return { date, count: data?.calendar[key] ?? 0 };
    });
    return Array.from({ length: 53 }, (_, index) => cells.slice(index * 7, index * 7 + 7));
  }, [data]);

  const monthLabels = useMemo(() => {
    const labels: { week: number; name: string }[] = [];
    weeks.forEach((week, weekIndex) => {
      const firstOfMonth = week.find((day) => day.date.getUTCDate() === 1);
      if (firstOfMonth) {
        labels.push({
          week: weekIndex,
          name: firstOfMonth.date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
        });
      }
    });
    return labels;
  }, [weeks]);

  const contestHistory = useMemo(
    () => [...(data?.contestHistory ?? [])].sort((a, b) => a.startTime - b.startTime),
    [data],
  );
  const chart = useMemo(() => ratingPath(contestHistory), [contestHistory]);
  const yearlySubmissions = data ? Object.values(data.calendar).reduce((sum, count) => sum + count, 0) : 0;

  return (
    <section
      id="leetcode"
      aria-label="LeetCode stats"
      className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 select-none mt-14 sm:mt-16 mb-16 sm:mb-20 scroll-mt-24"
    >
      <div className="relative group/note">
        <svg
          aria-hidden="true"
          viewBox="0 0 34 72"
          className="absolute -top-6 left-10 z-20 h-16 w-8 rotate-[-8deg] text-neutral-400 dark:text-neutral-500 drop-shadow-[1px_2px_1px_rgba(0,0,0,0.18)]"
          fill="none"
        >
          <path d="M23 12V50c0 7-5 12-11 12S2 57 2 50V14C2 8 6 4 12 4s10 4 10 10v34c0 4-2.5 7-6 7s-6-3-6-7V17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 15v35c0 3 1.2 5.3 3.3 6.7" stroke="white" strokeOpacity=".55" strokeWidth=".8" strokeLinecap="round" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 34 72"
          className="absolute -top-7 right-12 z-20 h-[68px] w-8 rotate-[9deg] text-neutral-400 dark:text-neutral-500 drop-shadow-[1px_2px_1px_rgba(0,0,0,0.18)]"
          fill="none"
        >
          <path d="M23 12V50c0 7-5 12-11 12S2 57 2 50V14C2 8 6 4 12 4s10 4 10 10v34c0 4-2.5 7-6 7s-6-3-6-7V17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 15v35c0 3 1.2 5.3 3.3 6.7" stroke="white" strokeOpacity=".55" strokeWidth=".8" strokeLinecap="round" />
        </svg>
        <div
          className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8
            bg-[#FAF7EE] dark:bg-[#12131a]
            border border-[#E7E1D0] dark:border-neutral-800/90
            shadow-[0_12px_36px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]
            dark:shadow-[0_18px_50px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.4)]
            rotate-[0.25deg] hover:rotate-0 transition-transform duration-300"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl opacity-35 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen"
            style={{ backgroundImage: "radial-gradient(#000 0.4px, transparent 0.4px)", backgroundSize: "4px 4px" }}
          />

          <div className="relative z-10 flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
              <div className="relative inline-flex items-center">
                <span aria-hidden="true" className="absolute inset-x-[-4px] -inset-y-0.5 bg-amber-200/80 dark:bg-amber-400/20 rounded-xs -rotate-[0.4deg]" />
                <h2 className="relative text-xl sm:text-2xl font-handwriting font-normal text-neutral-800 dark:text-neutral-200 tracking-tight rotate-[-1deg]">
                  leetcode problem-solving log
                </h2>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-handwriting text-neutral-500 dark:text-neutral-400 rotate-[0.4deg]">
                a little record of problems and contests
              </p>
            </div>
            <a
              href={`https://leetcode.com/u/${LEETCODE_USERNAME}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <span>u/{LEETCODE_USERNAME}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

          {isLoading && (
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-pulse" aria-label="Loading LeetCode stats">
              {["total", "easy", "medium", "hard"].map((label) => (
                <div key={label} className="h-[76px] rounded-xl bg-white/55 dark:bg-neutral-900/50 border border-neutral-200/70 dark:border-neutral-800/60" />
              ))}
            </div>
          )}

          {error && (
            <p role="status" className="relative z-10 rounded-xl border border-amber-300/70 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 px-4 py-3 text-xs font-mono text-neutral-600 dark:text-neutral-300">
              {error} The profile link above still opens LeetCode.
            </p>
          )}

          {data && (
            <div className="relative z-10 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="col-span-2 sm:col-span-1 rounded-xl p-3.5 border border-neutral-200/80 dark:border-neutral-800/80 bg-white/75 dark:bg-neutral-900/55 rotate-[-0.4deg]">
                  <p className="text-xs font-handwriting text-neutral-500 dark:text-neutral-400">solved</p>
                  <p className="mt-1 text-2xl font-handwriting text-neutral-800 dark:text-neutral-200">{formatNumber(data.solved.all)}</p>
                  <p className="text-xs font-handwriting text-neutral-500 dark:text-neutral-400">problems</p>
                </div>
                <div className="rounded-xl p-3.5 border border-neutral-200/80 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-900/45 rotate-[0.3deg]">
                  <p className="text-xs font-handwriting text-neutral-500 dark:text-neutral-400">easy</p>
                  <p className="mt-1 text-xl font-handwriting text-neutral-800 dark:text-neutral-200">{formatNumber(data.solved.easy)}</p>
                </div>
                <div className="rounded-xl p-3.5 border border-neutral-200/80 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-900/45 rotate-[-0.25deg]">
                  <p className="text-xs font-handwriting text-neutral-500 dark:text-neutral-400">medium</p>
                  <p className="mt-1 text-xl font-handwriting text-neutral-800 dark:text-neutral-200">{formatNumber(data.solved.medium)}</p>
                </div>
                <div className="rounded-xl p-3.5 border border-neutral-200/80 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-900/45 rotate-[0.45deg]">
                  <p className="text-xs font-handwriting text-neutral-500 dark:text-neutral-400">hard</p>
                  <p className="mt-1 text-xl font-handwriting text-neutral-800 dark:text-neutral-200">{formatNumber(data.solved.hard)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-900/45 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-base font-handwriting text-neutral-800 dark:text-neutral-200 rotate-[-0.5deg]">submission history</h3>
                    <p className="mt-0.5 text-xs font-handwriting text-neutral-500 dark:text-neutral-400">last 12 months · {formatNumber(yearlySubmissions)} submissions</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-handwriting text-neutral-500 dark:text-neutral-400">
                    <Flame className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>{formatNumber(data.activeDays)} active days</span>
                    <span className="text-neutral-300 dark:text-neutral-700">·</span>
                    <span>{formatNumber(data.streak)} day streak</span>
                  </div>
                </div>

                <div className="overflow-x-auto pb-1" aria-label="LeetCode submissions by day over the last year">
                  <div className="relative min-w-[640px] pt-5">
                    <div className="absolute inset-x-0 top-0 h-4" aria-hidden="true">
                      {monthLabels.map((label) => (
                        <span key={`${label.week}-${label.name}`} className="absolute text-[10px] font-handwriting text-neutral-500 dark:text-neutral-400" style={{ left: `${label.week * 12}px` }}>
                          {label.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-[3px]" role="img" aria-label="Submission calendar, darker squares mean more submissions">
                      {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                          {week.map((day) => {
                            const count = day?.count ?? 0;
                            const color = count === 0
                              ? "bg-neutral-100 dark:bg-neutral-800"
                              : count < 3
                                ? "bg-amber-200 dark:bg-amber-950/80"
                                : count < 6
                                  ? "bg-amber-400 dark:bg-amber-700"
                                  : count < 10
                                    ? "bg-orange-500 dark:bg-orange-600"
                                    : "bg-orange-700 dark:bg-orange-400";
                            return (
                              <span
                                key={day?.date.toISOString() ?? `${weekIndex}-empty`}
                                title={`${count} submission${count === 1 ? "" : "s"} on ${day?.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`}
                                className={`block h-[9px] w-[9px] rounded-[2px] ${color}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-end gap-1 text-[10px] font-handwriting text-neutral-500 dark:text-neutral-400">
                  <span>less</span>
                  <span className="h-[9px] w-[9px] rounded-[2px] bg-neutral-100 dark:bg-neutral-800" />
                  <span className="h-[9px] w-[9px] rounded-[2px] bg-amber-200 dark:bg-amber-950/80" />
                  <span className="h-[9px] w-[9px] rounded-[2px] bg-amber-400 dark:bg-amber-700" />
                  <span className="h-[9px] w-[9px] rounded-[2px] bg-orange-500 dark:bg-orange-600" />
                  <span className="h-[9px] w-[9px] rounded-[2px] bg-orange-700 dark:bg-orange-400" />
                  <span>more</span>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-900/45 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <div>
                      <h3 className="text-base font-handwriting text-neutral-800 dark:text-neutral-200 rotate-[0.4deg]">contest rating</h3>
                      <p className="mt-0.5 text-xs font-handwriting text-neutral-500 dark:text-neutral-400">rating after each attended contest</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-handwriting text-neutral-800 dark:text-neutral-200">
                      {data.contestRating === null ? "—" : Math.round(data.contestRating).toLocaleString("en-US")}
                    </p>
                    <p className="text-[11px] font-handwriting text-neutral-500 dark:text-neutral-400">current rating</p>
                  </div>
                </div>

                {chart ? (
                  <div className="overflow-x-auto">
                    <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="w-full min-w-[440px] h-auto" role="img" aria-label={`Contest rating graph, ${contestHistory.length} contests, current rating ${data.contestRating ? Math.round(data.contestRating) : "unavailable"}`}>
                      {[0, 0.5, 1].map((fraction) => {
                        const y = chart.padding.top + chart.plotHeight * fraction;
                        const value = Math.round(chart.maxRating - (chart.maxRating - chart.minRating) * fraction);
                        return (
                          <g key={fraction}>
                            <line x1={chart.padding.left} x2={chart.width - chart.padding.right} y1={y} y2={y} stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" strokeDasharray="3 5" />
                            <text x={chart.padding.left - 8} y={y + 3} textAnchor="end" className="fill-neutral-400 dark:fill-neutral-500" fontSize="9" fontFamily="monospace">{value}</text>
                          </g>
                        );
                      })}
                      <polyline
                        points={chart.points.map((point) => `${point.x},${point.y}`).join(" ")}
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                      {chart.points.map((point) => (
                        <circle key={`${point.startTime}-${point.title}`} cx={point.x} cy={point.y} r="3" fill="#d97706" stroke="#FAF7EE" strokeWidth="1.5" className="dark:stroke-[#12131a]">
                          <title>{`${point.title}: ${Math.round(point.rating)} rating`}</title>
                        </circle>
                      ))}
                      <text x={chart.padding.left} y={chart.height - 7} className="fill-neutral-400 dark:fill-neutral-500" fontSize="9" fontFamily="monospace">
                        {new Date(contestHistory[0].startTime * 1000).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                      </text>
                      <text x={chart.width - chart.padding.right} y={chart.height - 7} textAnchor="end" className="fill-neutral-400 dark:fill-neutral-500" fontSize="9" fontFamily="monospace">
                        {new Date(contestHistory[contestHistory.length - 1].startTime * 1000).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                      </text>
                    </svg>
                    <p className="text-right text-xs font-handwriting text-neutral-500 dark:text-neutral-400">{contestHistory.length} contests</p>
                  </div>
                ) : (
                  <p className="py-8 text-center text-xs font-mono text-neutral-500 dark:text-neutral-400">No contest rating history yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
