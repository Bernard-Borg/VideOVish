const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
window.$ = require('jquery');

const NUM_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
const PLAYBACK_SPEEDS = [0.07, 0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 5, 7.5, 10, 12, 14, 16]
const VALID_EXTENSIONS = ['.ogg', '.webm', '.mp4']

let playingVideoInterval = null;
let playbackIndex = 5;

function getVideo() {
    let video = document.getElementById("video-player");

    if (video.src == '') {
        alert("Restart the application to specify a video to play.");
    }
    
    return video;
}

String.prototype.toHHMMSS = function () {
    let sec_num = parseInt(this, 10);
    let hours = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
}

let transformationTimeout = undefined;

// jQuery was added solely for this transformation - maybe find a way to do it without jQuery, so that it saves on app size
function fadeTransformationAlert() {
    $("#transformation-alert").fadeOut();
}

function displayTransformationAlert(icon, text) {
    clearTimeout(transformationTimeout);

    document.getElementById("transformation-icon").innerHTML = icon;
    document.getElementById("transformation-text").innerText = text;
    console.log(document.getElementById("transformation-alert"));

    let transformationAlert = document.getElementById("transformation-alert");
    transformationAlert.style.opacity = "1";
    transformationAlert.style.visibility = "visible";
    transformationAlert.style.display = "flex";


    transformationTimeout = setTimeout(fadeTransformationAlert, 750);
}

function updateVideoInformation(video = null) {
    let theVideo;

    if (video != null) {
        theVideo = video;
    } else {
        theVideo = getVideo();
    }

    let time = Math.round(theVideo.currentTime).toString().toHHMMSS();

    if (theVideo.currentTime == theVideo.duration) {
        time = theVideo.duration.toString().toHHMMSS();
        document.getElementById("play-icon").style.display = "block";
        document.getElementById("pause-icon").style.display = "none";
    }

    document.getElementById("video-current-time").innerText = time;
    document.getElementById("progress-bar-circle").style.marginLeft = `${theVideo.currentTime / theVideo.duration * 100}%`;
    document.getElementById("progress-color").style.width = `${theVideo.currentTime / theVideo.duration * 100}%`;
}

function updatePlaybackText(video = null) {
    let theVideo;
    
    if (video != null) {
        theVideo = video;
    } else {
        theVideo = getVideo();
    }

    document.getElementById("playspeed-indicator").innerText = theVideo.playbackRate.toFixed(2);
}

