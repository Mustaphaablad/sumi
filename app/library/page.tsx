"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { library, allProgress, type Entry } from "@/lib/store";
export default function Library() {
  const [lib, setLib] = useState<Entry[]>([]); const [prog, setProg] = useState<Record<string, any>>({});
  useEffect(() => { setLib(library()); setProg(Object.fromEntries(allProgress().map((p) => [p.id, p]))); }, []);
  const lists = ["Reading", "Plan to read", "Completed", "On hold", "Dropped", "Favorites"];
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl">Your library</h1>
      <p className="mt-2 text-sm text-mute">Saved on this device. Sign-in and cross-device sync come with the database step.</p>
      {lib.length === 0 && <p className="mt-10">Nothing here yet. Open a manga and choose “Add to library”. <Link className="text-shu underline" href="/search">Explore manga</Link></p>}
      {lists.map((l) => { const items = lib.filter((e) => e.list === l); return items.length ? (
        <section key={l} className="mt-10"><h2 className="font-serif text-2xl">{l}</h2>
          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-6">{items.map((e) => (
            <Link key={e.id} href={`/manga/${e.id}`}><div className="aspect-[2/3] bg-cream">{e.cover && <img src={e.cover} alt={e.title} className="h-full w-full object-cover" />}</div>
              <p className="mt-1 line-clamp-2 text-sm">{e.title}</p>{prog[e.id] && <p className="text-xs text-shu">Page {prog[e.id].page + 1}</p>}</Link>))}</div></section>) : null; })}
    </div>
  );
}
