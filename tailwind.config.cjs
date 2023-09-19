/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,vue,ts}"],
    theme: {
        fontFamily: {
            sans: ["Inter", "Segoe UI", "sans-serif"]
        },
        extend: {
            colors: {
                charcoal: "#252526"
            }
        }
    },
    plugins: []
};
