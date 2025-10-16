// Tailwind theme tweaks that give the dashboard its primary blues and supportive status colors.
module.exports = {
  content: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          light: "#3b82f6",
        },
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626",
      },
    },
  },
  plugins: [],
};
