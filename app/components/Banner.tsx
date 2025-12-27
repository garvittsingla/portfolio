"use client";

import Image from "next/image";

export default function Banner() {
  return (
    <section className="w-full flex justify-center py-10">
      <div className="w-[90%] md:w-[60%] bg-black rounded-xl overflow-hidden border border-neutral-800 shadow-xl relative">

        {/* Banner Image */}
        <div className="relative h-[220px] md:h-[300px]">
          <Image
            src="/banner.jpg"
            alt="Banner"
            fill
            priority
            className="object-cover rounded-t-xl"
          />

          {/* Vignette effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90" />

          {/* Banner Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-xl italic font-light tracking-wide">
              Build · Ship · Learn · Repeat
            </p>
          </div>
        </div>

        {/* Profile + Info */}
        <div className="relative px-6 py-8">

          {/* Profile Image */}
          <div className="absolute -top-12 left-8">
            <Image
              src="/pfp.png"
              alt="profile"
              width={95}
              height={95}
              className="rounded-full border-4 border-black shadow-lg"
            />
          </div>

          {/* Name + Role */}
          <div className="mt-10 ml-28">
            <h1 className="text-3xl font-serif text-white">Your Name</h1>
            <p className="text-sm text-zinc-400">21 • developer • builder</p>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 mt-4 ml-28 opacity-70 hover:opacity-100 text-white text-xl">
            <a href="#" target="_blank">🌐</a>
            <a href="#" target="_blank">📂</a>
            <a href="#" target="_blank">🔗</a>
            <a href="#" target="_blank">💼</a>
          </div>
        </div>

        {/* About Section */}
        <div className="border-t border-neutral-800 p-6 text-zinc-300 leading-relaxed text-[15px]">
          <p>
            <span className="text-white font-semibold">I build from zero.</span>
            &nbsp;Whether it’s frontend, backend, full-stack projects, or AI-powered products —
            I focus on delivering clean, user-loved experiences.
          </p>
        </div>
      </div>
    </section>
  );
}
