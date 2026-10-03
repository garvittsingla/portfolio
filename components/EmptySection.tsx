"use client";

import React from "react";
import { Plus, Layers, Code, FileText } from "lucide-react";

export function EmptySection() {
  return (
    <section
      id="workspace"
      aria-label="Notebook Workspace"
      className="w-full max-w-4xl mx-auto px-6 pt-32 pb-48 select-none"
    >
      {/* Notebook Section Header Divider */}
      <div className="flex items-center gap-4 mb-10">
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        <span className="font-handwriting text-sm sm:text-base text-neutral-400 dark:text-neutral-500 rotate-[-1deg]">
          ~ page 02 : upcoming components
        </span>
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      </div>

      {/* Spacious Empty Component Placeholder Canvas */}
      <div
        className="w-full min-h-[70vh] rounded-3xl p-6 sm:p-10
          border-2 border-dashed border-neutral-300/70 dark:border-neutral-800/80
          bg-white/40 dark:bg-neutral-900/30 backdrop-blur-xs
          flex flex-col items-center justify-center text-center
          transition-colors duration-300"
      >
        <div className="max-w-md space-y-4 flex flex-col items-center">
          {/* Subtle plus badge */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/60 shadow-xs">
            <Plus className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-handwriting text-2xl sm:text-3xl text-neutral-800 dark:text-neutral-200">
              empty component canvas
            </h2>
            <p className="text-xs sm:text-sm font-mono text-neutral-500 dark:text-neutral-400 leading-relaxed">
              This space is ready for your next sections — projects, experience, notes, or interactive demos.
            </p>
          </div>

          {/* Quick placeholder slots */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-4">
            <div className="p-3.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-neutral-900/50 flex flex-col items-center gap-1.5">
              <Code className="w-4 h-4 text-neutral-400" />
              <span className="text-[11px] font-mono text-neutral-500">projects</span>
            </div>
            <div className="p-3.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-neutral-900/50 flex flex-col items-center gap-1.5">
              <Layers className="w-4 h-4 text-neutral-400" />
              <span className="text-[11px] font-mono text-neutral-500">skills</span>
            </div>
            <div className="p-3.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-neutral-900/50 flex flex-col items-center gap-1.5">
              <FileText className="w-4 h-4 text-neutral-400" />
              <span className="text-[11px] font-mono text-neutral-500">writings</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
