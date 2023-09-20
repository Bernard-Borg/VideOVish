<template>
    <div class="rounded-sm bg-charcoal w-full h-full overflow-y-scroll">
        <div
            class="flex items-center justify-between px-8 py-4 border-b border-solid"
            data-tauri-drag-region
            style="border-color: rgb(30, 30, 30)"
        >
            <h1 class="text-3xl my-2 font-semibold">Keyboard Shortcuts</h1>
            <X color="white" @click="closeWindow" />
        </div>
        <div class="flex gap-16 px-12 py-8 justify-evenly">
            <div class="w-full">
                <h2 class="text-2xl !font-semibold">Video Playback</h2>
                <span class="text-sm inline-block mb-7">These shortcuts have to do with playing the video.</span>
                <span class="flex items-center justify-between mb-3"
                    >PLAY/PAUSE <HelpKey extendWidth class="float-right">SPACE</HelpKey></span
                >
                <span class="flex items-center justify-between mb-3"
                    >SLOW DOWN VIDEO <HelpKey class="float-right">S</HelpKey></span
                >
                <span class="flex items-center justify-between mb-3"
                    >SPEED UP VIDEO <HelpKey class="float-right">D</HelpKey></span
                >
                <span class="flex items-center justify-between mb-3"
                    >REWIND 5 SECONDS <HelpKey class="float-right">←</HelpKey></span
                >
                <span class="flex items-center justify-between mb-3"
                    >FAST FORWARD 5 SECONDS <HelpKey class="float-right">→</HelpKey></span
                >
                <span class="flex items-center justify-between mb-3"
                    >REWIND 10 SECONDS <HelpKey class="float-right">J</HelpKey></span
                >
                <span class="flex items-center justify-between mb-3"
                    >FAST FORWARD 10 SECONDS <HelpKey class="float-right">K</HelpKey></span
                >
                <span class="flex items-center justify-between mb-3"
                    >INCREASE VOLUME <HelpKey class="float-right">↑</HelpKey></span
                >
                <span class="flex items-center justify-between mb-3"
                    >DECREASE VOLUME <HelpKey class="float-right">↓</HelpKey></span
                >
                <span class="flex items-center justify-between mb-3"
                    >MUTE/UNMUTE VOLUME <HelpKey class="float-right">M</HelpKey></span
                >
                <span class="flex items-center justify-between mb-3">
                    SEEK LOCATION
                    <span class="float-right">
                        <HelpKey>0</HelpKey>
                        <span class="key-symbol">-</span>
                        <HelpKey>9</HelpKey>
                    </span>
                </span>
            </div>
            <div class="w-full">
                <h2 class="text-2xl !font-semibold">App Management</h2>
                <span class="text-sm inline-block mb-7">These shortcuts have to do with managing the app itself.</span>
                <span class="flex items-center justify-between mb-3">
                    HELP MENU
                    <span class="float-right">
                        <HelpKey>F1</HelpKey>
                        <span class="key-symbol">/</span>
                        <HelpKey extendWidth>CTRL</HelpKey>
                        <span class="key-symbol">+</span>
                        <HelpKey>/</HelpKey>
                    </span>
                </span>
                <span class="flex items-center justify-between mb-3"
                    >TOGGLE FULLSCREEN <HelpKey class="float-right">F11</HelpKey></span
                >
                <span class="flex items-center justify-between mb-3">
                    PICK VIDEO TO VIEW
                    <span class="float-right">
                        <HelpKey extendWidth>CTRL</HelpKey>
                        <span class="key-symbol">+</span>
                        <HelpKey>O</HelpKey>
                    </span>
                </span>
                <span class="flex items-center justify-between mb-3"
                    >CLOSE SECONDARY WINDOW <HelpKey class="float-right">ESC</HelpKey></span
                >
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { WebviewWindow, getCurrent } from "@tauri-apps/api/window";
import { X } from "lucide-vue-next";
import { onMounted, onUnmounted } from "vue";
import HelpKey from "../components/HelpKey.vue";

const closeWindow = async () => {
    await WebviewWindow.getByLabel("help")?.close();
};

getCurrent().listen("tauri://blur", () => {
    closeWindow();
});

const eventHandler = (e: KeyboardEvent) => {
    if (e.code === "Escape") {
        closeWindow();
    }
};

onMounted(() => {
    window.addEventListener("keydown", eventHandler);
});

onUnmounted(() => {
    window.removeEventListener("keydown", eventHandler);
});
</script>

<style scoped>
span.key-symbol {
    margin-top: 5px;
    margin-right: 10px;
}
</style>
