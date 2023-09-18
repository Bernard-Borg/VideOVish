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
    X
} from "lucide-vue-next";
import type { Icon } from "lucide-vue-next";
import { HardDrive } from "lucide-vue-next";
import { History } from "lucide-vue-next";

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

const continueFromPrevious = () => {
    const previousVideo = localStorage.getItem("last-video");

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
        debugger;

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

    videoChooser.value = true;
});

watch(volume, (newValue) => {
    localStorage.setItem("last-volume", `${newValue}`);
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
    <div
        v-if="videoChooser"
        style="
            display: flex;
            width: 100%;
            height: 100%;
            justify-content: center;
            align-items: center;
            background-color: rgba(0, 0, 0, 0);
            z-index: 9999;
        "
    >
        <div
            id="video-chooser"
            style="background: #252526; padding: 50px; display: flex; gap: 50px; border-radius: 5px"
        >
            <button @click="showVideoDialog"><HardDrive :size="40" color="white" /> Local</button>
            <button><Youtube :size="40" fill="red" @click="showYoutubeModal" /> Youtube</button>
            <button @click="continueFromPrevious"><History :size="40" color="white" /> Previous</button>
        </div>
    </div>
    <div id="top-bar" v-if="!isFullscreen">
        <button id="help-button" @click="showHelpWindow">
            <div class="svg-container svg-container-top">
                <Info color="white" />
            </div>
        </button>
        <button ref="youtubeButton" id="youtube-button" @click="showYoutubeModal">
            <div class="svg-container svg-container-top">
                <Youtube fill="red" color="white" />
            </div>
        </button>
        <div id="drag-bar">
            <div style="display: flex; flex-grow: 1; justify-content: center" data-tauri-drag-region>
                <span id="video-title">{{ videoTitle }}</span>
            </div>
            <div id="top-bar-right-buttons">
                <Minus @click="() => getCurrent().minimize()" color="white" :size="20" />
                <Square @click="() => getCurrent().maximize()" color="white" :size="20" />
                <X @click="() => getCurrent().close()" color="white" :size="20" />
            </div>
        </div>
    </div>
    <span id="playspeed-indicator" style="user-select: none">{{ rate.toFixed(2) }}</span>
    <Transition name="fade">
        <div id="transformation-alert" v-if="transformationIcon">
            <div id="transformation-icon"><component :is="transformationIcon" color="white" /></div>
            <span id="transformation-text">{{ transformationText }}</span>
        </div>
    </Transition>
    <div id="main-video" @click="playVideo">
        <video ref="videoPlayer" id="video-player"></video>
    </div>
    <div id="progress-bar-container" :style="{ display: uiHidden ? 'none' : 'flex' }">
        <div
            id="progress-bar-wrapper"
            @click="
                (e) => {
                    progressBar
                        ? seekVideoSection((e.x - progressBar.getBoundingClientRect().x) / progressBar.clientWidth)
                        : undefined;
                }
            "
        >
            <div id="progress-bar" ref="progressBar">
                <div id="progress-color" :style="{ width: `${(currentTime / duration) * 100}%` }"></div>
                <div
                    id="progress-bar-circle"
                    ref="progressCircle"
                    :style="{
                        left: `${circlePosition}%`
                    }"
                ></div>
            </div>
        </div>
        <div id="video-info-container">
            <span id="video-current-time">{{ toHHMMSS(Math.round(currentTime).toString()) }}</span>
            <span id="video-duration"></span>
        </div>
    </div>
    <div
        id="video-controls"
        :style="{
            display: uiHidden ? 'none' : 'flex',
            justifyContent: 'space-between',
            paddingLeft: '16px',
            paddingRight: '16px',
            background: uiHidden ? 'transparent' : 'linear-gradient(transparent, black)'
        }"
    >
        <div style="display: flex; justify-content: start">
            <button id="loop-button" @click="setLoopMode">
                <div class="svg-container">
                    <Repeat :color="looping ? 'limegreen' : 'white'" />
                </div>
            </button>
            <button id="volume-button" @click="volume ? mute() : unmute()">
                <div class="svg-container">
                    <VolumeX v-if="!volume" color="white" />
                    <Volume2 v-else color="white" />
                </div>
            </button>
        </div>
        <div style="display: flex; justify-content: center">
            <button id="rewind-button" @click="() => rewindVideo(5)">
                <div class="svg-container">
                    <Rewind color="white" />
                </div>
            </button>
            <button id="play-button" @click="playVideo">
                <div class="svg-container">
                    <Play v-if="!playing" color="white" />
                    <Pause v-else color="white" />
                </div>
            </button>
            <button id="forward-button" @click="() => forwardVideo(5)">
                <div class="svg-container">
                    <FastForward color="white" />
                </div>
            </button>
        </div>
        <div style="display: flex; justify-content: end">
            <button id="maximise-button" @click="() => setFullscreen()">
                <div class="svg-container">
                    <Minimize color="white" v-if="isFullscreen" />
                    <Maximize color="white" v-else />
                </div>
            </button>
        </div>
    </div>
