<template>
    <div id="main-div">
        <h1 style="font-weight: 600">Search video</h1>
        <X color="white" style="position: absolute; top: 10px; right: 10px" @click="closeWindow" />
        <div style="display: flex; align-items: center">
            <input
                v-model="search"
                id="youtube-search"
                ref="youtubeSearch"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                @keyup="getVideo"
            />
            <Search @click="downloadVideo" color="#252526" style="margin-left: -40px; cursor: pointer; z-index: 99" />
        </div>
        <span id="time-notice" v-if="loadingText">This will take a while</span>
        <span id="loading-text" v-if="loadingText">{{ loadingText }}</span>
    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted } from "vue";
import { invoke } from "@tauri-apps/api";
import { WebviewWindow, getCurrent } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useIntervalFn, useOnline } from "@vueuse/core";
import { X, Search } from "lucide-vue-next";

const search = ref<string>("");
const loadingText = ref<string>("");
const searchFailed = ref<boolean>(false);

const online = useOnline();

const closeWindow = async () => {
    await WebviewWindow.getByLabel("youtube")?.close();
};

getCurrent().listen("tauri://blur", () => {
    closeWindow();
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

    // Prevents user from clicking enter multiple times
    if (loadingText.value) {
        return;
    }

    // Cannot download video if offline
    if (!online.value) {
        return;
    }

    invoke("download_video", { url: search.value });
    resume();

    const unlisten = await listen("search_failed", (event) => {
        const error = (event.payload as { errorMessage: string }).errorMessage;
        console.log(error);
        pause();

        searchFailed.value = true;
    });

    unlisten();
};

const getVideo = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
        downloadVideo();
    }
};

// Window setup and main logic
onMounted(async () => {
    // Close window when Escape is pressed
    document.addEventListener("keyup", keyUpEventHandler);
});

onUnmounted(() => {
    document.removeEventListener("keyup", keyUpEventHandler);
    pause();
});
</script>

<style scoped>
#main-div {
    border-radius: 5px;
    background-color: #252526;
    width: 100%;
    padding: 40px 50px;
    height: 100%;
}

input {
    border-radius: 7px;
    padding: 15px;
    width: 400px;
    font-family: "Inter", "Segoe UI", sans-serif;
}

#loading-text {
    position: absolute;
    padding: 10px;
    right: 0;
    bottom: 0;
}

#time-notice {
    visibility: hidden;
    position: absolute;
    left: 10px;
    bottom: 10px;
}
</style>
