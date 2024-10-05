/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      boxShadow: {
        custom: "0 0.7em 1.5em -0.5em #4d36d0be",
      },
      width: {
        "calc-100-minus-256": "calc(100% - 256px)",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
