import type { Config } from "tailwindcss";

// Les couleurs et polices pointent vers les variables CSS de app/globals.css :
// une seule source de vérité pour les jetons du système.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        snow: "var(--snow)",
        altitude: "var(--altitude)",
        granite: "var(--granite)",
        sky: "var(--sky)",
        amber: "var(--amber)",
        shade: "var(--shade)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
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
