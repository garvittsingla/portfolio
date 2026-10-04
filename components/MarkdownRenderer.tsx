"use client";

import React, { useState, useEffect } from "react";
import { Check, Copy, ExternalLink, ZoomIn, AlertCircle } from "lucide-react";

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-xl border border-neutral-300/80 dark:border-neutral-800 bg-[#1e1e24] dark:bg-[#0c0d12] shadow-sm overflow-hidden group">
      {/* Code Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700/60 bg-[#17171c] dark:bg-[#08090c] text-xs font-mono text-neutral-400">
        <span className="text-[11px] uppercase tracking-wider text-neutral-400">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-white transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="p-4 overflow-x-auto text-[13px] sm:text-[13.5px] font-mono leading-relaxed text-neutral-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Resolves an image path from Markdown:
 * - External URLs (http://, https://, //), data URIs, and blob URIs are kept intact.
 * - Leading relative navigation (./ or ../) is stripped.
 * - Explicit /public/ or public/ references are cleanly mapped to root /.
 * - Relative paths (e.g. "image.png" or "posters/extra.jpg") are prefixed with "/"
 *   so they resolve directly from the Next.js public/ folder.
 */
export function resolveImagePath(src: string): string {
  if (!src) return "";
  let cleanSrc = src.trim().replace(/\\/g, "/");

  // Keep external or special protocol URLs intact
  if (
    cleanSrc.startsWith("http://") ||
    cleanSrc.startsWith("https://") ||
    cleanSrc.startsWith("//") ||
    cleanSrc.startsWith("data:") ||
    cleanSrc.startsWith("blob:")
  ) {
    return cleanSrc;
  }

  // Strip leading relative path dots (e.g., ./ or ../ or ../../)
  cleanSrc = cleanSrc.replace(/^(\.\.\/|\.\/)+/, "");

  // If path starts with public/ or /public/, strip 'public'
  if (cleanSrc.startsWith("/public/")) {
    cleanSrc = cleanSrc.slice(7); // keep leading '/'
  } else if (cleanSrc.startsWith("public/")) {
    cleanSrc = cleanSrc.slice(6); // leaves '/...'
  }

  // Ensure leading slash so Next.js serves it from the public/ folder root
  if (!cleanSrc.startsWith("/")) {
    cleanSrc = "/" + cleanSrc;
  }

  return cleanSrc;
}

/**
 * Parses markdown image target like:
 * - `https://example.com/pic.png`
 * - `/posters/poster.jpg "Optional caption"`
 * - `<image with space.png> 'Single quoted title'`
 */
export function parseImageTarget(rawTarget: string): {
  src: string;
  title?: string;
} {
  const trimmed = rawTarget.trim();
  const titleMatch = trimmed.match(/^(.*?)\s+["']([^"']*)["']$/);
  if (titleMatch) {
    let src = titleMatch[1].trim();
    if (src.startsWith("<") && src.endsWith(">")) {
      src = src.slice(1, -1).trim();
    }
    return {
      src,
      title: titleMatch[2].trim(),
    };
  }

  let src = trimmed;
  if (src.startsWith("<") && src.endsWith(">")) {
    src = src.slice(1, -1).trim();
  }
  return { src };
}

/**
 * Parses raw HTML <img src="..." alt="..." title="..." width="..." height="..." />
 */
export function parseHtmlImgTag(imgTagString: string): {
  src: string;
  alt: string;
  title?: string;
  width?: string;
  height?: string;
} | null {
  const srcMatch = imgTagString.match(/\bsrc=["']([^"']+)["']/i);
  if (!srcMatch) return null;

  const altMatch = imgTagString.match(/\balt=["']([^"']*)["']/i);
  const titleMatch = imgTagString.match(/\btitle=["']([^"']*)["']/i);
  const widthMatch = imgTagString.match(/\bwidth=["']?([^"'\s>]+)["']?/i);
  const heightMatch = imgTagString.match(/\bheight=["']?([^"'\s>]+)["']?/i);

  return {
    src: srcMatch[1],
    alt: altMatch ? altMatch[1] : "",
    title: titleMatch ? titleMatch[1] : undefined,
    width: widthMatch ? widthMatch[1] : undefined,
    height: heightMatch ? heightMatch[1] : undefined,
  };
}

export function isStandaloneImageLine(rawLine: string): boolean {
  const line = rawLine.trim();
  if (line.match(/^\[!\[([^\]]*)\]\((.*?)\)\]\((.*?)\)$/)) return true;
  if (line.match(/^!\[([^\]]*)\]\((.*?)\)$/)) return true;
  if (line.match(/^<img\s+[^>]*\/?>$/i)) return true;
  return false;
}

