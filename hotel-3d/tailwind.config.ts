import type { Config } from "tailwindcss";

// Les couleurs et polices pointent vers les variables CSS de app/globals.css :
// une seule source de vérité pour les jetons du système.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        snow: "rgb(var(--snow-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        mist: "rgb(var(--mist-rgb) / <alpha-value>)",
        rule: "var(--rule)",
        amber: "rgb(var(--amber-rgb) / <alpha-value>)",
        night: "rgb(var(--night-rgb) / <alpha-value>)",
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
