// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            meta: [{ name: "google-site-verification", content: "_wSxbjEo1coYAcGSykHsVB6cW54Vf2DehrRxToKw6sc" }]
        }
    },
    modules: ["nuxt-security"],
    security: {
        corsHandler: {
            origin: "*",
            methods: ["GET", "POST"],
            allowHeaders: "*"
        }
    },
    runtimeConfig: {
        GOOGLE_API_KEY: process.env.NUXT_GOOGLE_API_KEY,
        API_KEY: process.env.NUXT_VIDEOVISH_API_KEY
    },
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {}
        }
    },
    compatibilityDate: "2024-08-23"
});
