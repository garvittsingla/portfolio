"use client";

import React, { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Sliders, RotateCcw, X, Sparkles, Check } from "lucide-react";

export function DotGridCustomizer() {
  const {
    theme,
    dotConfig,
    setDotOpacity,
    setDotSize,
    setDotSpacing,
    resetDotConfig,
    backgroundStyle,
    setBackgroundStyle,
  } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Preset opacity levels
  const opacityPresets = [
    { label: "Ultra Subtle", value: 0.06 },
    { label: "Subtle (Default)", value: theme === "dark" ? 0.15 : 0.12 },
    { label: "Stationery", value: 0.20 },
    { label: "Crisp", value: 0.28 },
  ];

  // Preset spacing levels (for dots)
  const spacingPresets = [
    { label: "Compact (18px)", value: 18 },
    { label: "Standard (24px)", value: 24 },
    { label: "Spacious (32px)", value: 32 },
  ];

  // Preset dot sizes
  const sizePresets = [
    { label: "Fine (1.0px)", value: 1.0 },
    { label: "Default (1.2px)", value: 1.2 },
    { label: "Bold (1.8px)", value: 1.8 },
  ];

  return (
    <aside aria-label="Paper Background Tuner" className="fixed bottom-5 right-5 z-40">
      {/* Floating launcher trigger */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-mono
            bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md
            border border-neutral-200/80 dark:border-neutral-800
            shadow-lg shadow-neutral-900/5 hover:border-neutral-400 dark:hover:border-neutral-600
            text-neutral-700 dark:text-neutral-300
            transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open Paper Background Settings"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Sliders className="w-3.5 h-3.5 transition-transform group-hover:rotate-45" />
          <span>Paper Tuner</span>
          <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] text-neutral-500">
            {backgroundStyle === "lined" ? "lined" : `${Math.round(dotConfig.opacity * 100)}%`}
          </span>
        </button>
      )}

      {/* Expanded Customizer Modal / Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Paper Background Tuner Panel"
          className="w-80 rounded-2xl p-4
          bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl
          border border-neutral-200 dark:border-neutral-800
          shadow-2xl shadow-neutral-900/10 dark:shadow-black/40
          transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                Notebook Paper Background
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetDotConfig}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                title="Reset to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-3.5 space-y-4">
            {/* Background Style Switcher: Hand-Drawn Lined Paper vs Dot Grid */}
            <div>
              <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 block mb-1.5">
                Paper Style
              </span>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80">
                <button
                  type="button"
                  onClick={() => setBackgroundStyle("lined")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    backgroundStyle === "lined"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  <span>✎ Lined Paper</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBackgroundStyle("dots")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    backgroundStyle === "dots"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  <span>⸬ Dot Grid</span>
                </button>
              </div>
            </div>

            {/* Opacity / Transparency control */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-neutral-600 dark:text-neutral-400">
                  {backgroundStyle === "lined" ? "Line Subtlety" : "Transparency"}
                </span>
                <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  {Math.round(dotConfig.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.04"
                max="0.40"
                step="0.01"
                value={dotConfig.opacity}
                onChange={(e) => setDotOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-white"
              />
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {opacityPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setDotOpacity(preset.value)}
                    className={`px-2 py-1 text-[11px] rounded font-mono transition-colors text-left truncate flex items-center justify-between cursor-pointer
                      ${
                        Math.abs(dotConfig.opacity - preset.value) < 0.02
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold"
                          : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                  >
                    <span>{preset.label}</span>
                    {Math.abs(dotConfig.opacity - preset.value) < 0.02 && (
                      <Check className="w-2.5 h-2.5 shrink-0 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* If in Dot Grid mode, show Spacing & Size options */}
            {backgroundStyle === "dots" && (
              <>
                {/* Grid Spacing */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-neutral-600 dark:text-neutral-400">Grid Spacing</span>
                    <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                      {dotConfig.spacing}px
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {spacingPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setDotSpacing(preset.value)}
                        className={`flex-1 py-1 px-2 text-[11px] font-mono rounded transition-colors text-center cursor-pointer
                          ${
                            dotConfig.spacing === preset.value
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          }`}
                      >
                        {preset.value}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dot Size */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-neutral-600 dark:text-neutral-400">Dot Size</span>
                    <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                      {dotConfig.size}px
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {sizePresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setDotSize(preset.value)}
                        className={`flex-1 py-1 px-2 text-[11px] font-mono rounded transition-colors text-center cursor-pointer
                          ${
                            Math.abs(dotConfig.size - preset.value) < 0.1
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          }`}
                      >
                        {preset.value}px
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Helper note */}
            <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-[10px] text-neutral-500 font-mono leading-relaxed">
              ✦ Hand-drawn ruled notebook paper with authentic Catmull-Rom vector curves.
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
