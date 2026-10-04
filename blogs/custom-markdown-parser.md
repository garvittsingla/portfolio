---
# ─────────────────────────────────────────────────────────────
# BLOG FRONTMATTER (Metadata)
# ─────────────────────────────────────────────────────────────
title: "Your Title Goes Here (e.g. Writing a Custom Markdown Parser in TypeScript)"
description: "A 1-2 sentence summary of your post. This appears on the blog cards, social preview, and search engines."
date: "Oct 4, 2026"
tags: ["Compilers", "TypeScript", "Markdown", "Parsing"]
readTime: "5 min read"
author: "Garvit Singla"

# Optional links: leave empty or remove if not applicable
githubUrl: "https://github.com/garvittsingla/your-repo-name"
xUrl: "https://x.com/garvitsinglaa/status/optional-tweet-id"

# Initial starting stats for the card (optional)
likes: 24
views: 310
---

<!-- 
=============================================================================
  TUTORIAL & BOILERPLATE: HOW TO WRITE YOUR BLOG POST
=============================================================================
Everything below the second '---' is your article body.
The custom engine automatically renders the elements below into the 
website's minimal notebook/paper theme.
=============================================================================
-->

Write your opening paragraph here. Introduce the core motivation, the problem you set out to solve, or what inspired you to build this project.

You can use **bold text** for emphasis, *italic text* for nuances, and inline code like `parseTokens()` or `ASTNode` to reference functions and types.

---

## 1. Top-Level Heading (Creates Table of Contents Item)

Use `## Heading Name` for main sections. The custom blog engine will automatically:
- Generate an anchor link (`#1-top-level-heading`)
- Add it to the interactive **Table of Contents** box at the top of the post

### 1.1 Sub-Heading Name

Use `### Sub-heading Name` for sub-sections. It is indented in the Table of Contents automatically.

---

## 2. Code Blocks with Syntax Copy Button

Use triple backticks followed by the language name (`cpp`, `ts`, `rust`, `bash`, `text`, `yaml`, `json`, etc.). 
The engine will render a dark slate card with:
- The language name in the top-left
- An interactive **copy button** in the top-right

```ts
// Example Code Block
interface Token {
  type: "heading" | "code" | "paragraph";
  content: string;
}

export function tokenize(source: string): Token[] {
  // Replace with your actual code
  return [];
}
```

Bash / Terminal Commands:

```bash
# How to run your build or tests
npm run dev
cargo run --release
```

---

## 3. Blockquotes and Callout Notes

Use `>` at the beginning of lines to create highlighted blockquote cards with warm borders and italics:

> *"Add a memorable takeaway, quote, or rule of thumb here. It gets styled with an amber callout border."*

---

## 4. Lists

Unordered bullet list (use `-` or `*`):
- First key insight or observation
- Second item with `inline code` or **bold**
- Third item linking to an external resource like [GitHub](https://github.com/garvittsingla)

Ordered numbered list (use `1.`, `2.`, `3.`):
1. Step one: initialize the parser state
2. Step two: loop through input lines
3. Step three: emit the final AST or React tree

---

## 5. Tables

Use standard markdown tables with pipe characters `|`:

| Feature | Syntax Example | Output Description |
| :--- | :--- | :--- |
| **Inline Code** | `` `const x = 1;` `` | Code chip with border |
| **Links** | `[Text](https://...)` | Interactive styled link |
| **Divider** | `---` | Dashed notebook paper line |

---

## 6. Images & Public Folder Referencing

You can embed images using standard Markdown syntax, custom captions, or direct references from the `public/` directory:

### Public Folder Direct References
Any image in the `public/` folder can be referenced directly using any of these formats:
- Absolute root path: `![Poster](/posters/poster-andes-flight.jpg)`
- Relative / bare path: `![Poster](posters/poster-andes-flight.jpg)`
- Explicit `public/` path: `![Poster](/public/posters/poster-andes-flight.jpg)`
- Dedicated blog images in `public/blogs/`: `![Diagram](/blogs/my-architecture.png)`

### Image with Custom Caption
Add quotes after the image path to display an interactive caption underneath:

```markdown
![Flight Poster](/posters/poster-andes-flight.jpg "Andes Flight — Visual Poster")
```

### Clickable / Linked Image
Wrap an image inside a markdown link to make it clickable:

```markdown
[![Doodle Book](/doodle-book.png)](https://github.com/garvittsingla)
```

### Live Image Example
![Motivational Poster](/posters/poster-andes-flight.jpg "Andes Flight — Always Go the Extra Mile")

Every image comes with an interactive **lightbox zoom modal** (click to inspect, press `esc` to close) and an external link to open the full-resolution asset.

---

## 7. Links and References

You can add inline links anywhere using `[anchor text](https://url)`:
- Check out the project repo: [garvittsingla/portfolio](https://github.com/garvittsingla/portfolio)
- Follow along on X: [@garvitsinglaa](https://x.com/garvitsinglaa)

---

## Conclusion & Next Steps

Summarize what you learned, open questions, and what you plan to build next.
The author signature box and "Share on X" buttons are automatically appended at the bottom of the page!
