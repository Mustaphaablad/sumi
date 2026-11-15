import Link from "next/link";
import type { Manga } from "@/lib/mangadex";
export default function Card({ m, w = "w-40" }: { m: Manga; w?: string }) {
  return (
    <Link href={`/manga/${m.id}`} className={`group block shrink-0 ${w}`} title={m.title}>
      <div className="relative aspect-[2/3] overflow-hidden bg-cream">
        {m.cover && <img src={m.cover} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
        <div className="absolute inset-x-0 bottom-0 translate-y-full border-l-4 border-shu bg-sumi/90 p-2 text-xs text-washi transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
          <p className="capitalize">{m.status}{m.year ? `, ${m.year}` : ""}</p>
          <p className="line-clamp-1 text-washi/70">{m.tags.slice(0, 3).join(", ")}</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 break-words font-serif text-sm leading-snug">{m.title}</p>
    </Link>
  );
}
