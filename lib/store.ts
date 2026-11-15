"use client";
// Guest persistence in localStorage. Swap for a DB-backed API once auth exists.
export type Progress = { chapterId: string; page: number; at: number };
export type Entry = { id: string; title: string; cover?: string; list: string };
const get = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) ?? "") as T; } catch { return d; } };
const set = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
export const getProgress = (m: string) => get<Progress | null>(`sumi:p:${m}`, null);
export const saveProgress = (m: string, p: Progress) => set(`sumi:p:${m}`, p);
export const library = () => get<Entry[]>("sumi:lib", []);
export const setList = (e: Entry) => set("sumi:lib", [...library().filter((x) => x.id !== e.id), e]);
export const removeEntry = (id: string) => set("sumi:lib", library().filter((x) => x.id !== id));
export const allProgress = () => Object.keys(localStorage).filter((k) => k.startsWith("sumi:p:")).map((k) => ({ id: k.slice(7), ...get<Progress>(k, { chapterId: "", page: 0, at: 0 }) })).sort((a, b) => b.at - a.at);
