import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  Share2,
  Tag,
} from "lucide-react";
import { getAllBlogs, getBlogBySlug } from "@/lib/blog-engine";
import { DotGridBackground } from "@/components/DotGridBackground";
import { FloatingNavbar } from "@/components/FloatingNavbar";
import { FooterSection } from "@/components/FooterSection";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const blogs = await getAllBlogs();
  return blogs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found — Garvit Singla",
    };
  }

  return {
    title: `${post.title} — Garvit Singla`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export const revalidate = 60; // 1 minute ISR

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const allBlogs = await getAllBlogs();
  const currentIndex = allBlogs.findIndex((b) => b.slug === post.slug);
  const prevBlog = currentIndex > 0 ? allBlogs[currentIndex - 1] : null;
  const nextBlog =
    currentIndex !== -1 && currentIndex < allBlogs.length - 1
      ? allBlogs[currentIndex + 1]
      : null;

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-950 overflow-x-hidden">
      <DotGridBackground linesInDark />
      <FloatingNavbar />

      <main className="w-full flex-1 pt-[14vh] sm:pt-[16vh] pb-20">
        <article className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Top Breadcrumb & Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center justify-between font-mono text-xs text-neutral-500 dark:text-neutral-400"
          >
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>all blogs</span>
            </Link>

            <span className="font-handwriting text-xs text-neutral-400 dark:text-neutral-400">
              {post.readTime}
            </span>
          </nav>

          {/* Post Header Card */}
          <header className="mb-10 sm:mb-12 pb-8 border-b border-dashed border-[#e2d8c0] dark:border-neutral-800/80">
            {/* Tags row */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4 font-mono text-xs">
                <Tag className="w-3 h-3 text-neutral-400 dark:text-neutral-400" />
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-full border border-neutral-300/80 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 bg-[#faf6ea]/80 dark:bg-neutral-900/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="font-sans text-2.5xl sm:text-3.5xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.25]">
              {post.title}
            </h1>

            {/* Subtitle / Description */}
            {post.description && (
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-[#e4e5eb] font-normal">
                {post.description}
              </p>
            )}

            {/* Metadata Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-neutral-200/80 dark:border-neutral-800/80 font-mono text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-400" />
                  <span>{post.date}</span>
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-400" />
                  <span>{post.readTime}</span>
                </span>
                <span>·</span>
                <span className="font-handwriting text-neutral-700 dark:text-neutral-300 text-sm">
                  {post.author}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {post.githubUrl && (
                  <a
                    href={post.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-300/80 dark:border-neutral-700 text-[11px] hover:border-neutral-800 dark:hover:border-neutral-200 text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    <span>source on GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {post.xUrl && (
                  <a
                    href={post.xUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-300/80 dark:border-neutral-700 text-[11px] hover:border-neutral-800 dark:hover:border-neutral-200 text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    <span>view thread on X</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </header>

          {/* Quick Table of Contents (if 3+ headings) */}
          {post.headings && post.headings.length >= 2 && (
            <aside
              aria-label="Table of Contents"
              className="mb-10 p-5 rounded-2xl border border-[#e5decb] dark:border-neutral-800 bg-[#faf6ea]/60 dark:bg-[#101118]/80 shadow-xs"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-400 mb-2.5 font-medium">
                contents ↴
              </p>
              <ul className="space-y-1.5 text-xs sm:text-[13px] font-sans">
                {post.headings.map((h) => (
                  <li
                    key={h.id}
                    className={
                      h.level === 3
                        ? "pl-4 text-neutral-500 dark:text-neutral-400"
                        : "text-neutral-700 dark:text-neutral-200 font-medium"
                    }
                  >
                    <a
                      href={`#${h.id}`}
                      className="hover:underline hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Article Main Prose Body */}
          <div className="relative">
            <MarkdownRenderer content={post.content} />
          </div>

          {/* Post Footer & Author Signature */}
          <div className="mt-14 pt-8 border-t border-dashed border-[#e2d8c0] dark:border-neutral-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[#e5decb] dark:border-neutral-800 bg-[#faf6ea]/80 dark:bg-[#101118]/80">
              <div>
                <p className="font-handwriting text-base text-neutral-800 dark:text-neutral-200">
                  thanks for reading · garvit singla
                </p>
                <p className="mt-1 font-sans text-xs text-neutral-500 dark:text-neutral-400">
                  Written directly as markdown in the repository and rendered with our custom engine.
                </p>
              </div>

              {post.xUrl && (
                <a
                  href={`https://x.com/intent/tweet?url=${encodeURIComponent(
                    post.xUrl,
                  )}&text=${encodeURIComponent(
                    `Just read "${post.title}" by @garvitsinglaa:`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:scale-105 transition-transform shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>share on X</span>
                </a>
              )}
            </div>
          </div>

          {/* Previous / Next Article Navigation */}
          {(prevBlog || nextBlog) && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevBlog ? (
                <Link
                  href={`/blog/${prevBlog.slug}`}
                  className="group flex flex-col justify-between p-4 rounded-xl border border-neutral-300/80 dark:border-neutral-800 hover:border-neutral-500 dark:hover:border-neutral-700 transition-colors"
                >
                  <span className="font-mono text-[11px] text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                    <span>previous post</span>
                  </span>
                  <span className="mt-2 font-sans text-sm font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-1">
                    {prevBlog.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextBlog ? (
                <Link
                  href={`/blog/${nextBlog.slug}`}
                  className="group flex flex-col justify-between p-4 rounded-xl border border-neutral-300/80 dark:border-neutral-800 hover:border-neutral-500 dark:hover:border-neutral-700 transition-colors text-right"
                >
                  <span className="font-mono text-[11px] text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 flex items-center justify-end gap-1">
                    <span>next post</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <span className="mt-2 font-sans text-sm font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-1">
                    {nextBlog.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          )}
        </article>
      </main>

      <FooterSection />
    </div>
  );
}
