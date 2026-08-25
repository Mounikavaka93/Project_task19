/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        logo: ['"Grand Hotel"', "cursive"],
      },
      colors: {
        ig: {
          blue: "#0095f6",
          link: "#00376b",
          text: "#262626",
          muted: "#8e8e8e",
          border: "#dbdbdb",
          line: "#efefef",
          hover: "#f2f2f2",
          bg: "#fafafa",
          red: "#ed4956",
        },
        brand: {
          500: "#0095f6",
          600: "#0095f6",
          700: "#1877f2",
        },
        ink: {
          400: "#8e8e8e",
          500: "#8e8e8e",
          700: "#262626",
          800: "#262626",
          900: "#262626",
        },
      },
    },
  },
  plugins: [],
};