function getVolumeIcon(volume) {
    let icon;

    if (volume == 0) {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M301.2 34.85c-11.5-5.188-25.02-3.122-34.44 5.253L131.8 160H48c-26.51 0-48 21.49-48 47.1v95.1c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9c5.984 5.312 13.58 8.094 21.26 8.094c4.438 0 8.972-.9375 13.17-2.844c11.5-5.156 18.82-16.56 18.82-29.16V64C319.1 51.41 312.7 40 301.2 34.85zM513.9 255.1l47.03-47.03c9.375-9.375 9.375-24.56 0-33.94s-24.56-9.375-33.94 0L480 222.1L432.1 175c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94l47.03 47.03l-47.03 47.03c-9.375 9.375-9.375 24.56 0 33.94c9.373 9.373 24.56 9.381 33.94 0L480 289.9l47.03 47.03c9.373 9.373 24.56 9.381 33.94 0c9.375-9.375 9.375-24.56 0-33.94L513.9 255.1z"/></svg>`;
    } else if (volume < 0.5) {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M412.6 181.9c-10.28-8.344-25.41-6.875-33.75 3.406c-8.406 10.25-6.906 25.37 3.375 33.78C393.5 228.4 400 241.8 400 256c0 14.19-6.5 27.62-17.81 36.87c-10.28 8.406-11.78 23.53-3.375 33.78c4.719 5.812 11.62 8.812 18.56 8.812c5.344 0 10.75-1.781 15.19-5.406C435.1 311.6 448 284.7 448 256S435.1 200.4 412.6 181.9zM301.2 34.84c-11.5-5.187-25.01-3.116-34.43 5.259L131.8 160H48c-26.51 0-48 21.49-48 47.1v95.1c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9C272.7 477.2 280.3 480 288 480c4.438 0 8.959-.9313 13.16-2.837C312.7 472 320 460.6 320 448V64C320 51.41 312.7 39.1 301.2 34.84z"/></svg>`;
    } else {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M412.6 182c-10.28-8.334-25.41-6.867-33.75 3.402c-8.406 10.24-6.906 25.35 3.375 33.74C393.5 228.4 400 241.8 400 255.1c0 14.17-6.5 27.59-17.81 36.83c-10.28 8.396-11.78 23.5-3.375 33.74c4.719 5.806 11.62 8.802 18.56 8.802c5.344 0 10.75-1.779 15.19-5.399C435.1 311.5 448 284.6 448 255.1S435.1 200.4 412.6 182zM473.1 108.2c-10.22-8.334-25.34-6.898-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C476.6 172.1 496 213.3 496 255.1s-19.44 82.1-53.31 110.7c-10.25 8.396-11.75 23.5-3.344 33.74c4.75 5.775 11.62 8.771 18.56 8.771c5.375 0 10.75-1.779 15.22-5.431C518.2 366.9 544 313 544 255.1S518.2 145 473.1 108.2zM534.4 33.4c-10.22-8.334-25.34-6.867-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C559.9 116.3 592 183.9 592 255.1s-32.09 139.7-88.06 185.5c-10.25 8.396-11.75 23.5-3.344 33.74C505.3 481 512.2 484 519.2 484c5.375 0 10.75-1.779 15.22-5.431C601.5 423.6 640 342.5 640 255.1S601.5 88.34 534.4 33.4zM301.2 34.98c-11.5-5.181-25.01-3.076-34.43 5.29L131.8 160.1H48c-26.51 0-48 21.48-48 47.96v95.92c0 26.48 21.49 47.96 48 47.96h83.84l134.9 119.8C272.7 477 280.3 479.8 288 479.8c4.438 0 8.959-.9314 13.16-2.835C312.7 471.8 320 460.4 320 447.9V64.12C320 51.55 312.7 40.13 301.2 34.98z"/></svg>`;
    }

    return icon;
}

function increaseVolume() {
    let video = getVideo();

    if (video.volume < 1) {
        video.volume = (video.volume + 0.1).toFixed(1);
    }

    displayTransformationAlert(getVolumeIcon(video.volume), `${video.volume.toFixed(1) * 100}%`);
}

function decreaseVolume() {
    let video = getVideo();

    if (video.volume > 0) {
        video.volume = (video.volume - 0.1).toFixed(1);
    }

    displayTransformationAlert(getVolumeIcon(video.volume), `${video.volume.toFixed(1) * 100}%`);
}

function forwardVideo(amount) {
    let video = getVideo();

    if (video.currentTime <= video.duration - amount) {
        video.currentTime += amount;
    }

    displayTransformationAlert(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M496 48V192c0 17.69-14.31 32-32 32H320c-17.69 0-32-14.31-32-32s14.31-32 32-32h63.39c-29.97-39.7-77.25-63.78-127.6-63.78C167.7 96.22 96 167.9 96 256s71.69 159.8 159.8 159.8c34.88 0 68.03-11.03 95.88-31.94c14.22-10.53 34.22-7.75 44.81 6.375c10.59 14.16 7.75 34.22-6.375 44.81c-39.03 29.28-85.36 44.86-134.2 44.86C132.5 479.9 32 379.4 32 256s100.5-223.9 223.9-223.9c69.15 0 134 32.47 176.1 86.12V48c0-17.69 14.31-32 32-32S496 30.31 496 48z"/></svg>`, 
        `${amount}s`
    );

    updateVideoInformation();
}

