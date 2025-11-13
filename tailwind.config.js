// // /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {
//       colors: {
//         customprimary: {
//           50: "#eff6ff",
//           500: "#3052f6",
//           600: "#2553eb",
//           700: "#1464d8",
//         },
//         customsecondary: {
//           50: "#78fafc",
//           500: "#64748b",
//           600: "#47556f",
//           700: "#33415f",
//         },
//         // Add primary-focus color
//         "primary-focus": "#2553eb",
//       },
//     },
//   },
//   plugins: [require("daisyui")],
//   darkMode: "class",
//   daisyui: {
//     themes: [
//       {
//         light: {
//           primary: "#3052f6",
//           "primary-focus": "#2553eb",
//           "primary-content": "#ffffff",
//           secondary: "#64748b",
//           "secondary-focus": "#47556f",
//           "secondary-content": "#ffffff",
//           accent: "#37cdbe",
//           "accent-content": "#163835",
//           neutral: "#3d4451",
//           "neutral-content": "#ffffff",
//           "base-100": "#ffffff",
//           "base-200": "#f2f2f2",
//           "base-300": "#e5e6e6",
//           "base-content": "#1f2937",
//         },
//       },
//       "dark",
//     ],
//   },
// };
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
