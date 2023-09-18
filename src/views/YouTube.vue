<template>
    <div id="main-div" data-tauri-drag-region>
        <h1 style="font-weight: 600; margin-bottom: 0">Search video</h1>
        <X color="white" style="position: absolute; top: 10px; right: 10px" @click="closeWindow" />
        <span v-if="failureReason" style="color: red">{{ failureReason }}</span>
        <div style="display: flex; align-items: center; margin-top: 30px">
            <input
                v-model="search"
                id="youtube-search"
                ref="youtubeSearch"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                @keyup="getVideo"
            />
            <Search @click="downloadVideo" color="#252526" style="margin-left: -40px; cursor: pointer; z-index: 99" />
        </div>
        <span>Preferred Quality</span>
        <select v-model="preferredQuality">
            <option :value="1" selected>1080p</option>
            <option :value="2">720p</option>
            <option :value="3">480p</option>
            <option :value="4">240p</option>
            <option :value="5">Audio only</option>
        </select>
        <button>Clear cache</button>
        <span id="time-notice" v-if="loadingText">This will take a while</span>
        <span id="loading-text" v-if="loadingText">{{ loadingText }}</span>
    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted, watch } from "vue";
import { invoke } from "@tauri-apps/api";
import { WebviewWindow, getCurrent } from "@tauri-apps/api/window";
import { useIntervalFn, useOnline } from "@vueuse/core";
import { X, Search } from "lucide-vue-next";

const search = ref<string>("");
const loadingText = ref<string>("");
const searchFailed = ref<boolean>(false);
const failureReason = ref<string>("");
const preferredQuality = ref<string>("");

const online = useOnline();

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
