<script setup lang="ts">
import { ref, onUnmounted, onMounted, watch } from "vue";
import { invoke } from "@tauri-apps/api";
import { WebviewWindow, getCurrent } from "@tauri-apps/api/window";
import { useIntervalFn, useOnline } from "@vueuse/core";
import { X, Search } from "lucide-vue-next";
import { Trash2 } from "lucide-vue-next";
import { useNotification } from "../composables";

const search = ref<string>("");
const loadingText = ref<string>("");
const searchFailed = ref<boolean>(false);
const failureReason = ref<string>("");
const preferredQuality = ref<number>(1);

const online = useOnline();
const { add } = useNotification();

const closeWindow = async () => {
    await WebviewWindow.getByLabel("youtube")?.close();
};

getCurrent().listen("tauri://blur", () => {
    if (!loadingText.value) {
        closeWindow();
    }
});

// Loading... animation
const animateLoadingText = () => {
    if (loadingText.value.includes("...")) {
        loadingText.value = "Loading";
    } else if (loadingText.value.includes("..")) {
        loadingText.value = "Loading...";
    } else if (loadingText.value.includes(".")) {
        loadingText.value = "Loading..";
    } else {
        loadingText.value = "Loading.";
    }
};

const { pause, resume } = useIntervalFn(
    () => {
        animateLoadingText();
    },
    250,
    { immediate: false }
);

const keyUpEventHandler = async (event: KeyboardEvent) => {
    if (event.code === "Escape") {
        closeWindow();
    }
};

const downloadVideo = async () => {
    searchFailed.value = false;
    failureReason.value = "";

    // Prevents user from clicking enter multiple times
    if (loadingText.value) {
        return;
    }

    // Cannot download video if offline
    if (!online.value) {
        searchFailed.value = true;
        failureReason.value = "Cannot play YouTube video while offline";
        return;
    }

    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = search.value.match(regExp);
    const hasMatched = match && match[7].length === 11 ? match[7] : false;

    if (!hasMatched) {
        searchFailed.value = true;
        failureReason.value = "Not a YouTube URL";
        return;
    }

    resume();
    invoke("download_video", { url: search.value, code: hasMatched, quality: preferredQuality.value ?? 1 }).then(
        (result) => {
            if (result === "") {
                closeWindow(); //if download was successful, close window
            } else {
                // if download wasn't, display error
                pause();
                searchFailed.value = true;
                failureReason.value = result as string;
            }
        }
    );
};

const getVideo = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
        downloadVideo();
    }
};

watch(search, () => {
    searchFailed.value = false;
    failureReason.value = "";
});

// Window setup and main logic
onMounted(async () => {
    // Close window when Escape is pressed
    document.addEventListener("keyup", keyUpEventHandler);
});

onUnmounted(() => {
    document.removeEventListener("keyup", keyUpEventHandler);
    pause();
});

const clearCache = async () => {
    await invoke("clear_cache").then((result) => {
        if (result === "EMPTY") {
            add({
                text: "Cache already empty",
                type: "info",
                timeout: 3000
            });
        } else if (result) {
            add({
                text: `Successfully cleared ${result}`,
                type: "success",
                timeout: 3000
            });
        }
    });
};
</script>

<template>
    <div class="rounded-md bg-charcoal w-full h-full px-12 py-10" data-tauri-drag-region>
        <h1 class="font-bold text-3xl">Search video</h1>
        <X color="white" class="absolute top-[10px] right-[10px]" @click="closeWindow" />
        <!-- Quality select -->
        <div class="flex items-center mt-4 justify-end w-[500px]">
            <span class="inline-block mr-3">Preferred Quality</span>
            <select v-model="preferredQuality" class="cursor-pointer">
                <option :value="1" selected>1080p</option>
                <option :value="2">720p</option>
                <option :value="3">480p</option>
                <option :value="4">240p</option>
                <option :value="5">Audio only</option>
            </select>
        </div>
        <!-- Search bar -->
        <div class="flex flex-col w-[500px] mt-3">
            <div class="flex items-center">
                <input
                    v-model="search"
                    ref="youtubeSearch"
                    :class="`rounded-md p-[15px] w-full text-md ${
                        failureReason ? 'outline outline-1 outline-red-600' : ''
                    }`"
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    @keydown.tab="search = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'"
                    @keyup="getVideo"
                />
                <Search @click="downloadVideo" color="#252526" class="-ml-[40px] cursor-pointer z-50" />
            </div>
            <span class="text-red-600 text-sm self-end">{{ failureReason }}</span>
        </div>
        <button
            class="outline outline-1 outline-white text-white p-1 rounded-md absolute bottom-[10px] right-[10px] hover:bg-red-500"
            title="Clear Cache"
            @click="clearCache"
        >
            <Trash2 />
        </button>
        <span class="absolute left-0 bottom-0 p-3" v-if="loadingText">{{ loadingText }}</span>
    </div>
</template>
