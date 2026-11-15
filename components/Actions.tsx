"use client";
import { useEffect, useState } from "react";
import { getProgress, library, setList, removeEntry, type Progress } from "@/lib/store";
const LISTS = ["Reading", "Plan to read", "Completed", "On hold", "Dropped", "Favorites"];
export default function Actions({ mangaId, title, cover, first }: { mangaId: string; title: string; cover?: string; first?: string }) {
  const [p, setP] = useState<Progress | null>(null); const [list, setL] = useState(""); const [msg, setMsg] = useState("");
  useEffect(() => { setP(getProgress(mangaId)); setL(library().find((e) => e.id === mangaId)?.list ?? ""); }, [mangaId]);
  const go = p?.chapterId ?? first;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {go && <a href={`/read/${go}`} className="bg-shu px-5 py-2.5 text-washi">{p ? `Continue reading (page ${p.page + 1})` : "Start reading"}</a>}
      <select aria-label="Add to library" value={list} className="border border-[var(--fg)] bg-transparent px-3 py-2.5"
        onChange={(e) => { const v = e.target.value; setL(v); if (v) { setList({ id: mangaId, title, cover, list: v }); setMsg(`Saved to ${v}`); } else { removeEntry(mangaId); setMsg("Removed from library"); } }}>
        <option value="">Add to library</option>{LISTS.map((l) => <option key={l}>{l}</option>)}
      </select>
      <button className="border border-[var(--line)] px-3 py-2.5" onClick={() => navigator.share?.({ title, url: location.href }) ?? navigator.clipboard.writeText(location.href).then(() => setMsg("Link copied"))}>Share</button>
      <span role="status" className="text-sm text-mute">{msg}</span>
    </div>
  );
}
