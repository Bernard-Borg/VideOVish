<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted, ref, computed, watch } from "vue";
import { invoke } from "@tauri-apps/api";
import { getMatches } from "@tauri-apps/api/cli";
import { open } from "@tauri-apps/api/dialog";
import { listen } from "@tauri-apps/api/event";
import { exists } from "@tauri-apps/api/fs";
import { basename, extname } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { getCurrent, appWindow, getAll, WebviewWindow } from "@tauri-apps/api/window";
import { useDraggable, useMediaControls, useThrottleFn, useTimeoutFn } from "@vueuse/core";
import {
    Info,
    Play,
    Pause,
    Repeat,
    Rewind,
    FastForward,
    Maximize,
    Minimize,
    Youtube,
    VolumeX,
    Volume1,
    Volume2,
    Minus,
    Square,
    X,
    HardDrive,
    History
} from "lucide-vue-next";
import type { Icon } from "lucide-vue-next";

const NUM_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const PLAYBACK_SPEEDS = [0.07, 0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 5, 7.5, 10, 12, 14, 16];
const VALID_EXTENSIONS = ["ogg", "webm", "mp4", "mkv", "mov", "mp3"];

// Close all windows when the main one is closed
getCurrent().onCloseRequested(() => {
    getAll().forEach((window) => {
        window.close();
    });
});

const youtubeButton = ref<HTMLButtonElement | null>(null);
const progressBar = ref<HTMLDivElement | null>(null);
const videoPlayer = ref<HTMLVideoElement | null>(null);
const progressCircle = ref<HTMLDivElement | null>(null);

const looping = ref<boolean>();
const isFullscreen = ref<boolean>(false);
const uiHidden = ref<boolean>(false);

const volumeCache = ref<number>(0.5);

const videoSrc = ref<string>("");
const videoTitle = ref<string>();
const videoChooser = ref<boolean>(false);

const transformationIcon = ref<Icon>();
const transformationText = ref<string>();

const circlePosition = computed(() => (currentTime.value / duration.value) * 100);

const { playing, currentTime, duration, volume, rate } = useMediaControls(videoPlayer, {
    src: videoSrc
});

useDraggable(progressCircle, {
    axis: "x",
    onMove: (e) => {
        if (progressBar.value) {
            seekVideoSection((e.x - progressBar.value.getBoundingClientRect().x) / progressBar.value.clientWidth);
        }
    },
    onEnd: (e) => {
        if (progressBar.value) {
            seekVideoSection((e.x - progressBar.value.getBoundingClientRect().x) / progressBar.value.clientWidth);
        }
    }
});

let playbackIndex = 5;

