/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["Orbitron_900Black"],
        "orbitron-bold": ["Orbitron_700Bold"],
        "orbitron-regular": ["Orbitron_400Regular"],
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
      },
      colors: {
        primary: "#020617",
        secondary: "#0f172a",
        tertiary: "#0a0a0a",

        accent: {
          light: "#fcd34d",
          DEFAULT: "#fbbf24",
          dark: "#f59e0b",
          darker: "#d97706",
        },

        card: {
          bg: "#1e293b",
          border: "#334155",
        },
      },
    },
  },
  plugins: [],
};