interface ImageBlockProps {
  src: string;
  alt: string;
  title?: string;
  linkUrl?: string;
}

function ImageBlock({ src, alt, title, linkUrl }: ImageBlockProps) {
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const resolvedSrc = resolveImagePath(src);

  // Close lightbox modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Use title if provided; else use alt if informative (not a placeholder)
  const isGenericAlt = ["image", "img", "photo", "picture", "screenshot"].includes(
    (alt || "").toLowerCase().trim(),
  );
  const caption = title || (!isGenericAlt && alt ? alt.trim() : "");

  return (
    <>
      <figure className="my-8 flex flex-col items-center group w-full">
        <div className="relative w-full overflow-hidden rounded-xl border border-neutral-300/80 dark:border-neutral-800 bg-[#fbf9f4] dark:bg-[#121319] shadow-xs transition-all hover:border-neutral-400 dark:hover:border-neutral-700">
          {hasError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-amber-500/5 dark:bg-amber-400/5 border border-dashed border-amber-500/30 rounded-xl m-3">
              <AlertCircle className="w-7 h-7 text-amber-600 dark:text-amber-400 mb-2" />
              <p className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Unable to load image
              </p>
              <code className="mt-1 px-2 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-800 font-mono text-[11px] text-amber-700 dark:text-amber-300 break-all max-w-full">
                {src}
              </code>
              <p className="font-sans text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm">
                Place the image in the{" "}
                <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">
                  public/
                </span>{" "}
                folder (e.g.{" "}
                <span className="font-mono">
                  public/{src.replace(/^(\.\.\/|\.\/|\/)*public\/?/i, "").replace(/^\//, "")}
                </span>
                ) or verify the external URL.
              </p>
            </div>
          ) : linkUrl ? (
            <a
              href={linkUrl}
              target={linkUrl.startsWith("http") ? "_blank" : undefined}
              rel={linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
              className="block cursor-pointer overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedSrc}
                alt={alt || "Blog image"}
                title={title}
                loading="lazy"
                decoding="async"
                onError={() => setHasError(true)}
                className="mx-auto block max-w-full h-auto max-h-[600px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </a>
          ) : (
            <div className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedSrc}
                alt={alt || "Blog image"}
                title={title}
                loading="lazy"
                decoding="async"
                onClick={() => setIsOpen(true)}
                onError={() => setHasError(true)}
                className="mx-auto block max-w-full h-auto max-h-[600px] object-contain transition-transform duration-300 group-hover:scale-[1.01] cursor-zoom-in"
              />
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="p-1.5 rounded-lg bg-neutral-900/70 hover:bg-neutral-900 text-white backdrop-blur-md cursor-pointer transition-colors"
                  title="Zoom image"
                  aria-label="Zoom image"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <a
                  href={resolvedSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-neutral-900/70 hover:bg-neutral-900 text-white backdrop-blur-md cursor-pointer transition-colors"
                  title="Open original"
                  aria-label="Open original image in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {caption && (
          <figcaption className="mt-2.5 px-4 text-center font-mono text-xs text-neutral-500 dark:text-neutral-400">
            <span className="opacity-50 mr-1.5">▲</span>
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox Modal */}
      {isOpen && !hasError && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top controls bar */}
            <div className="w-full flex items-center justify-between pb-3 text-white/80 font-mono text-xs">
              <span className="truncate pr-4">{caption || alt || "Image Preview"}</span>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={resolvedSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Open original in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>original</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Close image modal"
                >
                  close [esc]
                </button>
              </div>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedSrc}
              alt={alt || "Image preview"}
              className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}

// Convert inline markdown formatting (bold, italic, inline code, links, inline images)
function renderInlineFormatting(text: string): React.ReactNode {
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // 1. Linked image: [![alt](imgUrl)](linkUrl)
    const linkedImgMatch = remaining.match(
      /^\[!\[([^\]]*)\]\((.*?)\)\]\((.*?)\)/,
    );
    if (linkedImgMatch) {
      const alt = linkedImgMatch[1];
      const { src, title } = parseImageTarget(linkedImgMatch[2]);
      const linkUrl = linkedImgMatch[3];
      tokens.push(
        <a
          key={`inline-img-link-${keyIdx++}`}
          href={linkUrl}
          target={linkUrl.startsWith("http") ? "_blank" : undefined}
          rel={linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
          className="inline-flex items-center align-middle mx-1"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveImagePath(src)}
            alt={alt || "Image"}
            title={title}
            loading="lazy"
            decoding="async"
            className="inline-block max-h-48 max-w-full h-auto rounded-lg border border-neutral-300/80 dark:border-neutral-700/80 object-contain shadow-xs hover:border-neutral-500 transition-colors"
          />
        </a>,
      );
      remaining = remaining.slice(linkedImgMatch[0].length);
      continue;
    }

    // 2. Inline Markdown Image: ![alt](url)
    const imgMatch = remaining.match(/^!\[([^\]]*)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const { src, title } = parseImageTarget(imgMatch[2]);
      tokens.push(
        <span
          key={`inline-img-${keyIdx++}`}
          className="inline-flex items-center align-middle mx-1"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveImagePath(src)}
            alt={alt || "Image"}
            title={title}
            loading="lazy"
            decoding="async"
            className="inline-block max-h-48 max-w-full h-auto rounded-lg border border-neutral-300/80 dark:border-neutral-700/80 object-contain shadow-xs"
          />
        </span>,
      );
      remaining = remaining.slice(imgMatch[0].length);
      continue;
    }

    // 3. Inline HTML <img ...> tag
    const htmlImgMatch = remaining.match(/^<img\s+([^>]*?)\/?>/i);
    if (htmlImgMatch) {
      const parsed = parseHtmlImgTag(htmlImgMatch[0]);
      if (parsed) {
        tokens.push(
          <span
            key={`inline-html-img-${keyIdx++}`}
            className="inline-flex items-center align-middle mx-1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImagePath(parsed.src)}
              alt={parsed.alt || "Image"}
              title={parsed.title}
              width={parsed.width}
              height={parsed.height}
              loading="lazy"
              decoding="async"
              className="inline-block max-h-48 max-w-full h-auto rounded-lg border border-neutral-300/80 dark:border-neutral-700/80 object-contain shadow-xs"
            />
          </span>,
        );
      }
      remaining = remaining.slice(htmlImgMatch[0].length);
      continue;
    }

    // 4. Link: [label](url)
    const linkMatch = remaining.match(/^\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      tokens.push(
        <a
          key={`link-${keyIdx++}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-sky-400 underline decoration-blue-400/40 hover:decoration-blue-600 dark:hover:decoration-sky-300 underline-offset-3 font-medium transition-colors"
        >
          {renderInlineFormatting(linkMatch[1])}
        </a>,
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // 5. Inline Code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push(
        <code
          key={`code-${keyIdx++}`}
          className="px-1.5 py-0.5 rounded-md font-mono text-[12.5px] bg-neutral-200/70 dark:bg-[#161720] text-neutral-800 dark:text-[#f3f4f6] border border-neutral-300/80 dark:border-neutral-700/80"
        >
          {codeMatch[1]}
        </code>,
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // 6. Bold: **bold** or __bold__
    const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
    if (boldMatch) {
      tokens.push(
        <strong
          key={`bold-${keyIdx++}`}
          className="font-semibold text-neutral-900 dark:text-white"
        >
          {boldMatch[2]}
        </strong>,
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // 7. Italic: *italic* or _italic_
    const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
    if (italicMatch) {
      tokens.push(
        <em key={`italic-${keyIdx++}`} className="italic text-neutral-800 dark:text-neutral-200">
          {italicMatch[2]}
        </em>,
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Normal text chunk up to next special character
    const nextSpecial = remaining.search(/[`*_[\]!]|<img/i);
    if (nextSpecial === -1) {
      tokens.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // Unmatched special char, take 1 char
      tokens.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      tokens.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return tokens;
}

export function MarkdownRenderer({ content }: { content: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Code blocks: ```language ... ```
    if (line.trim().startsWith("```")) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      blocks.push(
        <CodeBlock
          key={`code-${blockKey++}`}
          language={language}
          code={codeLines.join("\n")}
        />,
      );
      continue;
    }

    // 2. Horizontal divider: --- or ***
    if (line.trim() === "---" || line.trim() === "***") {
      blocks.push(
        <hr
          key={`hr-${blockKey++}`}
          className="my-8 border-t border-dashed border-neutral-300 dark:border-neutral-800"
        />,
      );
      i++;
      continue;
    }

    // 3. Headings: #, ##, ###, ####
    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].replace(/\*\*/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      if (level === 1) {
        blocks.push(
          <h1
            id={id}
            key={`h1-${blockKey++}`}
            className="group relative mt-12 mb-5 text-2.5xl sm:text-3.5xl font-extrabold font-sans text-neutral-900 dark:text-white tracking-tight scroll-mt-24 flex items-center gap-2"
          >
            <span>{renderInlineFormatting(text)}</span>
            <a
              href={`#${id}`}
              aria-label="Link to section"
              className="opacity-0 group-hover:opacity-40 hover:!opacity-100 text-neutral-400 dark:text-neutral-500 font-mono text-sm transition-opacity"
            >
              #
            </a>
          </h1>,
        );
      } else if (level === 2) {
        blocks.push(
          <h2
            id={id}
            key={`h2-${blockKey++}`}
            className="group relative mt-11 mb-4 text-xl sm:text-2xl font-bold font-sans text-neutral-900 dark:text-white tracking-tight scroll-mt-24 flex items-center gap-2"
          >
            <span>{renderInlineFormatting(text)}</span>
            <a
              href={`#${id}`}
              aria-label="Link to section"
              className="opacity-0 group-hover:opacity-40 hover:!opacity-100 text-neutral-400 dark:text-neutral-500 font-mono text-sm transition-opacity"
            >
              #
            </a>
          </h2>,
        );
      } else if (level === 3) {
        blocks.push(
          <h3
            id={id}
            key={`h3-${blockKey++}`}
            className="mt-8 mb-3 text-lg sm:text-xl font-semibold font-sans text-neutral-800 dark:text-neutral-100 tracking-tight scroll-mt-24"
          >
            {renderInlineFormatting(text)}
          </h3>,
        );
      } else {
        blocks.push(
          <h4
            id={id}
            key={`h4-${blockKey++}`}
            className="mt-6 mb-2.5 text-base sm:text-lg font-semibold font-sans text-neutral-800 dark:text-neutral-100 tracking-tight scroll-mt-24"
          >
            {renderInlineFormatting(text)}
          </h4>,
        );
      }
      i++;
      continue;
    }

    // 4. Standalone Image: ![alt](url), [![alt](url)](link), or <img ... />
    if (isStandaloneImageLine(line)) {
      const trimmed = line.trim();

      // Case A: Linked image [![alt](imgUrl)](linkUrl)
      const linkedImgMatch = trimmed.match(
        /^\[!\[([^\]]*)\]\((.*?)\)\]\((.*?)\)$/,
      );
      if (linkedImgMatch) {
        const alt = linkedImgMatch[1];
        const { src, title } = parseImageTarget(linkedImgMatch[2]);
        const linkUrl = linkedImgMatch[3];
        blocks.push(
          <ImageBlock
            key={`img-${blockKey++}`}
            src={src}
            alt={alt}
            title={title}
            linkUrl={linkUrl}
          />,
        );
        i++;
        continue;
      }

      // Case B: Markdown Image ![alt](url)
      const imgMatch = trimmed.match(/^!\[([^\]]*)\]\((.*?)\)$/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const { src, title } = parseImageTarget(imgMatch[2]);
        blocks.push(
          <ImageBlock
            key={`img-${blockKey++}`}
            src={src}
            alt={alt}
            title={title}
          />,
        );
        i++;
        continue;
      }

      // Case C: HTML Image <img ... />
      const htmlImgMatch = trimmed.match(/^<img\s+[^>]*\/?>$/i);
      if (htmlImgMatch) {
        const parsed = parseHtmlImgTag(htmlImgMatch[0]);
        if (parsed) {
          blocks.push(
            <ImageBlock
              key={`img-${blockKey++}`}
              src={parsed.src}
              alt={parsed.alt}
              title={parsed.title}
            />,
          );
        }
        i++;
        continue;
      }
    }

    // 5. Blockquotes: > quote
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={`quote-${blockKey++}`}
          className="my-6 pl-4 sm:pl-5 border-l-3 border-amber-500/80 dark:border-amber-400/80 bg-amber-500/5 dark:bg-amber-400/[0.07] py-3 pr-4 rounded-r-lg font-serif italic text-[15.5px] sm:text-[16.5px] text-neutral-700 dark:text-[#e4e5eb] leading-[1.75]"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className={qIdx > 0 ? "mt-2" : ""}>
              {renderInlineFormatting(ql)}
            </p>
          ))}
        </blockquote>,
      );
      continue;
    }

    // 6. Unordered List: - item or * item
    if (line.trim().match(/^[-*]\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^[-*]\s+/)) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul
          key={`ul-${blockKey++}`}
          className="my-5 space-y-2.5 pl-6 list-disc text-neutral-700 dark:text-[#e4e5eb] text-[15.5px] sm:text-[16.5px] leading-[1.8] dark:marker:text-neutral-400"
        >
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // 7. Ordered List: 1. item
    if (line.trim().match(/^\d+\.\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol
          key={`ol-${blockKey++}`}
          className="my-5 space-y-2.5 pl-6 list-decimal text-neutral-700 dark:text-[#e4e5eb] text-[15.5px] sm:text-[16.5px] leading-[1.8] dark:marker:text-neutral-400"
        >
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // 8. Table: | col | col |
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerRow = tableLines[0]
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
        // row 1 is separator | :--- | :--- |
        const dataRows = tableLines.slice(2).map((row) =>
          row
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim()),
        );

        blocks.push(
          <div key={`table-${blockKey++}`} className="my-6 overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse rounded-xl overflow-hidden border border-neutral-300/80 dark:border-neutral-800">
              <thead>
                <tr className="bg-neutral-100/90 dark:bg-[#121319] border-b border-neutral-300/80 dark:border-neutral-700/80">
                  {headerRow.map((h, hIdx) => (
                    <th
                      key={hIdx}
                      className="px-3.5 py-2.5 font-mono font-semibold text-neutral-800 dark:text-neutral-100"
                    >
                      {renderInlineFormatting(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
                {dataRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-3.5 py-2.5 text-neutral-700 dark:text-[#e4e5eb] font-mono text-[12.5px]"
                      >
                        {renderInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
        continue;
      }
    }

    // 9. Empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // 10. Standard Paragraph
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().match(/^[-*]\s+/) &&
      !lines[i].trim().match(/^\d+\.\s+/) &&
      lines[i].trim() !== "---" &&
      lines[i].trim() !== "***" &&
      !lines[i].trim().startsWith("|") &&
      !isStandaloneImageLine(lines[i])
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      blocks.push(
        <p
          key={`p-${blockKey++}`}
          className="my-5 text-[15.5px] sm:text-[16.5px] leading-[1.8] sm:leading-[1.85] text-neutral-700 dark:text-[#e4e5eb] font-normal tracking-[0.01em]"
        >
          {renderInlineFormatting(paragraphLines.join(" "))}
        </p>,
      );
    }
  }

  return <div className="blog-prose w-full">{blocks}</div>;
}
