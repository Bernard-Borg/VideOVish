<template>
    <div id="main-div">
        <h1>Search video</h1>
        <input id="youtube-search" placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
        <span id="time-notice">This will take a while</span>
        <span id="loading-text">Loading</span>
    </div>
</template>

<script setup lang="ts">
import { WebviewWindow, getCurrent } from "@tauri-apps/api/window";

const closeWindow = async () => {
    await WebviewWindow.getByLabel("youtube")?.close();
};

getCurrent().listen("tauri://blur", () => {
    closeWindow();
});

// import { create: createYoutubeDl } from "youtube-dl-exec";
// import { v4: uuidv4 } from "uuid";
// import { invoke, path } from "@tauri-apps/api";
// import { createDir, exists, readDir } from "@tauri-apps/api/fs";

// // Loading... animation
// function animateLoadingText() {
//     let loadingText = document.getElementById("loading-text");

//     if (loadingText.innerText.includes("...")) {
//         loadingText.innerText = "Loading";
//     } else if (loadingText.innerText.includes("..")) {
//         loadingText.innerText = "Loading...";
//     } else if (loadingText.innerText.includes(".")) {
//         loadingText.innerText = "Loading..";
//     } else {
//         loadingText.innerHTML = "Loading.";
//     }
// }

// let wasSearchSuccessful = false;

// // Window setup and main logic
// window.onload = async function () {
//     // Prevents the default zooming behaviour when + is prressed
//     document.addEventListener("keydown", function (event) {
//         if (event.key === "+" && event.ctrlKey) {
//             event.preventDefault();
//         }
//     });

//     // Close window when Escape is pressed
//     document.addEventListener("keyup", async function (event) {
//         if (event.key == "Escape") {
//             await invoke("closeSecondaryWindow");
//             return;
//         }
//     });

//     let youtubedl;
//     let binaryPath;

//     // Get directory to youtube-dl-exec binary
//     await invoke("getAppDirectory").then(value => {
//         if (value == null) {
//             binaryPath = null;
//         }

//         binaryPath = path.join(value, "..", "app.asar.unpacked", "node_modules", "youtube-dl-exec", "bin", "yt-dlp.exe");
//     });

//     if (binaryPath != null) {
//         if (await exists(binaryPath)) {
//             youtubedl = createYoutubeDl(binaryPath);
//         } else {
//             // This alert shows up in development mode when trying to do youtube video since the binaryPath is not found
//             // Haven't gotten around to using ENV variables to alter the binary path in development mode
//             alert("Error - you messed with the program files - please reinstall");
//         }
//     } else {
//         youtubedl = require('youtube-dl-exec');
//     }

//     let videoDirectory;

//     // Get path to AppData
//     await invoke("getAppDataDirectory").then(value => {
//         videoDirectory = path.join(value, "youtube-downloads");

//         if (!await exists(videoDirectory)) {
//             createDir(videoDirectory);
//         }
//     });

//     document.getElementById("youtube-search").addEventListener("keyup", async function (event) {
//         document.getElementById("youtube-search").style.outline = "none";

//         if (event.key == "Enter") {
//             // Prevents user from clicking enter multiple times
//             if (wasSearchSuccessful) {
//                 return;
//             }

//             // Clears any previously loaded videos from youtube-downloads directory
//             readDir(videoDirectory, (err, files) => {
//                 if (err) throw err;

//                 for (const file of files) {
//                     fs.unlink(path.join(videoDirectory, file), err => {
//                         if (err) throw err;
//                     });
//                 }
//             });

//             let searchValue = document.getElementById("youtube-search").value;

//             let uuid = uuidv4();
//             let videoPath = `${videoDirectory}/${uuid}.tmp.mp4`;
//             let videoTitle = "";
//             let animationInterval;

//             // Gets the youtube video using youtube-dl
//             try {
//                 document.getElementById("loading-text").style.visibility = "visible";
//                 animationInterval = setInterval(animateLoadingText, 150);

//                 await youtubedl(searchValue, {
//                     dumpSingleJson: true
//                 }).then(output => {
//                     videoTitle = output.title;

//                     if (output.duration >= 60 * 60) {
//                         document.getElementById("time-notice").style.visibility = "visible";
//                     }
//                 });

//                 wasSearchSuccessful = true;

//                 await youtubedl(searchValue, {
//                     output: videoPath
//                 });

//                 ipcRenderer.invoke("changeVideoYoutube", videoPath, videoTitle);
//             } catch (error) {
//                 document.getElementById("youtube-search").style.outline = "1px solid red";
//                 console.log(error);
//             } finally {
//                 document.getElementById("loading-text").style.visibility = "hidden";
//                 document.getElementById("time-notice").style.visibility = "hidden";
//                 clearInterval(animationInterval);
//             }
//         }
//     });
// };
</script>

<style scoped>
#main-div {
    border-radius: 5px;
    background-color: #252526;
    width: 100%;
    padding: 40px 50px;
}

input {
    border-radius: 50px;
    padding: 20px;
    width: 400px;
    font-family: "Inter", "Segoe UI", sans-serif;
}

#loading-text {
    visibility: hidden;
    position: absolute;
    right: 10px;
    bottom: 10px;
}

#time-notice {
    visibility: hidden;
    position: absolute;
    left: 10px;
    bottom: 10px;
}
</style>
