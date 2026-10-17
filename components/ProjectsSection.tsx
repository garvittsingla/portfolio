"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Code2,
  Globe,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

// Mechanical tick sound helper
function playMechanicalTick() {
  try {
    const audio = new Audio("/toggle-tick.wav");
    audio.volume = 0.25;
    audio.play().catch(() => {});
  } catch {}
}

export function ProjectsSection() {
  // Video playback control state
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleVideoPlayback = () => {
    playMechanicalTick();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const toggleVideoMute = () => {
    playMechanicalTick();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsVideoMuted(videoRef.current.muted);
    }
  };

  return (
    <section
      id="projects"
      aria-label="Highlighted Products and Systems"
      className="relative mx-auto mt-20 mb-20 w-full max-w-4xl px-4 sm:px-6 scroll-mt-28"
    >
      {/* ─────────────────────────────────────────────────────────────
          SECTION TITLE
          ───────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="font-handwriting text-2xl text-neutral-800 dark:text-neutral-100 sm:text-3xl">
          things i’ve built & shipped
        </h2>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VISUAL GRID: 2 FEATURED SPOTLIGHT PROJECTS
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ════════════════════════════════════════════════════════════
            PROJECT 1: GRUBER 🕊️
            ════════════════════════════════════════════════════════════ */}
        <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-[#e7e1d0] bg-[#faf7ee]/95 p-4 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.09)] dark:border-neutral-800/90 dark:bg-[#12131a]/95 dark:shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
          {/* Washi tape accent on corner */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-0 h-4 w-16 -rotate-3 z-20 border-y border-amber-300/60 bg-amber-200/80 dark:border-amber-400/30 dark:bg-amber-300/25"
          />

          <div>
            {/* Window Frame with Video Demo */}
            <div className="relative mb-4 overflow-hidden rounded-xl border border-neutral-300/80 dark:border-neutral-700/80 bg-neutral-950 shadow-sm">
              {/* Window Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/95 border-b border-neutral-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[10px] text-neutral-400 truncate max-w-[140px] sm:max-w-[180px]">
                    gruber.garvitsingla.in
                  </span>
                </div>
              </div>

              {/* Viewport: Native Video Demo */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900 group/video">
                <video
                  ref={videoRef}
                  src="/projects/gruber-demo.mp4"
                  poster="/projects/gruber-cover.jpg"
                  autoPlay
                  loop
                  muted={isVideoMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Subtle video playback overlay controls */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-10 opacity-70 group-hover/video:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={toggleVideoPlayback}
                    aria-label={isVideoPlaying ? "Pause video" : "Play video"}
                    className="p-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    {isVideoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleVideoMute}
                    aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
                    className="p-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    {isVideoMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* File No + Rubber Stamp */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-handwriting text-xs text-neutral-500 dark:text-neutral-400">
                № 001 · live product · presentation engine
              </span>
              <span className="inline-block px-2 py-0.5 rounded-[3px] border border-neutral-400/80 dark:border-neutral-600 bg-white/70 dark:bg-black/40 font-mono text-[9px] font-bold tracking-wider text-neutral-700 dark:text-neutral-300 rotate-[-1.5deg] shadow-2xs">
                [LIVE PRODUCT]
              </span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="font-semibold text-lg sm:text-xl text-neutral-900 dark:text-neutral-100 tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Gruber 🕊️
            </h3>
            <p className="mt-0.5 font-handwriting text-xs text-neutral-500 dark:text-neutral-400">
              Realtime Markdown to Slides Presentation Engine
            </p>

            {/* Description */}
            <p className="mt-2.5 text-xs sm:text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
              Built a realtime Markdown to slides parser for quick meetings and concise explanations. Implemented the parser, lexer, and tokenizer completely from scratch without using any external libraries or parsers. Built entirely in native HTML, CSS, and JS.
            </p>

            {/* Tags */}
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {["Markdown", "Custom Parser", "Lexer", "Native JS", "Live Tool"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-neutral-300/70 dark:border-neutral-700 bg-white/50 dark:bg-neutral-900/50 px-2 py-0.5 font-mono text-[10px] text-neutral-600 dark:text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Links */}
          <div className="mt-5 pt-3 border-t border-dashed border-neutral-300/80 dark:border-neutral-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <a
                href="https://gruber.garvitsingla.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>launch live</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
              <a
                href="https://www.linkedin.com/posts/garvittsingla_markdown-parser-lexer-activity-7516856646497820672-gNvZ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition-colors"
              >
                <span>post & video</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <a
              href="https://github.com/garvittsingla/gruber"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>github</span>
            </a>
          </div>
        </article>

        {/* ════════════════════════════════════════════════════════════
            PROJECT 2: NSLOOKUP FROM SCRATCH
            ════════════════════════════════════════════════════════════ */}
        <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-[#e7e1d0] bg-[#faf7ee]/95 p-4 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.09)] dark:border-neutral-800/90 dark:bg-[#12131a]/95 dark:shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
          {/* Washi tape accent on corner */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-0 h-4 w-16 -rotate-3 z-20 border-y border-sky-300/60 bg-sky-200/80 dark:border-sky-400/30 dark:bg-sky-300/25"
          />

          <div>
            {/* Window Frame with Terminal GIF */}
            <div className="relative mb-4 overflow-hidden rounded-xl border border-neutral-300/80 dark:border-neutral-700/80 bg-neutral-950 shadow-sm">
              {/* Window Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/95 border-b border-neutral-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[10px] text-neutral-400 truncate max-w-[140px] sm:max-w-[180px]">
                    github.com/garvittsingla/nslookup
                  </span>
                </div>
              </div>

              {/* Viewport: Terminal Execution GIF */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/projects/nslookup-output.gif"
                  alt="nslookup CLI output demo execution"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* File No + Rubber Stamp */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-handwriting text-xs text-neutral-500 dark:text-neutral-400">
                № 002 · systems programming · networking
              </span>
              <span className="inline-block px-2 py-0.5 rounded-[3px] border border-neutral-400/80 dark:border-neutral-600 bg-white/70 dark:bg-black/40 font-mono text-[9px] font-bold tracking-wider text-neutral-700 dark:text-neutral-300 rotate-[-1.5deg] shadow-2xs">
                [SYSTEMS / C]
              </span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="font-semibold text-lg sm:text-xl text-neutral-900 dark:text-neutral-100 tracking-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              nslookup in C
            </h3>
            <p className="mt-0.5 font-handwriting text-xs text-neutral-500 dark:text-neutral-400">
              Custom DNS Resolver using UNIX Sockets API
            </p>

            {/* Description */}
            <p className="mt-2.5 text-xs sm:text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
              A command-line DNS resolver written from scratch in C to demystify computer networking and raw socket communication. Crafts 512-byte RFC 1035 wire datagrams, connects to UDP port 53, parses 12-byte header bitfields, and unpacks recursive A/AAAA records.
            </p>

            {/* Tags */}
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {["C", "POSIX Sockets", "UDP", "DNS Wire Protocol", "RFC 1035"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-neutral-300/70 dark:border-neutral-700 bg-white/50 dark:bg-neutral-900/50 px-2 py-0.5 font-mono text-[10px] text-neutral-600 dark:text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Links */}
          <div className="mt-5 pt-3 border-t border-dashed border-neutral-300/80 dark:border-neutral-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link
                href="/blog/nslookup"
                className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
              >
                <span>read blog</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
              <a
                href="https://github.com/garvittsingla/nslookup"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition-colors"
              >
                <span>readme & docs</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <a
              href="https://github.com/garvittsingla/nslookup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>github</span>
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
