"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, MapPin } from "lucide-react";

const experience = [
  {
    company: "Open Source Chandigarh",
    role: "Open source executive",
    dates: "Oct 2025 — Present",
    place: "Chitkara University",
    image: "/experience-osc.png",
    imageFit: "contain",
    description: "Maintaining a project under Hacktoberfest and contributing to open source projects through code quality improvements and new features.",
    skills: ["Open source", "Next.js", "Prisma", "C++", "Rust"],
  },
  {
    company: "Turbin3",
    role: "Async Builder Cohort · Apprenticeship",
    dates: "Jan 2026 — Mar 2026",
    place: "Online",
    image: "/experience-turbin3.jpg",
    imageFit: "contain",
    description: "Explored Solana, AMMs, NFTs, and tokens; built on-chain programs including an AMM and an escrow program with Rust and Anchor.",
    skills: ["Solana", "Rust", "Anchor", "TypeScript"],
  },
  {
    company: "GFG_CUIET",
    role: "Technical Executive",
    dates: "Feb 2025 — Sep 2025",
    place: "Chitkara University",
    image: null,
    imageFit: "contain",
    description: "Served as a Technical Executive with the campus GeeksforGeeks community at Chitkara University.",
    skills: ["Technical community"],
  },
];

export function ExperienceSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="experience" aria-label="Experience" className="mx-auto mb-4 mt-16 w-full max-w-4xl scroll-mt-28 px-4 sm:mt-20 sm:px-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">places i’ve grown · experience</p>
          <h2 className="font-handwriting text-2xl text-neutral-800 dark:text-neutral-100 sm:text-3xl">the work & the learning</h2>
        </div>
        <span className="hidden -rotate-2 font-handwriting text-xs text-neutral-400 dark:text-neutral-500 sm:inline">tap a line to unfold ↴</span>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[#e7e1d0] bg-[#faf7ee]/95 shadow-[0_10px_30px_rgba(0,0,0,.06)] dark:border-neutral-800/90 dark:bg-[#12131a]/95 dark:shadow-[0_14px_38px_rgba(0,0,0,.35)] sm:rounded-3xl">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.16] dark:opacity-[.08]" style={{ backgroundImage: "radial-gradient(#000 0.4px, transparent 0.4px)", backgroundSize: "4px 4px" }} />
        <div className="relative">
          {experience.map((item, index) => {
            const expanded = open === index;
            return (
              <article key={item.company} className={`${index > 0 ? "border-t border-dashed border-neutral-300/80 dark:border-neutral-700/80" : ""}`}>
                <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : index)} className="group flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500/60 dark:hover:bg-white/[.035] sm:gap-4 sm:px-6 sm:py-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200/80 bg-white/85 p-1.5 shadow-sm dark:border-neutral-700/80 dark:bg-neutral-900/80">
                    {item.image ? <Image src={item.image} alt={`${item.company} logo`} width={42} height={42} className={`${item.imageFit === "contain" ? "object-contain" : "object-cover"} h-full w-full`} /> : <span aria-hidden="true" className="font-mono text-[11px] font-bold tracking-tight text-emerald-700 dark:text-emerald-300">GFG</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{item.company}</span>
                      <span className="rounded-full border border-neutral-300/70 bg-white/45 px-2 py-0.5 font-mono text-[9px] text-neutral-500 dark:border-neutral-700 dark:bg-black/15 dark:text-neutral-400">{item.role.includes("Apprenticeship") ? "apprenticeship" : "experience"}</span>
                    </span>
                    <span className="mt-1 block text-xs text-neutral-600 dark:text-neutral-400 sm:text-sm">{item.role}</span>
                  </span>
                  <span className="hidden shrink-0 text-right sm:block">
                    <span className="block font-mono text-[11px] text-neutral-700 dark:text-neutral-300">{item.dates}</span>
                    <span className="mt-1 flex items-center justify-end gap-1 font-mono text-[10px] text-neutral-400 dark:text-neutral-500"><MapPin size={11} />{item.place}</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:text-neutral-800 dark:text-neutral-400 dark:group-hover:text-neutral-100 ${expanded ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className={`grid transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${expanded ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}>
                      <div className="pb-5 pl-[4.5rem] pr-5 sm:pb-6 sm:pl-[5.5rem] sm:pr-8">
                        <p className="mb-2 font-mono text-[10px] text-neutral-400 dark:text-neutral-500 sm:hidden">{item.dates} · {item.place}</p>
                        <p className="max-w-2xl text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-sm">{item.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {item.skills.map((skill) => <span key={skill} className="rounded-md border border-neutral-300/60 bg-white/45 px-2 py-1 font-mono text-[9px] text-neutral-500 dark:border-neutral-700/70 dark:bg-neutral-900/40 dark:text-neutral-400">{skill}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div aria-hidden="true" className="absolute right-6 top-0 h-3.5 w-14 -rotate-2 border-y border-amber-300/40 bg-amber-100/70 dark:border-amber-400/20 dark:bg-amber-200/15" />
      </div>
    </section>
  );
}
