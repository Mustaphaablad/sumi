import { getManga, getChapters } from "@/lib/mangadex";
import Actions from "@/components/Actions";
import type { Metadata } from "next";
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try { const m = await getManga(params.id); return { title: m.title, description: m.description.slice(0, 160), openGraph: { images: m.cover ? [m.cover] : [] } }; } catch { return {}; }
}
export default async function Page({ params }: { params: { id: string } }) {
  let m, chapters;
  try { [m, chapters] = await Promise.all([getManga(params.id), getChapters(params.id)]); }
  catch (e: any) { return <p className="mx-auto max-w-6xl px-4 py-20">{e.message}</p>; }
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        {m.cover && <img src={m.cover} alt={m.title} className="w-full max-w-[260px] shadow-lg" />}
        <div>
          <h1 className="font-serif text-4xl font-bold">{m.title}</h1>
          {m.altTitles.length > 0 && <p className="mt-1 text-sm text-mute">{m.altTitles.slice(0, 3).join(" / ")}</p>}
          <p className="mt-3 text-sm">{m.authors.join(", ")}{m.year ? `, ${m.year}` : ""}, {m.status}</p>
          <p className="mt-3 flex flex-wrap gap-2 text-xs">{m.tags.map((t) => <span key={t} className="border border-[var(--line)] px-2 py-0.5">{t}</span>)}</p>
          <p className="mt-5 max-w-prose whitespace-pre-line leading-relaxed">{m.description.split("\n---")[0]}</p>
          <Actions mangaId={m.id} title={m.title} cover={m.cover} first={chapters[0]?.id} />
        </div>
      </div>
      <h2 className="mt-12 font-serif text-2xl">Chapters ({chapters.length})</h2>
      {chapters.length === 0 ? <p className="mt-3 text-mute">No English chapters are readable on Sumi for this title. They may be hosted by the official publisher.</p> : (
        <ul className="mt-3 divide-y divide-[var(--line)]">
          {[...chapters].reverse().map((c) => (
            <li key={c.id}><a href={`/read/${c.id}`} className="flex gap-4 py-2.5 hover:text-shu">
              <span className="w-20 shrink-0 font-medium">Ch. {c.chapter}</span>
              <span className="flex-1 truncate">{c.title}</span>
              <span className="hidden text-sm text-mute sm:block">{c.group}</span>
              <span className="text-sm text-mute">{new Date(c.date).toLocaleDateString()}</span>
            </a></li>
          ))}
        </ul>
      )}
    </div>
  );
}
