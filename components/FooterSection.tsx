"use client";

import React from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Calendar,
  Mail,
  Quote,
} from "lucide-react";

export function FooterSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socials = [
    {
      name: "GitHub",
      handle: "@garvittsingla",
      href: "https://github.com/garvittsingla",
    },
    {
      name: "Twitter / X",
      handle: "@garvitsinglaa",
      href: "https://x.com/garvitsinglaa",
    },
    {
      name: "LinkedIn",
      handle: "in/garvittsingla",
      href: "https://linkedin.com/in/garvittsingla",
    },
    {
      name: "LeetCode",
      handle: "garvittsingla",
      href: "https://leetcode.com/garvittsingla/",
    },
  ];

  return (
    <footer
      id="contact"
      aria-label="Footer and Contact"
      className="relative w-full mt-24 pb-12 pt-6 overflow-hidden select-none"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* DESK MEMO / PAPER BLOTTER CARD */}
        <div className="relative overflow-hidden rounded-3xl border border-[#e5decb] dark:border-neutral-800/90 bg-[#faf6ea]/95 dark:bg-[#121319]/95 p-7 sm:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.4)]">
          {/* Paper Noise & Grid overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[.14] dark:opacity-[.07]"
            style={{
              backgroundImage: "radial-gradient(#000 0.4px, transparent 0.4px)",
              backgroundSize: "4px 4px",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-25 dark:opacity-15"
            style={{
              backgroundImage: "url('/paper-noise.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "180px 180px",
            }}
          />

          {/* Warm ambient corner glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-amber-400/10 dark:bg-amber-400/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-sky-400/10 dark:bg-sky-400/5 blur-3xl" />

          {/* TOP SECTION: ALEX HORMOZI QUOTE (Inspired by Portfolio v1) */}
          <div className="relative z-10 mb-8 pb-8 border-b border-dashed border-[#e2d8c0] dark:border-neutral-800">
            <div className="flex items-start gap-3">
              <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500/60 dark:text-amber-400/40 shrink-0 rotate-180 -mt-1" />
              <div className="flex-1">
                <blockquote className="font-handwriting text-lg sm:text-2xl md:text-2.5xl leading-relaxed text-neutral-800 dark:text-neutral-100 font-medium">
                  &ldquo;Do so much work that it would be unreasonable for you to
                  not be successful.&rdquo;
                </blockquote>
                <div className="mt-3 flex items-center gap-2">
                  <span className="font-handwriting text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                    — Alex Hormozi
                  </span>
                  <span
                    aria-hidden="true"
                    className="inline-block h-2 w-16 rounded-full bg-amber-300/40 dark:bg-amber-400/20 -rotate-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION: "LET'S BUILD SOMETHING" & CALL TO ACTION */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-md">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                get in touch · collaboration
              </p>
              <h3 className="font-handwriting text-2xl sm:text-3xl text-neutral-900 dark:text-neutral-100">
                let&apos;s build something great.
              </h3>
              <p className="mt-2 font-sans text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                Open to conversations, open-source initiatives, systems challenges, or just
                talking tech. Drop a line or book a quick intro chat.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href="https://cal.com/garvittsingla/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold
                  bg-neutral-900 text-white dark:bg-white dark:text-neutral-950
                  hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book a 30m call</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href="mailto:garvitsingla4751@gmail.com"
                className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium
                  bg-white/80 dark:bg-neutral-800/80
                  border border-neutral-300/80 dark:border-neutral-700/80
                  text-neutral-800 dark:text-neutral-200
                  hover:border-neutral-800 dark:hover:border-neutral-200
                  hover:scale-105 active:scale-95 transition-all shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5 text-rose-500/80" />
                <span>garvitsingla4751@gmail.com</span>
              </a>
            </div>
          </div>

          {/* SOCIAL LINKS TAGS */}
          <div className="relative z-10 pt-6 border-t border-[#e2d8c0] dark:border-neutral-800/80 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <span className="font-handwriting text-xs text-neutral-400 dark:text-neutral-500 mr-1 select-none">
              find me online ➔
            </span>

            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono
                  bg-white/60 dark:bg-neutral-900/40
                  border border-neutral-200 dark:border-neutral-800
                  text-neutral-600 dark:text-neutral-400
                  hover:text-neutral-900 dark:hover:text-white
                  hover:border-neutral-400 dark:hover:border-neutral-600
                  transition-all duration-200 shadow-2xs"
              >
                <span className="font-medium">{s.name}</span>
                <ArrowUpRight className="w-3 h-3 opacity-50" />
              </a>
            ))}
          </div>

          {/* BOTTOM-MOST SIGNATURE & BACK-TO-TOP */}
          <div className="relative z-10 mt-8 pt-5 border-t border-[#ebe4d2] dark:border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="font-handwriting text-neutral-700 dark:text-neutral-300">
                garvit singla
              </span>
              <span>·</span>
              <span>© {new Date().getFullYear()}</span>
              <span>·</span>
              <span className="hidden sm:inline">crafted with ink & code</span>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono
                bg-white/70 dark:bg-neutral-800/60
                border border-neutral-300/80 dark:border-neutral-700/80
                hover:text-neutral-900 dark:hover:text-white
                hover:border-neutral-800 dark:hover:border-neutral-200
                transition-all cursor-pointer group"
              aria-label="Scroll back to top of page"
            >
              <span>back to top</span>
              <ArrowUp className="w-3 h-3 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
