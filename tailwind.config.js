/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: "#27500A",
          DEFAULT: "#639922",
          medium: "#32650D",
          light: "#EAF3DE",
        },
        surface: "#F1EFE8",
        error: "#E84234",
        warning: {
          DEFAULT: "#BA7517",
          light: "#FAEEDA",
        },
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
      },
    },
  },
  plugins: [],
};
