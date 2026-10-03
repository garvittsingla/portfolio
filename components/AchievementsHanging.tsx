"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Award, MoveHorizontal, Trophy } from "lucide-react";

const achievements = [
  {
    title: "Pinnacle Performer Award",
    event: "Avinya 3.0 · ZenithLabs",
    detail: "Built Voxel, a collaborative multiplayer browser game with live player sync, chat, and drawing.",
    badge: "podium finish",
    image: "/achievement-avinya.jpg",
    href: "https://www.linkedin.com/posts/garvittsingla_after-a-long-gap-of-no-posting-heres-again-activity-7401679075288776705-LzBV",
    tint: "#f5e6c8",
    icon: Trophy,
  },
  {
    title: "2nd Place",
    event: "Tech Abhivyakti 3.0 · Chitkara University · May 2025",
    detail: "Secured second place at the Tech Abhivyakti 3.0 hackathon.",
    badge: "runner-up",
    image: "/achievement-tech-abhivyakti.jpg",
    href: "https://www.linkedin.com/in/garvittsingla",
    tint: "#dce8f4",
    icon: Award,
  },
  {
    title: "3rd Place · Technovision 4.0",
    event: "DICE · Chitkara University · May 2025",
    detail: "Placed third at the annual innovation challenge after building and pitching an end-to-end software solution.",
    badge: "third place",
    image: "/achievement-technovision.jpg",
    href: "https://www.linkedin.com/posts/garvittsingla_technovision4-chitkarauniversity-dice-activity-7334695333765005312-eCOf",
    tint: "#dfe9d6",
    icon: Award,
  },
];

