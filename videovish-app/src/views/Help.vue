<script setup lang="ts">
import { X } from "lucide-vue-next";
import HelpEntry from "../components/HelpEntry.vue";
import { helpEntries } from "./Help";
import { useWindowClose } from "../composables";

const { closeWindow } = useWindowClose("help", true);
</script>

<template>
    <div class="rounded-sm bg-charcoal w-full h-full overflow-y-scroll">
        <div
            class="flex items-center justify-between px-8 py-4 border-b border-solid cursor-grab"
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
                <HelpEntry v-bind="entry" v-for="entry in helpEntries.filter((x) => x.category === 'playback')" />
            </div>
            <div class="w-full">
                <h2 class="text-2xl !font-semibold">App Management</h2>
                <span class="text-sm inline-block mb-7">These shortcuts have to do with managing the app itself.</span>
                <HelpEntry v-bind="entry" v-for="entry in helpEntries.filter((x) => x.category === 'management')" />
            </div>
        </div>
    </div>
</template>
