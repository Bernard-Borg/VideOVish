<template>
    <div id="main-div" @keyup:Escape="closeWindow">
        <div id="header-div">
            <h1>Keyboard Shortcuts</h1>
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
import { WebviewWindow } from "@tauri-apps/api/window";

const closeWindow = async () => {
    await WebviewWindow.getByLabel("help")?.close();
};

window.addEventListener("keydown", (e) => {
    if (e.code === "Escape") {
        closeWindow();
    }
});
</script>
