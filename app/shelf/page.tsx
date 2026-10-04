"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, BookOpen, ShoppingBag } from "lucide-react";
import { DotGridBackground } from "@/components/DotGridBackground";
import { FloatingNavbar } from "@/components/FloatingNavbar";
import { FooterSection } from "@/components/FooterSection";
import { RoughDeskInstruments } from "@/components/RoughDeskInstruments";
import { SHELF_BOOKS, ShelfBook } from "@/data/shelfBooks";

// Playful tactile tap sound
function playTap() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const bufferSize = Math.floor(ctx.sampleRate * 0.035);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2600;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    noise.onended = () => ctx.close().catch(() => {});
  } catch {}
}

export default function ShelfPage() {
  return (
    <div className="relative min-h-screen flex flex-col selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-950 overflow-x-hidden">
      {/* Background vector dot grid with lined paper transition */}
      <DotGridBackground linesInDark />

      {/* Floating drafting instruments randomly along the left & right borders (rough.js) */}
      <RoughDeskInstruments />

      {/* Floating Navbar */}
      <FloatingNavbar />

      <main className="w-full flex-1 pt-[13vh] sm:pt-[15vh] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Top breadcrumb & back button */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              onClick={playTap}
              className="inline-flex items-center gap-2 font-mono text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>back to portfolio</span>
            </Link>

            {/*<span className="font-handwriting text-xs text-neutral-400 dark:text-neutral-500 rotate-[-1deg]">
              ~ field reading log v1.0
            </span>*/}
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                personal library · on my desk
              </p>
            </div>

            <h1 className="font-handwriting text-3xl sm:text-4xl md:text-5xl text-neutral-900 dark:text-neutral-100">
              currently reading
            </h1>
          </div>

          {/* MAIN NOTEBOOK CARD */}
          <div className="relative overflow-hidden rounded-3xl border border-[#e5decb] dark:border-neutral-800 bg-[#faf6ea]/95 dark:bg-[#121319]/95 shadow-[0_12px_36px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
            {/* Paper Noise & Grid Overlay */}
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

            {/* Notebook top bar */}
            <div className="relative z-10 px-6 py-4 border-b border-[#e2d8c0] dark:border-neutral-800 flex items-center justify-between bg-white/30 dark:bg-black/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/80 inline-block" />
                <span className="ml-2 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                  /shelf · 3 active books
                </span>
              </div>
            </div>

            {/* Book Entries List: image, title, author, subheadings & tags, Goodreads & Amazon links */}
            <div className="relative z-10 divide-y divide-dashed divide-neutral-300/80 dark:divide-neutral-700/80">
              {SHELF_BOOKS.map((book) => (
                <BookItem key={book.id} book={book} />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
}

function BookItem({ book }: { book: ShelfBook }) {
  return (
    <article className="group relative block px-6 py-6 sm:px-8 sm:py-7 transition-colors hover:bg-white/50 dark:hover:bg-white/[.03]">
      <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6">
        {/* Book Cover Front Page Thumbnail */}
        <div className="relative shrink-0 w-22 sm:w-28 group-hover:scale-105 transition-transform duration-300 self-start">
          <div className="relative overflow-hidden rounded-xs border-2 border-white dark:border-neutral-700 shadow-[0_4px_14px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_18px_rgba(0,0,0,0.5)] bg-neutral-100 dark:bg-neutral-800 aspect-[2/3]">
            <Image
              src={book.coverImage}
              alt={`${book.title} cover`}
              fill
              sizes="(max-width: 640px) 88px, 112px"
              className="object-cover"
              priority
            />
            {/* Vintage paper texture overlay */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none opacity-15 mix-blend-multiply dark:mix-blend-screen"
              style={{
                backgroundImage: "radial-gradient(#000 0.5px, transparent 0.5px)",
                backgroundSize: "3px 3px",
              }}
            />
          </div>
        </div>

        {/* Book Details */}
        <div className="flex-1 min-w-0">
          {/* Title & Author */}
          <h2 className="font-handwriting text-xl sm:text-2.5xl text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
            {book.title}
          </h2>

          <p className="mt-1 font-mono text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            by {book.author}
          </p>

          {/* Subheadings / Topic Badges in White Box Style */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
            {book.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-sm font-mono text-[10px] sm:text-[11px] uppercase tracking-wider
                  bg-white/90 dark:bg-neutral-800/90
                  text-neutral-700 dark:text-neutral-300
                  border border-neutral-200/90 dark:border-neutral-700/70
                  shadow-2xs"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Goodreads & Amazon Direct Links */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <a
              href={book.goodreadsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playTap}
              className="group/link inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono
                bg-white/80 dark:bg-neutral-800/80
                border border-neutral-200 dark:border-neutral-700
                text-neutral-700 dark:text-neutral-300
                hover:text-amber-800 dark:hover:text-amber-300
                hover:border-amber-400 dark:hover:border-amber-500
                hover:scale-105 active:scale-95 transition-all shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Goodreads</span>
              <ArrowUpRight className="w-3 h-3 opacity-60 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href={book.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playTap}
              className="group/buy inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium
                bg-neutral-900 text-white dark:bg-white dark:text-neutral-900
                hover:bg-amber-600 dark:hover:bg-amber-400 dark:hover:text-neutral-950
                hover:scale-105 active:scale-95 transition-all shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buy on Amazon</span>
              <ArrowUpRight className="w-3 h-3 opacity-70 group-hover/buy:translate-x-0.5 group-hover/buy:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
