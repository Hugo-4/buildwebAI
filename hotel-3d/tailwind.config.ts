import type { Config } from "tailwindcss";

// Les couleurs et polices pointent vers les variables CSS de app/globals.css :
// une seule source de vérité pour les jetons du système.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        snow: "var(--snow)",
        ink: "var(--ink)",
        mist: "var(--mist)",
        rule: "var(--rule)",
        amber: "var(--amber)",
        night: "var(--night)",
      },
      fontFamily: {
        condensed: ["var(--font-condensed)", "sans-serif"],
        caps: ["var(--font-caps)", "serif"],
        italic: ["var(--font-italic)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(.16,1,.3,1)",
        "in-out": "cubic-bezier(.65,0,.35,1)",
      },
    },
  },
  plugins: [],
};
export default config;
