import type { Metadata } from "next";
import { Geist, Geist_Mono, Gloria_Hallelujah } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const handwriting = Gloria_Hallelujah({
  variable: "--font-handwriting",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Garvit Singla — Software Engineer & Builder",
  description:
    "Personal portfolio of Garvit Singla (@garvittsingla). Systems programmer, C/C++, Rust, graphics, and software engineer.",
  keywords: [
    "Garvit Singla",
    "garvittsingla",
    "Software Engineer",
    "Systems Programming",
    "C++",
    "Rust",
    "Graphics",
  ],
  authors: [{ name: "Garvit Singla", url: "https://github.com/garvittsingla" }],
  openGraph: {
    title: "Garvit Singla — Software Engineer",
    description: "Systems programming, C/C++, Rust, graphics, and software engineering.",
    url: "https://github.com/garvittsingla",
    siteName: "Garvit Singla Portfolio",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

const themeInitScript = `
  (function() {
    try {
      var urlParams = new URLSearchParams(window.location.search);
      var themeParam = urlParams.get('theme');
      var saved = localStorage.getItem('portfolio_theme');
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = themeParam === 'dark' ? true : (themeParam === 'light' ? false : (saved === 'dark' || (!saved && prefersDark)));
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.setProperty('--background', '#090a0f');
        document.documentElement.style.setProperty('--foreground', '#fafafa');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.setProperty('--background', '#fdfbf7');
        document.documentElement.style.setProperty('--foreground', '#09090b');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${handwriting.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
