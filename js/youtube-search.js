const { create: createYoutubeDl } = require("youtube-dl-exec");
const fs = require('fs');
const path = require('path');

const { v4: uuidv4 } = require('uuid');
const { ipcRenderer } = require("electron");

function animateLoadingText() {
    let loadingText = document.getElementById("loading-text");

    if (loadingText.innerText.includes("...")) {
        loadingText.innerText = "Loading";
    } else if (loadingText.innerText.includes("..")) {
        loadingText.innerText = "Loading...";
    } else if (loadingText.innerText.includes(".")) {
        loadingText.innerText = "Loading..";
    } else {
        loadingText.innerHTML = "Loading.";
    }
}

let wasSearchSuccessful = false;

window.onload = async function () {
    let youtubedl;
    let binaryPath;

    await ipcRenderer.invoke("getAppDirectory").then(value => {
        binaryPath = path.join(value, "..", "app.asar.unpacked", "node_modules", "youtube-dl-exec", "bin", "yt-dlp.exe");
        console.log(binaryPath);
    });

    if (fs.existsSync(binaryPath)) {
        youtubedl = createYoutubeDl(binaryPath);
    } else {
        alert("Error - you messed with the program files - please reinstall");
    }

    let videoDirectory;

    await ipcRenderer.invoke("getAppDataDirectory").then(value => {
        videoDirectory = path.join(value, "youtube-downloads");

        if (!fs.existsSync(videoDirectory)) {
            fs.mkdirSync(videoDirectory);
        }
    });

    document.getElementById("youtube-search").addEventListener("keyup", async function (event) {
        document.getElementById("youtube-search").style.outline = "none";

        if(event.key == "Enter") {
            //Prevents user from clicking enter multiple times
            if (wasSearchSuccessful) {
                return;
            }

            //Clears any previously loaded videos from youtube-downloads directory
            fs.readdir(videoDirectory, (err, files) => {
                if (err) throw err;
    
                for (const file of files) {
                    fs.unlink(path.join(videoDirectory, file), err => {
                        if (err) throw err;
                    });
                }
            });

            let searchValue = document.getElementById("youtube-search").value;

            let uuid = uuidv4();
            let videoPath = `${videoDirectory}/${uuid}.tmp.mp4`;
            let videoTitle = "";
            let animationInterval;

            try {
                document.getElementById("loading-text").style.visibility = "visible";
                animationInterval = setInterval(animateLoadingText, 150);

                await youtubedl(searchValue, {
                    dumpSingleJson: true
                }).then(output => {
                    videoTitle = output.title;

                    if (output.duration >= 60 * 60) {
                        document.getElementById("time-notice").style.visibility = "visible";
                    }
                });

                wasSearchSuccessful = true;

                await youtubedl(searchValue, {
                    output: videoPath
                });

                ipcRenderer.invoke("changeVideoYoutube", videoPath, videoTitle);
            } catch (error) {
                document.getElementById("youtube-search").style.outline = "1px solid red";
                console.log(error);
            } finally {
                document.getElementById("loading-text").style.visibility = "hidden";
                document.getElementById("time-notice").style.visibility = "hidden";
                clearInterval(animationInterval);
            }
        }
    });
};
