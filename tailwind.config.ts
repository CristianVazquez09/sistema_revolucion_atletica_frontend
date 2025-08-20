import type { Config } from 'tailwindcss'

export default {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#000000",
          green: "#0E943F",
          green2: "#158D35",
          slate: "#374957",
          maroon: "#A02129",
          redDark: "#BC040B",
          red: "#E00000",
          grayLight: "#D9D9D9",
          bg: "#F5F7F9",
          white: "#FFFFFF"
        }
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      }
    }
  },
  plugins: []
} satisfies Config
