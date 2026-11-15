import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import Theme from "@/components/Theme";
import SearchBox from "@/components/SearchBox";
const serif = Shippori_Mincho({ weight: ["500", "700"], subsets: ["latin"], variable: "--f-serif" });
const sans = Zen_Kaku_Gothic_New({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--f-sans" });
export const metadata: Metadata = { title: { default: "Sumi — read manga", template: "%s · Sumi" }, description: "A quiet place to read manga, with progress that follows you." };
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen">
        <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--bg)]/95">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
            <Link href="/" className="font-serif text-2xl font-bold">墨 <span className="text-shu">Sumi</span></Link>
            <Link href="/search" className="text-sm">Explore</Link>
            <Link href="/search?order=latestUploadedChapter" className="hidden text-sm sm:block">Latest</Link>
            <Link href="/search?order=rating" className="hidden text-sm sm:block">Top rated</Link>
            <Link href="/library" className="text-sm">Library</Link>
            <div className="order-last w-full sm:order-none sm:ml-auto sm:w-72"><SearchBox /></div>
            <Theme />
          </nav>
        </header>
        <main>{children}</main>
        <footer className="mx-auto mt-24 max-w-6xl px-4 pb-10 text-xs text-mute">Catalog and chapters courtesy of MangaDex and the scanlation groups credited on each chapter.</footer>
      </body>
    </html>
  );
}
