const MINIMUM_PLAYBACK_SPEED = 0.10;
const MAXIMUM_PLAYBACK_SPEED = 16.0;

const NUM_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
const PLAYBACK_SPEEDS = [0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 5, 7.5, 10, 12, 14, 16]

let playingVideoInterval = null;
let playbackIndex = 5;

function getVideo() {
    return document.getElementById("video-player");
}

String.prototype.toHHMMSS = function () {
    let sec_num = parseInt(this, 10);
    let hours   = Math.floor(sec_num / 3600);
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

function updateVideoInformation() {
    let video = getVideo();
    let time = Math.round(video.currentTime).toString().toHHMMSS();

    if (video.currentTime == video.duration) {
        time = video.duration.toString().toHHMMSS();
        document.getElementById("play-icon").style.display = "block";
        document.getElementById("pause-icon").style.display = "none";
    }

    document.getElementById("video-current-time").innerText = time;
    document.getElementById("progress-bar-circle").style.marginLeft = `${video.currentTime / video.duration * 100}%`;
    document.getElementById("progress-color").style.width = `${video.currentTime / video.duration * 100}%`;
}

function updatePlaybackText() {
    document.getElementById("playspeed-indicator").innerText = getVideo().playbackRate.toFixed(2);
}

function increaseVolume() {
    let video = getVideo();

    if (video.volume < 1) {
        video.volume = (video.volume + 0.1).toFixed(1);
    }
}

function decreaseVolume() {
    let video = getVideo();
    
    if (video.volume > 0) {
        video.volume = (video.volume - 0.1).toFixed(1);
    }
}

function forwardVideo(amount) {
    let video = getVideo();
        
    if (video.currentTime <= video.duration - amount) {
        video.currentTime += amount;
    }

    updateVideoInformation();
}

function rewindVideo(amount) {
    let video = getVideo();

    if (video.currentTime >= amount) {
        video.currentTime -= amount;
    } else {
        video.currentTime = 0;
    }

    updateVideoInformation();
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
        if (playbackIndex < PLAYBACK_SPEEDS.length) {
            playbackIndex++;
        }
    } else {
        if (playbackIndex > 0) {
            playbackIndex--;
        }
    }

    video.playbackRate = PLAYBACK_SPEEDS[playbackIndex];
}

window.onload = function() {
    updatePlaybackText();
    updateVideoInformation();
    
    document.getElementById("video-duration").innerText = getVideo().duration.toString().toHHMMSS();

    document.getElementById("progress-bar").addEventListener("click", function(event) {
        let video = getVideo();

        video.currentTime = (event.offsetX / document.getElementById("progress-bar").clientWidth) * video.duration;
        console.log(event.offsetX);
        updateVideoInformation();
    });

    window.addEventListener("keydown", function(event) {
        let video = getVideo();

        if (event.key == "d" || event.key == "D") {
            if (video.playbackRate < MAXIMUM_PLAYBACK_SPEED) {
                changePlayrate(1);
                updatePlaybackText();
            }
        } else if (event.key == "s" || event.key == "S") {
            if (video.playbackRate > MINIMUM_PLAYBACK_SPEED) {
                changePlayrate(0);
                updatePlaybackText();
            }
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
            video.currentTime = (parseInt(event.key) / 10) * video.duration;
            updateVideoInformation();
        }
    });

    window.addEventListener("keyup", function(event) {
        let video = getVideo();

        if (event.key == " ") {
            playVideo();
        }
    });

    document.getElementById("rewind-button").addEventListener("click", function (){
        rewindVideo(5);
    });

    document.getElementById("play-button").addEventListener("click", function (){
        playVideo();
    });

    document.getElementById("forward-button").addEventListener("click", function() {
        forwardVideo(5);
    });
}