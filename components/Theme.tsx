"use client";
import { useEffect, useState } from "react";
export default function Theme() {
  const [d, setD] = useState(false);
  useEffect(() => { try { const v = localStorage.getItem("sumi:theme") === "dark"; setD(v); document.documentElement.classList.toggle("dark", v); } catch {} }, []);
  return <button aria-label="Toggle theme" className="text-sm underline-offset-4 hover:underline" onClick={() => { const v = !d; setD(v); document.documentElement.classList.toggle("dark", v); try { localStorage.setItem("sumi:theme", v ? "dark" : "light"); } catch {} }}>{d ? "Light" : "Dark"}</button>;
}
