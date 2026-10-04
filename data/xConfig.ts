export const X_USERNAME = "garvitsinglaa";
export const X_PROFILE_URL = `https://x.com/${X_USERNAME}`;
export const X_ARTICLES_CACHE_KEY = "x_articles_v2";
export const X_ARTICLES_FETCH_COUNT = 10;

export interface FallbackArticle {
  id: string;
  title: string;
  preview: string;
  date: string;
  likes: number;
  views: number;
  url: string;
  tags: string[];
  noteColor: "yellow" | "mint" | "coral" | "sky";
  highlight: string;
  noteAngle: number;
}

export const FALLBACK_X_ARTICLES: FallbackArticle[] = [
  {
    id: "2065482303347085350",
    title: "You suck at Subnetting",
    preview:
      "I was studying for my Computer Networks exam, and I came to know about this amazing topic! Subnetting — how can the same IPv4 address range be divided across organizations and subnets efficiently without wasting host blocks.",
    date: "Jun 2026",
    likes: 18,
    views: 460,
    url: "https://x.com/garvitsinglaa/status/2065482303347085350",
    tags: ["Networking", "Subnetting", "Systems"],
    noteColor: "yellow",
    highlight: "divide IP blocks like a pro",
    noteAngle: -1.8,
  },
  {
    id: "2057192335398912116",
    title: "How to actually win in life (Real world experiment)",
    preview:
      "In a world of self-interest and working for self belief, how does cooperation even come into the picture? Why would you cooperate in a world of selfishness? The answer lies in Axelrod's iterated prisoner dilemma experiment.",
    date: "May 2026",
    likes: 24,
    views: 520,
    url: "https://x.com/garvitsinglaa/status/2057192335398912116",
    tags: ["Game Theory", "Life", "Psychology"],
    noteColor: "mint",
    highlight: "tit-for-tat & why cooperation wins",
    noteAngle: 1.5,
  },
  {
    id: "2056971098999402611",
    title: "GitHub Actions for dummies",
    preview:
      "Have you ever thought about how big tech companies manage to push code into production so seamlessly? How do they ensure thousands of test cases run automatically and catch issues before users do?",
    date: "May 2026",
    likes: 19,
    views: 480,
    url: "https://x.com/garvitsinglaa/status/2056971098999402611",
    tags: ["DevOps", "CI/CD", "Automation"],
    noteColor: "coral",
    highlight: "automating CI/CD pipelines effortlessly",
    noteAngle: -1.2,
  },
];