const toHHMMSS = (time: string): string => {
    const sec_num = parseInt(time, 10);

    const hours = Math.floor(sec_num / 3600);
    const minutes = Math.floor((sec_num - hours * 3600) / 60);
    const seconds = sec_num - hours * 3600 - minutes * 60;

    return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${
        seconds < 10 ? `0${seconds}` : seconds
    }`;
};

const { start, stop } = useTimeoutFn(() => {
    uiHidden.value = true;
}, 1250);

// A transformation alert shows up in the top right of the screen when the user
// does certain interactions (like increasing volumew)
const displayTransformationAlert = (icon: Icon, text?: string) => {
    transformationIcon.value = icon;

    if (text) {
        transformationText.value = text;
    } else {
        transformationText.value = "";
    }

    useTimeoutFn(() => {
        transformationIcon.value = undefined;
        transformationText.value = "";
    }, 600);
};

const getVolumeIcon = (volume: number) => {
    let icon;

    if (volume == 0) {
        icon = VolumeX;
    } else if (volume < 0.5) {
        icon = Volume1;
    } else {
        icon = Volume2;
    }

    return icon;
};

const increaseVolume = () => {
    if (volume.value < 1) {
        volume.value = parseFloat((volume.value + 0.1).toFixed(1));
    }

    displayTransformationAlert(getVolumeIcon(volume.value), `${parseFloat(volume.value.toFixed(1)) * 100}%`);
};

const decreaseVolume = () => {
    if (volume.value > 0) {
        volume.value = parseFloat((volume.value - 0.1).toFixed(1));
    }

    displayTransformationAlert(getVolumeIcon(volume.value), `${parseFloat(volume.value.toFixed(1)) * 100}%`);
};

const mute = () => {
    volumeCache.value = volume.value;

    volume.value = 0;
    displayTransformationAlert(getVolumeIcon(volume.value), `${parseFloat(volume.value.toFixed(1)) * 100}%`);
};

const unmute = () => {
    volume.value = volumeCache.value;
    displayTransformationAlert(getVolumeIcon(volume.value), `${parseFloat(volume.value.toFixed(1)) * 100}%`);
};

const forwardVideo = (amount: number) => {
    if (currentTime.value <= duration.value - amount) {
        currentTime.value += amount;
    }

    displayTransformationAlert(FastForward, `${amount}s`);
};

const rewindVideo = (amount: number) => {
    if (currentTime.value >= amount) {
        currentTime.value -= amount;
    } else {
        currentTime.value = 0;
    }

    displayTransformationAlert(Rewind, `${amount}s`);
};

const seekVideoSection = (videoSection: number) => {
    currentTime.value = videoSection * duration.value;
};

const setFullscreen = async () => {
    isFullscreen.value = !isFullscreen.value;

    await appWindow.setFullscreen(isFullscreen.value);
};

const playVideo = () => {
    if (!videoPlayer.value) {
        return;
    }

    if (playing.value) {
        videoPlayer.value.pause();

        displayTransformationAlert(Pause);
    } else {
        videoPlayer.value.play();

        displayTransformationAlert(Play);
    }
};

// Changes the playing speed of the video up or down depending on pre-set playback speeds
const changePlayrate = (direction: number) => {
    if (direction == 1) {
        if (playbackIndex < PLAYBACK_SPEEDS.length - 1) {
            playbackIndex++;
        }
    } else {
        if (playbackIndex > 0) {
            playbackIndex--;
        }
    }

    rate.value = PLAYBACK_SPEEDS[playbackIndex];
};

// Loops the video
const loopBack = () => {
    if (videoPlayer.value) {
        videoPlayer.value.currentTime = 0;
        videoPlayer.value.play();
    }
};

// Sets the src of the video
const setVideoSource = async (filepath: string, title?: string) => {
    if (!title) {
        title = await basename(filepath);
        const extension = await extname(filepath);
        title = title.replace(`.${extension}`, "");
    }

    localStorage.setItem("last-video", `${filepath}`);
    videoChooser.value = false;

    filepath = convertFileSrc(filepath);

    videoTitle.value = title;
    videoSrc.value = filepath;

    let fileExtension = await extname(filepath);

    if (!VALID_EXTENSIONS.includes(fileExtension.toLowerCase())) {
        console.warn("WARNING: file type might not work properly");
    }

    playVideo();
};

// Shows the file dialog to pick a video to play
const showVideoDialog = async () => {
    await open({
        multiple: false,
        filters: [{ name: "Supported Video Files", extensions: VALID_EXTENSIONS }]
    }).then((videoPath) => {
        if (videoPath) {
            setVideoSource(videoPath as string);
        }
    });
};

// Shows the help modal
const showHelpWindow = async () => {
    if (!playing.value) {
        playVideo();
    }

    const helpWindow = WebviewWindow.getByLabel("help");

    if (helpWindow) {
        helpWindow.close();
    }

    await invoke("show_help_window");
};

// Shows the youtube video picker modal
const showYoutubeModal = async () => {
    //The following is to prevent the modal from being opened again when pressing space after it has been closed
    youtubeButton.value?.blur();

    if (!playing.value) {
        playVideo();
    }

    await invoke("show_youtube_modal");
};

const setLoopMode = () => {
    if (looping.value) {
        videoPlayer.value?.removeEventListener("ended", loopBack);
    } else {
        videoPlayer.value?.addEventListener("ended", loopBack);
    }

    looping.value = !looping.value;
};

const keyDownEventHandler = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() == "d") {
        changePlayrate(1);
    } else if (event.key.toLowerCase() == "s") {
        changePlayrate(0);
    } else if (event.key.toLowerCase() == "j") {
        rewindVideo(10);
    } else if (event.key.toLowerCase() == "k") {
        forwardVideo(10);
    } else if (event.key == "F1") {
        showHelpWindow();
    } else if (event.key == "F11") {
        setFullscreen();
    } else if (event.key == "ArrowLeft") {
        rewindVideo(5);
    } else if (event.key == "ArrowRight") {
        forwardVideo(5);
    } else if (event.key == "ArrowUp") {
        increaseVolume();
    } else if (event.key == "ArrowDown") {
        decreaseVolume();
    } else if (NUM_KEYS.includes(event.key)) {
        seekVideoSection(parseInt(event.key) / 10);
    }
};

const keyUpEventHandler = (event: KeyboardEvent) => {
    if (event.key == " ") {
        playVideo();
    } else if (event.key.toLowerCase() == "o" && event.ctrlKey) {
        showVideoDialog();
    } else if (event.key == "/" && event.ctrlKey) {
        showHelpWindow();
    }
};

const mouseMoveHandler = () => {
    if (videoChooser.value) {
        uiHidden.value = true;
        return;
    }

    stop();
    uiHidden.value = false;
    start();
};

const wheelHandler = useThrottleFn((e: WheelEvent) => {
    if (e.deltaY < 0) {
        increaseVolume();
    } else {
        decreaseVolume();
    }
}, 125);

const showVideoChooser = () => {
    if (playing.value) {
        playVideo();
    }

    videoChooser.value = true;
};

const continueFromPrevious = () => {
    const previousVideo = localStorage.getItem("last-video");
    const previousTime = localStorage.getItem("last-time");

    if (previousTime) {
        currentTime.value = parseFloat(previousTime);
    } else {
        currentTime.value = 0;
    }

    if (previousVideo) {
        setVideoSource(previousVideo);
    } else {
        showVideoDialog();
    }
};

onBeforeMount(async () => {
    let videoPath: string = "";

    // Handles the IPC event emitted when the user picks a youtube video
    listen("video-downloaded", async (event) => {
        const payload = event.payload as { path: string; code: string };

        const temp = await basename(payload.path);
        const index = temp.indexOf(`[${payload.code}]`);
        const title = temp.substring(0, index - 1);

        setVideoSource(payload.path, title);
    });

    await getMatches().then((matches) => {
        videoPath = matches.args["videoPath"].value as string;
    });

    if (videoPath && (await exists(videoPath))) {
        const extension: string = await extname(videoPath);

        // Sets the video if the user does Open With or calls the program with a CLI path, otherwise shows the file dialog
        if (VALID_EXTENSIONS.includes(await extension.toLowerCase().substring(1, extension.toLowerCase().length))) {
            setVideoSource(videoPath);
            return;
        }
    }

    showVideoChooser();
});

watch(volume, (newValue) => {
    localStorage.setItem("last-volume", `${newValue}`);
});

watch(currentTime, (newValue) => {
    localStorage.setItem("last-time", `${newValue}`);
});

onMounted(() => {
    window.addEventListener("keydown", keyDownEventHandler);
    window.addEventListener("keyup", keyUpEventHandler);
    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("wheel", wheelHandler);

    const lastVolume = localStorage.getItem("last-volume");

    if (lastVolume && !isNaN(parseFloat(lastVolume))) {
        volume.value = parseFloat(lastVolume);
    }
});

onUnmounted(() => {
    window.removeEventListener("keydown", keyDownEventHandler);
    window.removeEventListener("keyup", keyUpEventHandler);
    window.removeEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("wheel", wheelHandler);
});
</script>

<template>
    <!-- Video chooser -->
    <div v-if="videoChooser" class="flex flex-col w-full h-full justify-center items-center bg-transparent">
        <div class="bg-charcoal p-[50px] flex gap-10 rounded-md outline-white outline-1 outline">
            <button
                class="flex flex-col justify-center items-center aspect-square w-[100px] text-md font-sans rounded-md bg-gray-600 text-white"
                @click="showVideoDialog"
            >
                <HardDrive :size="40" color="white" /> Local
            </button>
            <button
                class="flex flex-col justify-center items-center aspect-square w-[100px] text-md font-sans rounded-md bg-gray-600 text-white"
                @click="showYoutubeModal"
            >
                <Youtube :size="40" fill="red" /> Youtube
            </button>
            <button
                class="flex flex-col justify-center items-center aspect-square w-[100px] text-md font-sans rounded-md bg-gray-600 text-white"
                @click="continueFromPrevious"
            >
                <History :size="40" color="white" /> Previous
            </button>
        </div>
        <button
            class="bg-charcoal outline outline-1 outline-white text-white mt-4 w-24 p-2 rounded-md"
            @click="() => getCurrent().close()"
        >
            Quit
        </button>
    </div>
    <!-- Top bar -->
    <div class="bg-charcoal min-h-[30px] flex gap-1" v-if="!isFullscreen">
        <button @click="showHelpWindow" class="aspect-square w-[30px] p-1">
            <div class="flex items-center justify-center">
                <Info color="white" fill="#1958b7" />
            </div>
        </button>
        <button ref="youtubeButton" @click="showYoutubeModal">
            <div class="flex items-center justify-center">
                <Youtube fill="red" color="white" />
            </div>
        </button>
        <div class="w-full flex justify-center items-center text-white">
            <div class="flex flex-grow justify-center" data-tauri-drag-region>
                <span
                    class="select-none cursor-pointer p-1 px-2 outline outline-1 rounded-md m-1 text-sm bg-black"
                    @click="showVideoChooser"
                >
                    {{ videoTitle ?? "Change Video" }}
                </span>
            </div>
            <div class="float-right flex items-center justify-around flex-grow-0 w-[100px]">
                <Minus @click="() => getCurrent().minimize()" color="white" :size="20" />
                <Square @click="() => getCurrent().maximize()" color="white" :size="20" />
                <X @click="() => getCurrent().close()" color="white" :size="20" />
            </div>
        </div>
    </div>
    <!-- Plaayback rate -->
    <span v-if="!uiHidden" :class="`select-none absolute ${isFullscreen ? 'top-0' : 'top-[30px]'}`">{{
        rate.toFixed(2)
    }}</span>
    <!-- Transformation alert -->
    <Transition name="fade">
        <div
            v-if="transformationIcon"
            class="rounded-full bg-black outline outline-1 outline-white bg-opacity-50 flex flex-col justify-evenly items-center absolute m-4 right-0 aspect-square w-[100px]"
        >
            <div class="w-5"><component :is="transformationIcon" color="white" /></div>
            <span v-if="transformationText" class="text-white">{{ transformationText }}</span>
        </div>
    </Transition>
    <!-- Video player -->
    <div @click="playVideo" class="bg-black max-h-full h-full">
        <video ref="videoPlayer" class="max-w-full w-full"></video>
    </div>
    <!-- Progress bar -->
    <div class="flex flex-col w-[95%] bottom-[140px] relative mx-auto" :style="{ display: uiHidden ? 'none' : 'flex' }">
        <div
            class="flex h-[14px] items-center z-40 cursor-pointer"
            @click="
                (e) => {
                    progressBar
                        ? seekVideoSection((e.x - progressBar.getBoundingClientRect().x) / progressBar.clientWidth)
                        : undefined;
                }
            "
        >
            <div
                ref="progressBar"
                class="bg-black w-full h-[5px] bg-opacity-50"
                style="background: rgba(255, 255, 255, 0.5)"
            >
                <div class="w-0 bg-red-600 h-[5px]" :style="{ width: `${(currentTime / duration) * 100}%` }"></div>
                <div
                    ref="progressCircle"
                    class="rounded-full aspect-square w-4 bg-red-600 outline outline-1 outline-white absolute top-0 cursor-grab z-50"
                    :style="{
                        left: `${circlePosition}%`
                    }"
                ></div>
            </div>
        </div>
        <!-- Video information -->
        <div class="mt-1 flex justify-between">
            <span class="pointer-events-none">{{ toHHMMSS(Math.round(currentTime).toString()) }}</span>
            <span>{{ toHHMMSS(Math.round(duration).toString()) }}</span>
        </div>
    </div>
    <!-- Video controls -->
    <div
        :class="`w-full h-[80px] flex fixed bottom-0 left-0 items-center justify-between pl-8 pr-8 bg-gradient-to-b from-transparent to-black ${
            uiHidden ? 'hidden' : ''
        }`"
    >
        <div class="flex justify-start flex-1">
            <button @click="setLoopMode" class="aspect-square w-[75px]">
                <div class="flex items-center justify-center">
                    <Repeat :color="looping ? 'limegreen' : 'white'" />
                </div>
            </button>
            <button @click="volume ? mute() : unmute()" class="aspect-square w-[75px]">
                <div class="flex items-center justify-center">
                    <VolumeX v-if="!volume" color="white" />
                    <Volume2 v-else color="white" />
                </div>
            </button>
        </div>
        <div class="flex justify-center flex-1">
            <button @click="() => rewindVideo(5)" class="aspect-square w-[75px]">
                <div class="flex items-center justify-center">
                    <Rewind color="white" />
                </div>
            </button>
            <button @click="playVideo" class="aspect-square w-[75px]">
                <div class="flex items-center justify-center">
                    <Play v-if="!playing" color="white" />
                    <Pause v-else color="white" />
                </div>
            </button>
            <button @click="() => forwardVideo(5)" class="aspect-square w-[75px]">
                <div class="flex items-center justify-center">
                    <FastForward color="white" />
                </div>
            </button>
        </div>
        <div class="flex justify-end flex-1">
            <button @click="() => setFullscreen()" class="aspect-square w-[75px]">
                <div class="flex items-center justify-center">
                    <Minimize color="white" v-if="isFullscreen" />
                    <Maximize color="white" v-else />
                </div>
            </button>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
