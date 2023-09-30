// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
    }
});
