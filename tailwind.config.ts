import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { sumi: "#111111", char: "#1B1B1B", washi: "#F4F0E8", cream: "#E7DFD2", shu: "#D94735", mute: "#888888" },
    fontFamily: { serif: ["var(--f-serif)", "serif"], sans: ["var(--f-sans)", "sans-serif"] },
  } },
} satisfies Config;
