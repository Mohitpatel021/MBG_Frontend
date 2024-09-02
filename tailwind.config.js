/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      width: {
        "calc-100-minus-256": "calc(100% - 256px)",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
