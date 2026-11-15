"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
export default function SearchBox() {
  const r = useRouter(); const [q, setQ] = useState(""); const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ id: string; title: string; alt?: string }[]>([]); const [hist, setHist] = useState<string[]>([]);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { try { setHist(JSON.parse(localStorage.getItem("sumi:hist") ?? "[]")); } catch {} }, [open]);
  useEffect(() => {
    if (q.trim().length < 2) { setItems([]); return; }
    const ac = new AbortController(), t = setTimeout(() => fetch(`/api/suggest?q=${encodeURIComponent(q)}`, { signal: ac.signal }).then((x) => x.json()).then((j) => setItems(j.items)).catch(() => {}), 250);
    return () => { clearTimeout(t); ac.abort(); };
  }, [q]);
  useEffect(() => { const c = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false); document.addEventListener("mousedown", c); return () => document.removeEventListener("mousedown", c); }, []);
  const submit = (v: string) => { v = v.trim(); if (!v) return; const h = [v, ...hist.filter((x) => x !== v)].slice(0, 6); try { localStorage.setItem("sumi:hist", JSON.stringify(h)); } catch {} setOpen(false); r.push(`/search?q=${encodeURIComponent(v)}`); };
  return (
    <div ref={box} className="relative w-full">
      <form onSubmit={(e) => { e.preventDefault(); submit(q); }} role="search">
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search a title, even an alternative one" aria-label="Search manga" autoComplete="off"
          className="w-full border-b border-[var(--fg)]/40 bg-transparent py-1 text-sm outline-none focus:border-shu" />
      </form>
      {open && (items.length > 0 || (q.length < 2 && hist.length > 0)) && (
        <ul className="absolute left-0 right-0 top-full z-40 mt-1 border border-[var(--line)] bg-[var(--bg)] shadow-lg">
          {q.length < 2 ? <>
            {hist.map((h) => <li key={h}><button className="w-full px-3 py-2 text-left text-sm hover:bg-cream hover:text-sumi" onClick={() => submit(h)}>{h}</button></li>)}
            <li><button className="px-3 py-2 text-xs text-mute underline" onClick={() => { try { localStorage.removeItem("sumi:hist"); } catch {} setHist([]); }}>Clear history</button></li>
          </> : items.map((m) => <li key={m.id}><a href={`/manga/${m.id}`} className="block px-3 py-2 text-sm hover:bg-cream hover:text-sumi">{m.title}{m.alt && <span className="block text-xs text-mute">{m.alt}</span>}</a></li>)}
        </ul>)}
    </div>
  );
}
