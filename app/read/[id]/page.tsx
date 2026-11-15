import { getChapterMeta, getChapters } from "@/lib/mangadex";
import Reader from "@/components/Reader";
export const metadata = { title: "Reader" };
export default async function Read({ params }: { params: { id: string } }) {
  try {
    const meta = await getChapterMeta(params.id);
    const chapters = (await getChapters(meta.mangaId)).map((c) => ({ id: c.id, label: `Ch. ${c.chapter}` }));
    return <Reader chapterId={params.id} mangaId={meta.mangaId} chapters={chapters} />;
  } catch (e: any) { return <p className="px-4 py-20">{e.message}</p>; }
}
