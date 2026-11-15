// Server-side MangaDex provider. Normalises to a unified Manga model, keeps provider id.
const API = "https://api.mangadex.org";
const RATINGS = ["safe", "suggestive"]; // strict content filter

export type Manga = {
  id: string; provider: "mangadex"; title: string; altTitles: string[]; description: string;
  cover?: string; authors: string[]; tags: string[]; status: string; year?: number; lastChapter?: string;
};
export type Chapter = { id: string; chapter: string; title: string; lang: string; date: string; group?: string; external: boolean; pages: number };

async function md(path: string, params: Record<string, string | string[]> = {}, revalidate = 300) {
  const u = new URL(API + path);
  for (const [k, v] of Object.entries(params)) (Array.isArray(v) ? v : [v]).forEach((x) => u.searchParams.append(k, x));
  const r = await fetch(u, { next: { revalidate }, headers: { "User-Agent": "Sumi/0.1 (self-hosted reader)" } });
  if (r.status === 429) throw new Error("MangaDex rate limit — retry in a few seconds.");
  if (!r.ok) throw new Error(`MangaDex error ${r.status}`);
  return r.json();
}

export function toManga(d: any): Manga {
  const a = d.attributes, rel = (t: string) => d.relationships.filter((r: any) => r.type === t);
  const cf = rel("cover_art")[0]?.attributes?.fileName;
  return {
    id: d.id, provider: "mangadex",
    title: a.title.en ?? Object.values<string>(a.title)[0] ?? "Untitled",
    altTitles: a.altTitles.flatMap((t: any) => Object.values<string>(t)).slice(0, 6),
    description: a.description?.en ?? "", cover: cf ? `/api/img?u=${encodeURIComponent(`https://uploads.mangadex.org/covers/${d.id}/${cf}.512.jpg`)}` : undefined,
    authors: [...new Set<string>([...rel("author"), ...rel("artist")].map((r: any) => r.attributes?.name).filter(Boolean))],
    tags: a.tags.map((t: any) => t.attributes.name.en), status: a.status, year: a.year ?? undefined, lastChapter: a.lastChapter ?? undefined,
  };
}

export async function listManga(opts: { q?: string; order?: Record<string, string>; limit?: number; offset?: number; status?: string; tag?: string; anyLang?: boolean } = {}) {
  const p: Record<string, string | string[]> = {
    limit: String(opts.limit ?? 20), offset: String(opts.offset ?? 0),
    "includes[]": ["cover_art", "author", "artist"], "contentRating[]": RATINGS,
  };
  if (!opts.anyLang) p["availableTranslatedLanguage[]"] = ["en"];
  if (opts.q) p.title = opts.q;
  if (opts.status) p["status[]"] = [opts.status];
  if (opts.tag) p["includedTags[]"] = [opts.tag];
  for (const [k, v] of Object.entries(opts.order ?? { followedCount: "desc" })) p[`order[${k}]`] = v;
  const j = await md("/manga", p);
  return { items: (j.data as any[]).map(toManga), total: j.total as number };
}

export async function getManga(id: string) {
  const j = await md(`/manga/${id}`, { "includes[]": ["cover_art", "author", "artist"] });
  return toManga(j.data);
}

export async function getChapters(mangaId: string, lang = "en"): Promise<Chapter[]> {
  const raw: any[] = [];
  for (let off = 0, total = 1; off < total && off < 3000; off += 500) {
    const j = await md(`/manga/${mangaId}/feed`, {
      "translatedLanguage[]": [lang], "order[chapter]": "asc", limit: "500", offset: String(off),
      "includes[]": ["scanlation_group"], "contentRating[]": RATINGS, includeExternalUrl: "0",
    });
    raw.push(...j.data); total = j.total;
  }
  const seen = new Set<string>();
  return raw.map((c) => ({
    id: c.id, chapter: c.attributes.chapter ?? "Oneshot", title: c.attributes.title ?? "", lang: c.attributes.translatedLanguage,
    date: c.attributes.readableAt, group: c.relationships.find((r: any) => r.type === "scanlation_group")?.attributes?.name,
    external: !!c.attributes.externalUrl, pages: c.attributes.pages,
  })).filter((c) => !c.external && c.pages > 0 && !seen.has(c.chapter) && seen.add(c.chapter));
}

export async function getGenres() {
  const j = await md("/manga/tag", {}, 86400);
  return (j.data as any[]).filter((t) => t.attributes.group === "genre").map((t) => ({ id: t.id as string, name: t.attributes.name.en as string })).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getChapterMeta(id: string) {
  const j = await md(`/chapter/${id}`, {});
  return { mangaId: j.data.relationships.find((r: any) => r.type === "manga").id as string, chapter: j.data.attributes.chapter as string };
}

// at-home servers are short-lived: never cache.
export async function getPages(id: string): Promise<string[]> {
  const j = await md(`/at-home/server/${id}`, {}, 0);
  return j.chapter.data.map((f: string) => `${j.baseUrl}/data/${j.chapter.hash}/${f}`);
}
