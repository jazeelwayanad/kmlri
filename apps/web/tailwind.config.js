/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "rgb(243, 239, 230)",
        "paper-hover": "#E8E1D6",
        "paper-active": "#EAE3D8",
        "heritage-red": "rgb(165, 35, 7)",
        "heritage-dark": "#000000",
        "heritage-muted": "#8C8175",
        "heritage-subtle": "#5E564C",
        "heritage-body": "#3E3831",
      },
      fontFamily: {
        amiri: ["Amiri", "Georgia", "serif"],
        averia: ["'Averia Serif Libre'", "serif"],
        poppins: ["Poppins", "sans-serif"],
        garamond: ["'EB Garamond'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
