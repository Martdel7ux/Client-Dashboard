import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // Core surfaces — dark-mode first
        canvas: "#0A0A0A",
        surface: {
          DEFAULT: "#111111",
          raised: "#161616",
          sunken: "#0D0D0D",
        },
        line: {
          DEFAULT: "#1F1F1F",
          strong: "#2A2A2A",
        },
        accent: {
          DEFAULT: "#6366F1",
          hover: "#7679F5",
          muted: "#6366F1",
          subtle: "rgba(99, 102, 241, 0.12)",
        },
        ink: {
          DEFAULT: "#FAFAFA",
          muted: "#A1A1AA",
          faint: "#71717A",
          ghost: "#52525B",
        },
        // shadcn token bridge (HSL via CSS vars)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Status palette for stage/status semantics
        status: {
          onboarding: "#A78BFA",
          progress: "#6366F1",
          review: "#F59E0B",
          completed: "#10B981",
          live: "#22D3EE",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        inset: "inset 0 1px 0 0 rgba(255,255,255,0.04)",
        "inset-md":
          "inset 0 1px 0 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.02)",
        glow: "0 0 0 1px rgba(99,102,241,0.4), 0 0 24px -4px rgba(99,102,241,0.5)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer: "shimmer 2s infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
