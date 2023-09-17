<template>
    <div id="main-div">
        <div id="header-div">
            <h1>Keyboard Shortcuts</h1>
            <X color="white" @click="closeWindow" />
        </div>
        <div id="info-div">
            <div class="info-container">
                <h2>Video Playback</h2>
                <p>These shortcuts have to do with playing the video.</p>
                <h3>PLAY/PAUSE</h3>
                <div class="key control-key">SPACE</div>
                <h3>SLOW DOWN VIDEO</h3>
                <div class="key">S</div>
                <h3>SPEED UP VIDEO</h3>
                <div class="key">D</div>
                <h3>REWIND 5 SECONDS</h3>
                <div class="key">←</div>
                <h3>FAST FORWARD 5 SECONDS</h3>
                <div class="key">→</div>
                <h3>REWIND 10 SECONDS</h3>
                <div class="key">J</div>
                <h3>FAST FORWARD 10 SECONDS</h3>
                <div class="key">K</div>
                <h3>INCREASE VOLUME</h3>
                <div class="key">↑</div>
                <h3>DECREASE VOLUME</h3>
                <div class="key">↓</div>
                <h3>SEEK LOCATION</h3>
                <div class="key-container">
                    <div class="key">0</div>
                    <span class="key-symbol">-</span>
                    <div class="key">9</div>
                </div>
            </div>
            <div class="info-container">
                <h2>App Management</h2>
                <p>These shortcuts have to do with managing the app itself.</p>
                <h3>HELP MENU</h3>
                <div class="key-container">
                    <div class="key">F1</div>
                    <span class="key-symbol">/</span>
                    <div class="control-key key">CTRL</div>
                    <span class="key-symbol">+</span>
                    <div class="key">/</div>
                </div>
                <h3>TOGGLE FULLSCREEN</h3>
                <div class="key">F11</div>
                <h3>PICK VIDEO TO VIEW</h3>
                <div class="key-container">
                    <div class="key control-key">CTRL</div>
                    <span class="key-symbol">+</span>
                    <div class="key">O</div>
                </div>
                <h3>CLOSE SECONDARY WINDOW</h3>
                <div class="key">ESC</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { WebviewWindow, getCurrent } from "@tauri-apps/api/window";
import { X } from "lucide-vue-next";
import { onMounted, onUnmounted } from "vue";

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
#main-div {
    border-radius: 5px;
    background-color: #252526;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
}

#main-div > div {
    padding: 20px 50px;
}

#info-div {
    display: flex;
    padding: 20px 50px 50px 50px !important;
}

.info-container {
    padding: 0px 10px;
}

#header-div {
    border-bottom: 1px solid rgb(30, 30, 30);
    padding: 20px 0px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

h1,
h2,
h3,
p,
span,
.key {
    font-family: "Inter", "Segoe UI", sans-serif;
    color: white;
}

h1 {
    font-weight: lighter;
}

h3 {
    font-size: 13px;
}

p {
    margin-bottom: 35px;
}

.key {
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    width: 20px;
    height: 10px;
    background-color: rgb(22, 22, 22);
    box-shadow: 0px 5px black;
    margin-right: 10px;
}

span.key-symbol {
    margin-top: 5px;
    margin-right: 10px;
}

.key-container {
    display: flex;
}

.control-key {
    width: 40px;
}
</style>
