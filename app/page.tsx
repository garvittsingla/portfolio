"use client";

import React from "react";
import { DotGridBackground } from "@/components/DotGridBackground";
import { DotGridCustomizer } from "@/components/DotGridCustomizer";
import { FloatingNavbar } from "@/components/FloatingNavbar";
import { FloatingNotebookDoodles } from "@/components/FloatingNotebookDoodles";
import { NotebookIntro } from "@/components/NotebookIntro";
import { EmptySection } from "@/components/EmptySection";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-950 overflow-x-hidden">
      {/* Background vector dot grid with theme transitions */}
      <DotGridBackground />

      {/* Persistent floating notebook doodles on left side of viewport */}
      <FloatingNotebookDoodles />

      {/* Top Navbar that shrinks into a floating glassmorphic pill on scroll */}
      <FloatingNavbar />

      {/* Main Content Area */}
      <main className="w-full flex-1 pt-[12vh] sm:pt-[14vh]">
        {/* Intro section positioned closer to top */}
        <div id="intro">
          <NotebookIntro />
        </div>

        {/* Empty component below providing scroll depth and future space */}
        <EmptySection />
      </main>

      {/* Dot Grid Background Control Panel */}
      <DotGridCustomizer />
    </div>
  );
}
