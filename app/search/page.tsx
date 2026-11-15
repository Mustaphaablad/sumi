import Link from "next/link";
import { listManga, getGenres } from "@/lib/mangadex";
import Card from "@/components/Card";
const ORDERS: Record<string, string> = { followedCount: "Popularity", rating: "Rating", latestUploadedChapter: "Latest update", createdAt: "Newest", title: "A to Z" };
type SP = { q?: string; order?: string; status?: string; page?: string; tag?: string; all?: string };
export default async function Search({ searchParams: sp }: { searchParams: SP }) {
  const order = sp.order && ORDERS[sp.order] ? sp.order : "followedCount";
  const page = Math.min(Math.max(1, Number(sp.page) || 1), 300); // MangaDex caps offset+limit at 10 000
  const qs = (o: Partial<SP>) => "?" + new URLSearchParams(Object.entries({ ...sp, ...o }).filter(([, v]) => v) as [string, string][]);
  let data, genres: { id: string; name: string }[] = [];
  try {
    [data, genres] = await Promise.all([
      listManga({ q: sp.q, status: sp.status, tag: sp.tag, anyLang: sp.all === "1", limit: 30, offset: (page - 1) * 30, order: { [order]: order === "title" ? "asc" : "desc" } }),
      getGenres().catch(() => []),
    ]);
  } catch (e: any) { return <p className="mx-auto max-w-6xl px-4 py-20">{e.message} <Link className="text-shu underline" href="/search">Try again</Link></p>; }
  const on = "text-shu underline underline-offset-4";
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl">{sp.q ? `Results for “${sp.q}”` : "Explore"} <span className="text-base text-mute">{data.total.toLocaleString()} titles</span></h1>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {Object.entries(ORDERS).map(([k, v]) => <Link key={k} href={qs({ order: k, page: undefined })} className={k === order ? on : ""}>{v}</Link>)}
        <span className="text-mute">|</span>
        {["ongoing", "completed", "hiatus"].map((s) => <Link key={s} href={qs({ status: sp.status === s ? undefined : s, page: undefined })} className={`capitalize ${sp.status === s ? on : ""}`}>{s}</Link>)}
        <span className="text-mute">|</span>
        <Link href={qs({ all: sp.all === "1" ? undefined : "1", page: undefined })} className={sp.all === "1" ? on : ""}>{sp.all === "1" ? "All languages" : "Readable in English"}</Link>
      </div>
      <div className="hide-sb mt-4 flex gap-2 overflow-x-auto pb-1 text-sm">
        {genres.map((g) => <Link key={g.id} href={qs({ tag: sp.tag === g.id ? undefined : g.id, page: undefined })} className={`shrink-0 border px-3 py-1 ${sp.tag === g.id ? "border-shu bg-shu text-washi" : "border-[var(--line)]"}`}>{g.name}</Link>)}
      </div>
      {data.items.length === 0 ? (
        <p className="mt-16">Nothing matches. {sp.all !== "1" && <>This search only shows titles readable in English. <Link className="text-shu underline" href={qs({ all: "1" })}>Search all languages</Link>. </>}<Link className="text-shu underline" href="/search">Reset filters</Link></p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6">{data.items.map((m) => <Card key={m.id} m={m} w="w-full" />)}</div>
      )}
      <div className="mt-10 flex items-center gap-6 text-sm">
        {page > 1 && <Link href={qs({ page: String(page - 1) })}>Previous</Link>}
        <span className="text-mute">Page {page}</span>
        {page * 30 < data.total && <Link href={qs({ page: String(page + 1) })}>Next</Link>}
      </div>
    </div>
  );
}