function rewindVideo(amount) {
    let video = getVideo();

    if (video.currentTime >= amount) {
        video.currentTime -= amount;
    } else {
        video.currentTime = 0;
    }

    displayTransformationAlert(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M480 256c0 123.4-100.5 223.9-223.9 223.9c-48.86 0-95.19-15.58-134.2-44.86c-14.14-10.59-17-30.66-6.391-44.81c10.61-14.09 30.69-16.97 44.8-6.375c27.84 20.91 61 31.94 95.89 31.94C344.3 415.8 416 344.1 416 256s-71.67-159.8-159.8-159.8C205.9 96.22 158.6 120.3 128.6 160H192c17.67 0 32 14.31 32 32S209.7 224 192 224H48c-17.67 0-32-14.31-32-32V48c0-17.69 14.33-32 32-32s32 14.31 32 32v70.23C122.1 64.58 186.1 32.11 256.1 32.11C379.5 32.11 480 132.6 480 256z"/></svg>`, 
        `${amount}s`
    );

    updateVideoInformation();
}

function seekVideoSection(videoSection) {
    let video = getVideo();

    video.currentTime = videoSection * video.duration;
}

function playVideo() {
    let video = getVideo();

    if (video.paused) {
        video.play();
        document.getElementById("play-icon").style.display = "none";
        document.getElementById("pause-icon").style.display = "block";

        let intervalDuration = video.playbackRate * 1000;
        playingVideoInterval = setInterval(updateVideoInformation, intervalDuration);
    } else {
        video.pause();
        document.getElementById("play-icon").style.display = "block";
        document.getElementById("pause-icon").style.display = "none";
        clearInterval(playingVideoInterval);
    }
}

function changePlayrate(direction) {
    let video = getVideo();

    if (direction == 1) {
        if (playbackIndex < PLAYBACK_SPEEDS.length - 1) {
            playbackIndex++;
        }
    } else {
        if (playbackIndex > 0) {
            playbackIndex--;
        }
    }

    video.playbackRate = PLAYBACK_SPEEDS[playbackIndex];
}

function setVideoSource(filepath) {
    let videoSource = document.getElementById("video-player");
    videoSource.src = filepath;

    let fileExtension = path.extname(filepath);
    let type = "";

    if (fileExtension.toLowerCase() == ".ogg") {
        type = "video/ogg";
    } else if (fileExtension.toLowerCase() == ".webm") {
        type = "video/webm";
    } else if (fileExtension.toLowerCase() == ".mp4") {
        type = "video/mp4";
    } else {
        console.warn("WARNING: file type not supported");
    }

    videoSource.type = type;
}

window.onload = async function () {
    let videoArgs;
    
    await ipcRenderer.invoke("getVideoArgs").then((result) => {
        videoArgs = result;
    });

    if (videoArgs.length > 1 && fs.existsSync(videoArgs[1]) && VALID_EXTENSIONS.includes(path.extname(videoArgs[1]).toLowerCase())) {
        setVideoSource(videoArgs[1]);
    } else {
        await ipcRenderer.invoke("showDialog").then((result) => {
            let videoPath = result.filePaths[0];

            if (videoPath !== undefined) {
                setVideoSource(videoPath);
            }
        });
    }

    let video = getVideo();

    updatePlaybackText(video);
    updateVideoInformation(video);

    video.onloadedmetadata = function() {
        document.getElementById("video-duration").innerText = getVideo().duration.toString().toHHMMSS();
    }

    document.getElementById("progress-bar").addEventListener("click", function (event) {
        seekVideoSection(event.offsetX / document.getElementById("progress-bar").clientWidth);
        updateVideoInformation();
    });

    window.addEventListener("keydown", function (event) {
        if (event.key == "d" || event.key == "D") {
            changePlayrate(1);
            updatePlaybackText();
        } else if (event.key == "s" || event.key == "S") {
            changePlayrate(0);
            updatePlaybackText();
        } else if (event.key == "j" || event.key == "J") {
            rewindVideo(10);
        } else if (event.key == "k" || event.key == "K") {
            forwardVideo(10);
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
            updateVideoInformation();
        }
    });

    window.addEventListener("keyup", function (event) {
        if (event.key == " ") {
            playVideo();
        }
    });

    document.getElementById("rewind-button").addEventListener("click", function () {
        rewindVideo(5);
    });

    document.getElementById("play-button").addEventListener("click", function () {
        playVideo();
    });

    document.getElementById("forward-button").addEventListener("click", function () {
        forwardVideo(5);
    });
}