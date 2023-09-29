<script setup lang="ts">
import Logo from "./components/Logo.vue";

useHead({
    title: "VideoVish",
    link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { href: "https://fonts.googleapis.com/css2?family=Inter:wght@100;400;600;700&display=swap", rel: "stylesheet" }
    ]
});
</script>

<template>
    <div class="flex flex-col mb-10">
        <div class="flex items-center gap-2 text-3xl text-red-900">
            <a href="https://github.com/Bernard-Borg/VideOVish">VideoVish</a>
            <img src="/favicon.ico" width="30" />
        </div>
        <a class="text-xl" href="https://github.com/Bernard-Borg/VideOVish/releases">Download</a>
    </div>
    <span>An open-source minimalistic desktop video player and YouTube downloader for Windows</span>
    <div
        class="flex fixed p-3 bottom-[10px] right-[10px] gap-2 outline outline-1 outline-black rounded-md bg-slate-100"
    >
        <Logo link="https://github.com/tauri-apps" logoSrc="/tauri-logo.png" description="Tauri logo" />
        <Logo link="https://vuejs.org/" logoSrc="/vue-logo.png" description="Vue logo" />
        <Logo link="https://www.typescriptlang.org/" logoSrc="/typescript-logo.png" description="Typescript logo" />
        <Logo link="https://tailwindcss.com/" logoSrc="/tailwind-logo.svg" description="TailwindCSS logo" />
        <Logo link="https://nuxt.com/" logoSrc="/nuxt-logo.svg" description="Nuxt logo" />
        <Logo link="https://vercel.com/dashboard" logoSrc="/vercel-logo.svg" description="Vercel logo" />
    </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
    height: 100%;
    margin: 0;
}

body {
    background: white;
    font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
        "Open Sans", "Helvetica Neue", sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
