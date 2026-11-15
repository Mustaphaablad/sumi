import Link from "next/link";
import { listManga } from "@/lib/mangadex";
import Card from "@/components/Card";
export const revalidate = 300;
function Row({ title, items }: { title: string; items: any[] }) {
  return (
    <section className="mx-auto mt-14 max-w-6xl px-4">
      <div className="brush mb-3 w-16" />
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="hide-sb mt-4 flex gap-4 overflow-x-auto pb-2">{items.map((m) => <Card key={m.id} m={m} />)}</div>
    </section>
  );
}
export default async function Home() {
  try {
    const [pop, upd, top, done] = await Promise.all([
      listManga({ limit: 12 }),
      listManga({ limit: 12, order: { latestUploadedChapter: "desc" } }),
      listManga({ limit: 12, order: { rating: "desc" } }),
      listManga({ limit: 12, status: "completed", order: { followedCount: "desc" } }),
    ]);
    const hero = pop.items.find((m) => m.cover && m.description) ?? pop.items[0];
    return (
      <>
        <section className="mx-auto grid max-w-6xl gap-8 px-4 pt-10 md:grid-cols-[1.3fr_1fr]">
          <div className="self-end">
            <p className="text-sm text-mute">Most followed right now</p>
            <h1 className="mt-2 font-serif text-5xl font-bold leading-[1.05] md:text-7xl">{hero.title}</h1>
            <p className="mt-5 line-clamp-4 max-w-prose leading-relaxed">{hero.description.split("\n")[0]}</p>
            <p className="mt-3 text-sm text-mute">{hero.tags.slice(0, 4).join(", ")} — {hero.status}</p>
            <div className="mt-6 flex gap-3">
              <Link href={`/manga/${hero.id}`} className="bg-shu px-5 py-2.5 text-washi">Start reading</Link>
              <Link href="/search" className="border border-[var(--fg)] px-5 py-2.5">Explore manga</Link>
            </div>
          </div>
          <Link href={`/manga/${hero.id}`} className="block rotate-1 justify-self-end shadow-xl">{hero.cover && <img src={hero.cover} alt={hero.title} className="max-h-[480px]" />}</Link>
        </section>
        <Row title="Most popular" items={pop.items} />
        <Row title="Recently updated" items={upd.items} />
        <Row title="Top rated" items={top.items} />
        <Row title="Completed, ready to binge" items={done.items} />
      </>
    );
  } catch (e: any) {
    return <p className="mx-auto max-w-6xl px-4 py-20">The catalog could not load: {e.message} Refresh in a moment.</p>;
  }
}