</template>

<style scoped>
#video-chooser > button {
    aspect-ratio: 1 / 1;
    width: 100px;
    font-size: 20px;
    border: 1px solid black;
    border-radius: 5px;
    font-family: "Inter", sans-serif;
    background: #555557;
    color: white;
}

#video-controls div {
    flex-grow: 1;
    flex-basis: 0;
}

#video-controls button:focus {
    outline: 3px solid white;
}

#playspeed-indicator,
#transformation-text,
#video-info-container > span {
    color: white;
    font-family: "Inter", "Segoe UI", sans-serif;
}

#playspeed-indicator {
    position: fixed;
    top: 30px;
}

#transformation-alert {
    border-radius: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    position: absolute;
    width: 100px;
    height: 100px;
    right: 0px;
}

#transformation-icon {
    width: 20px;
}

#top-bar {
    background-color: #252526;
    min-height: 30px;
    display: flex;
}

#top-bar-right-buttons {
    float: right;
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-grow: 0;
    width: 100px;
}

#drag-bar {
    -webkit-app-region: drag;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-family: "Inter", "Segoe UI", sans-serif;
}

#main-video {
    background: black;
    max-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

#video-title {
    pointer-events: none;
    user-select: none;
}

#video-controls {
    height: 80px;
    display: flex;
    position: fixed;
    bottom: 0px;
    left: 0px;
    background: linear-gradient(transparent, black);
    width: calc(100% - 32px);
    justify-content: center;
    align-items: center;
}

video {
    max-height: 100%;
    width: 100%;
}

#video-controls button,
#top-bar > button {
    width: 75px;
    height: 75px;
    background-color: transparent;
    outline: none;
    padding: 20px;
    border: none;
}

#top-bar > button {
    width: 30px;
    height: 30px;
    padding: 5px;
}

.svg-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

#video-info-container {
    margin-top: 5px;
}

#video-current-time {
    float: left;
    pointer-events: none;
}

#video-duration {
    float: right;
}

#progress-bar-wrapper {
    display: flex;
    height: 14px;
    align-items: center;
    z-index: 55;
    cursor: pointer;
}

#progress-bar-container {
    display: flex;
    flex-direction: column;
    width: 95%;
    bottom: 140px;
    position: relative;
    margin: 0 auto;
}

#progress-bar {
    background: rgba(255, 255, 255, 0.5);
    width: 100%;
    height: 5px;
}

#progress-bar-circle {
    border-radius: 100%;
    width: 16px;
    height: 16px;
    background-color: red;
    outline: 1px solid white;
    position: absolute;
    top: 0;
    cursor: grab;
    z-index: 60;
}

#progress-color {
    width: 0%;
    background-color: red;
    height: 3px;
    border: 2px solid red;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
