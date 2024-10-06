/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        56: "repeat(56, 16px)",
      },
      gridTemplateRows: {
        56: "repeat(56, 16px)",
      },
    },
  },
  plugins: [],
};
