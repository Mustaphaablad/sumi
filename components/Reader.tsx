"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getProgress, saveProgress } from "@/lib/store";

type Mode = "scroll" | "page"; type Dir = "rtl" | "ltr";
const BG: Record<string, string> = { Ink: "#111", Gray: "#2a2a2a", Paper: "#F4F0E8" };

function Img({ src, className = "" }: { src: string; className?: string }) {
  const [n, setN] = useState(0); const [ok, setOk] = useState(true);
  if (!ok) return <button className="mx-auto my-6 block border border-shu px-4 py-2 text-shu" onClick={() => { setOk(true); setN((x) => x + 1); }}>Page failed to load. Retry</button>;
  return <img key={n} src={src + (n ? `?r=${n}` : "")} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setOk(false)} className={className} />;
}

export default function Reader({ chapterId, mangaId, chapters }: { chapterId: string; mangaId: string; chapters: { id: string; label: string }[] }) {
  const router = useRouter();
  const [pages, setPages] = useState<string[]>([]); const [err, setErr] = useState("");
  const [mode, setMode] = useState<Mode>("scroll"); const [dir, setDir] = useState<Dir>("rtl");
  const [bg, setBg] = useState("Ink"); const [width, setWidth] = useState(800);
  const [i, setI] = useState(0); const [ui, setUi] = useState(true); const refs = useRef<(HTMLDivElement | null)[]>([]);
  const idx = chapters.findIndex((c) => c.id === chapterId);
  const prev = chapters[idx - 1], next = chapters[idx + 1];

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem("sumi:reader") ?? "{}"); s.mode && setMode(s.mode); s.dir && setDir(s.dir); s.bg && setBg(s.bg); s.width && setWidth(s.width); } catch {}
    fetch(`/api/pages/${chapterId}`).then((r) => r.json()).then((j) => { if (j.error) throw new Error(j.error); setPages(j.pages); const p = getProgress(mangaId); if (p?.chapterId === chapterId) setI(p.page); }).catch((e) => setErr(e.message));
  }, [chapterId, mangaId]);
  useEffect(() => { try { localStorage.setItem("sumi:reader", JSON.stringify({ mode, dir, bg, width })); } catch {} }, [mode, dir, bg, width]);
  useEffect(() => { if (pages.length) saveProgress(mangaId, { chapterId, page: i, at: Date.now() }); }, [i, pages.length, mangaId, chapterId]);
  useEffect(() => { if (mode === "scroll" && pages.length) refs.current[i]?.scrollIntoView(); /* restore once */ // eslint-disable-next-line
  }, [pages.length, mode]);
  useEffect(() => { if (mode !== "page") return; for (let k = 1; k <= 3; k++) if (pages[i + k]) new Image().src = pages[i + k]; }, [i, mode, pages]);
  useEffect(() => {
    if (mode !== "scroll" || !pages.length) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setI(Number((e.target as HTMLElement).dataset.i))), { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((el) => el && io.observe(el)); return () => io.disconnect();
  }, [mode, pages]);

  const go = useCallback((d: 1 | -1) => {
    const forward = d === 1;
    if (forward && i >= pages.length - 1) return next && router.push(`/read/${next.id}`);
    if (!forward && i <= 0) return prev && router.push(`/read/${prev.id}`);
    setI((x) => x + d);
  }, [i, pages.length, next, prev, router]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const step = dir === "rtl" ? -1 : 1;
      if (e.key === "ArrowRight") mode === "page" && go(step as 1 | -1); if (e.key === "ArrowLeft") mode === "page" && go((-step) as 1 | -1);
      if (e.key === " " && mode === "page") { e.preventDefault(); go(1); }
      if (e.key === "f") document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
      if (e.key === "h") setUi((u) => !u);
    }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [go, mode, dir]);

  const light = bg === "Paper";
  return (
    <div style={{ background: BG[bg], minHeight: "100vh", color: light ? "#111" : "#F4F0E8" }}>
      {ui && (
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 bg-black/80 px-3 py-2 text-sm text-white">
          <a href={`/manga/${mangaId}`}>Back</a>
          <select aria-label="Chapter" value={chapterId} onChange={(e) => router.push(`/read/${e.target.value}`)} className="bg-transparent">{chapters.map((c) => <option className="text-black" key={c.id} value={c.id}>{c.label}</option>)}</select>
          <button disabled={!prev} onClick={() => prev && router.push(`/read/${prev.id}`)}>Prev</button>
          <button disabled={!next} onClick={() => next && router.push(`/read/${next.id}`)}>Next</button>
          <button onClick={() => setMode(mode === "scroll" ? "page" : "scroll")}>{mode === "scroll" ? "Vertical" : "Paged"}</button>
          {mode === "page" && <button onClick={() => setDir(dir === "rtl" ? "ltr" : "rtl")}>{dir === "rtl" ? "Right to left" : "Left to right"}</button>}
          <select aria-label="Background" value={bg} onChange={(e) => setBg(e.target.value)} className="bg-transparent">{Object.keys(BG).map((b) => <option className="text-black" key={b}>{b}</option>)}</select>
          <input aria-label="Width" type="range" min={400} max={1400} step={50} value={width} onChange={(e) => setWidth(+e.target.value)} className="w-24" />
          <span className="ml-auto">{pages.length ? `${i + 1} / ${pages.length}` : ""}</span>
        </div>
      )}
      {err && <p className="p-10">{err} <button className="underline" onClick={() => location.reload()}>Retry</button></p>}
      {!err && !pages.length && <p className="p-10 text-center opacity-70">Loading chapter…</p>}
      {mode === "scroll" ? (
        <div className="mx-auto" style={{ maxWidth: width }} onClick={() => setUi((u) => !u)}>
          {pages.map((p, n) => <div key={p} ref={(el) => { refs.current[n] = el; }} data-i={n}><Img src={p} className="block w-full" /></div>)}
          {pages.length > 0 && <div className="flex justify-between p-8 text-sm">{prev ? <a href={`/read/${prev.id}`}>Previous chapter</a> : <span />}{next ? <a className="text-shu" href={`/read/${next.id}`}>Next chapter</a> : <span>End of available chapters</span>}</div>}
        </div>
      ) : pages.length > 0 && (
        <div className="relative mx-auto flex min-h-[calc(100vh-48px)] items-center justify-center" style={{ maxWidth: width }}>
          <Img key={pages[i]} src={pages[i]} className="max-h-[calc(100vh-48px)] w-auto max-w-full" />
          <button aria-label="Previous page" className="absolute inset-y-0 left-0 w-1/3" onClick={() => go(dir === "rtl" ? 1 : -1)} />
          <button aria-label="Toggle controls" className="absolute inset-y-0 left-1/3 w-1/3" onClick={() => setUi((u) => !u)} />
          <button aria-label="Next page" className="absolute inset-y-0 right-0 w-1/3" onClick={() => go(dir === "rtl" ? -1 : 1)} />
        </div>
      )}
    </div>
  );
}
