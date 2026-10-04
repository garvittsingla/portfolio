"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

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

// Convert inline markdown formatting (bold, italic, inline code, links)
function renderInlineFormatting(text: string): React.ReactNode {
  // Regex to match inline code, bold, italic, and links
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // 1. Link: [label](url)
    const linkMatch = remaining.match(/^\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      tokens.push(
        <a
          key={`link-${keyIdx++}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-sky-400 underline decoration-blue-400/40 hover:decoration-blue-600 dark:hover:decoration-sky-300 font-medium transition-colors"
        >
          {linkMatch[1]}
        </a>,
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // 2. Inline Code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push(
        <code
          key={`code-${keyIdx++}`}
          className="px-1.5 py-0.5 rounded-md font-mono text-[12.5px] bg-neutral-200/70 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300/80 dark:border-neutral-700/80"
        >
          {codeMatch[1]}
        </code>,
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // 3. Bold: **bold** or __bold__
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

    // 4. Italic: *italic* or _italic_
    const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
    if (italicMatch) {
      tokens.push(
        <em key={`italic-${keyIdx++}`} className="italic">
          {italicMatch[2]}
        </em>,
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Normal text chunk up to next special character
    const nextSpecial = remaining.search(/[`*_[\]]/);
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

    // 3. Headings: ## and ###
    const h2Match = line.match(/^##\s+(.*)$/);
    if (h2Match) {
      const text = h2Match[1].replace(/\*\*/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      blocks.push(
        <h2
          id={id}
          key={`h2-${blockKey++}`}
          className="group relative mt-10 mb-4 text-xl sm:text-2xl font-bold font-sans text-neutral-900 dark:text-neutral-100 tracking-tight scroll-mt-24 flex items-center gap-2"
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
      i++;
      continue;
    }

    const h3Match = line.match(/^###\s+(.*)$/);
    if (h3Match) {
      const text = h3Match[1].replace(/\*\*/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      blocks.push(
        <h3
          id={id}
          key={`h3-${blockKey++}`}
          className="mt-7 mb-3 text-lg sm:text-xl font-semibold font-sans text-neutral-800 dark:text-neutral-200 tracking-tight scroll-mt-24"
        >
          {renderInlineFormatting(text)}
        </h3>,
      );
      i++;
      continue;
    }

    // 4. Blockquotes: > quote
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={`quote-${blockKey++}`}
          className="my-5 pl-4 sm:pl-5 border-l-3 border-amber-500/80 dark:border-amber-400/60 bg-amber-500/5 dark:bg-amber-400/5 py-2.5 pr-4 rounded-r-lg font-serif italic text-[15px] sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed"
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

    // 5. Unordered List: - item or * item
    if (line.trim().match(/^[-*]\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^[-*]\s+/)) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul
          key={`ul-${blockKey++}`}
          className="my-4 space-y-2 pl-5 list-disc text-neutral-700 dark:text-neutral-300 text-[15px] sm:text-base leading-relaxed"
        >
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // 6. Ordered List: 1. item
    if (line.trim().match(/^\d+\.\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol
          key={`ol-${blockKey++}`}
          className="my-4 space-y-2 pl-5 list-decimal text-neutral-700 dark:text-neutral-300 text-[15px] sm:text-base leading-relaxed"
        >
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // 7. Table: | col | col |
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
                <tr className="bg-neutral-100/90 dark:bg-neutral-800/80 border-b border-neutral-300/80 dark:border-neutral-700">
                  {headerRow.map((h, hIdx) => (
                    <th
                      key={hIdx}
                      className="px-3.5 py-2.5 font-mono font-semibold text-neutral-800 dark:text-neutral-200"
                    >
                      {renderInlineFormatting(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {dataRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-3.5 py-2 text-neutral-700 dark:text-neutral-300 font-mono text-[12.5px]"
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

    // 8. Empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // 9. Standard Paragraph
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
      !lines[i].trim().startsWith("|")
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    blocks.push(
      <p
        key={`p-${blockKey++}`}
        className="my-4 text-[15px] sm:text-base leading-[1.75] text-neutral-700 dark:text-neutral-300"
      >
        {renderInlineFormatting(paragraphLines.join(" "))}
      </p>,
    );
  }

  return <div className="blog-prose w-full">{blocks}</div>;
}