export function AchievementsHanging() {
  const [flipped, setFlipped] = useState<number | null>(null);
  const [swinging, setSwinging] = useState<{ index: number; angle: number } | null>(null);
  const [pull, setPull] = useState<{ index: number; startX: number; rotation: number } | null>(null);
  const dragged = useRef(false);

  return (
    <section id="achievements" aria-label="Achievements" className="relative mb-20 mt-16 w-full scroll-mt-28 overflow-hidden pb-5 pt-5 sm:mt-20 sm:pb-8">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="mb-1 flex items-end justify-between">
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">little milestones · pinned up</p>
            <h2 className="font-handwriting text-2xl text-neutral-800 dark:text-neutral-100 sm:text-3xl">achievements</h2>
          </div>
          {/*<span className="hidden items-center gap-1.5 pb-1 font-mono text-[10px] text-neutral-400 dark:text-neutral-500 sm:flex"><MoveHorizontal size={13} /> tug a photo to swing it</span>*/}
        </div>
      </div>

      <div className="achievement-wire relative mt-1 min-h-[465px] sm:min-h-[390px]">
        <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-20 w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1200 90">
          <path className="achievement-cord-shadow" d="M-20 4 Q600 82 1220 4" fill="none" strokeWidth="5" />
          <path className="achievement-cord" d="M-20 2 Q600 80 1220 2" fill="none" strokeWidth="2" />
          <path d="M-20 0 Q600 78 1220 0" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth=".8" />
          {[ [100, 14], [225, 25], [350, 33], [475, 38], [600, 41], [725, 38], [850, 33], [975, 25], [1100, 14] ].map(([x, y], i) => (
            <g key={x} className="rope-light" style={{ "--light-delay": `${i * 170}ms` } as React.CSSProperties}>
              <circle cx={x} cy={y} r="8" className="rope-light-halo" />
              <circle cx={x} cy={y} r="2.7" className="rope-light-bulb" />
              <circle cx={x} cy={y} r="1" fill="white" opacity=".9" />
            </g>
          ))}
        </svg>

        <div className="relative mx-auto grid max-w-5xl grid-cols-1 justify-items-center gap-y-2 px-3 pt-10 sm:grid-cols-3 sm:gap-0 sm:px-8 sm:pt-8">
          {achievements.map((item, index) => {
            const Icon = item.icon;
            const isFlipped = flipped === index;
            const pegOffset = index === 0 ? "sm:mt-1" : index === 1 ? "sm:mt-8" : "sm:mt-1";
            return (
              <div key={item.title} className={`achievement-hanger relative ${pegOffset} ${swinging?.index === index ? "achievement-swing" : ""}`} style={{
                "--card-delay": `${index * 180}ms`,
                "--card-tilt": index === 0 ? "-4deg" : index === 1 ? "2deg" : "4deg",
                "--pull-angle": `${swinging?.index === index ? swinging.angle : 0}deg`,
                "--swing-back": `${swinging?.index === index ? -swinging.angle * .38 : 0}deg`,
                "--swing-forward": `${swinging?.index === index ? swinging.angle * .2 : 0}deg`,
                "--swing-back-small": `${swinging?.index === index ? -swinging.angle * .1 : 0}deg`,
                "--swing-forward-small": `${swinging?.index === index ? swinging.angle * .045 : 0}deg`,
              } as React.CSSProperties}>
                <span aria-hidden="true" className="achievement-pin absolute left-1/2 top-[-26px] z-20 h-8 w-px -translate-x-1/2" />
                <div
                  role="group"
                  onPointerDown={(event) => {
                    if (event.pointerType === "mouse") event.currentTarget.setPointerCapture(event.pointerId);
                    setPull({ index, startX: event.clientX, rotation: 0 });
                  }}
                  onPointerMove={(event) => {
                    if (pull?.index === index) {
                      const amount = Math.max(-14, Math.min(14, (event.clientX - pull.startX) * 0.22));
                      if (Math.abs(amount) > 2) dragged.current = true;
                      setPull({ ...pull, rotation: amount });
                    }
                  }}
                  onPointerUp={() => {
                    if (pull?.index === index) {
                      setPull(null);
                      setSwinging({ index, angle: pull.rotation });
                      window.setTimeout(() => setSwinging((current) => current?.index === index ? null : current), 1450);
                    }
                  }}
                  onPointerCancel={() => setPull(null)}
                  className={`polaroid group relative block w-[min(78vw,260px)] cursor-grab touch-pan-y select-none text-left active:cursor-grabbing sm:w-[250px] ${isFlipped ? "polaroid-flipped" : ""}`}
                  style={{ transform: pull?.index === index ? `rotate(${pull.rotation}deg)` : undefined, backgroundColor: item.tint }}
                >
                  <button type="button" inert={isFlipped} aria-hidden={isFlipped} aria-label={`${isFlipped ? "Show photo for" : "Show details for"} ${item.title}`} onClick={() => {
                    if (dragged.current) { dragged.current = false; return; }
                    setFlipped(isFlipped ? null : index);
                  }} className="polaroid-face polaroid-front block w-full p-2.5 pb-0.5 text-left sm:p-3 sm:pb-1">
                    <span className="relative block aspect-[1.16/1] overflow-hidden bg-white/50">
                      {item.image ? (
                        <Image src={item.image} alt={`${item.title} event photo`} fill sizes="(max-width: 640px) 78vw, 250px" draggable={false} className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                      ) : null}
                      <span className="absolute right-2 top-2 rounded-full border border-white/40 bg-black/40 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-white backdrop-blur-sm">{item.badge}</span>
                    </span>
                    <span className="flex min-h-[67px] flex-col justify-center px-1 pb-2 pt-2.5">
                      <span className="font-handwriting text-[15px] leading-tight text-neutral-800 sm:text-base">{item.title}</span>
                      <span className="mt-1 line-clamp-1 font-mono text-[8px] text-neutral-600 sm:text-[9px]">{item.event}</span>
                    </span>
                  </button>
                  <div className="polaroid-face polaroid-back absolute inset-0 flex flex-col justify-between p-5 text-neutral-800" aria-hidden={!isFlipped} inert={!isFlipped}>
                    <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-500"><Icon size={14} /> the story</span>
                    <span>
                      <span className="block font-handwriting text-lg leading-snug">{item.title}</span>
                      <span className="mt-2 block font-sans text-xs leading-relaxed text-neutral-600">{item.detail}</span>
                    </span>
                    <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()} className="inline-flex w-fit items-center gap-1.5 rounded-full border border-neutral-400/50 bg-white/45 px-3 py-1.5 font-mono text-[9px] hover:bg-white/80">
                      LinkedIn <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>
                <span aria-hidden="true" className="polaroid-shadow pointer-events-none absolute inset-x-2 bottom-[-8px] -z-10 h-5 rounded-[50%] bg-neutral-900/10 blur-md dark:bg-black/40" />
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-1 text-center font-mono text-[9px] text-neutral-400 dark:text-neutral-500 sm:hidden">tap a photo to turn it over · drag to swing</p>
    </section>
  );
}
