const MINIMUM_PLAYBACK_SPEED = 0.10;
const MAXIMUM_PLAYBACK_SPEED = 16.0;

function getVideo() {
    return document.getElementById("video-player");
}

function updatePlaybackText() {
    document.getElementById("playspeed-indicator").innerText = getVideo().playbackRate;
}

window.onload = function() {
    updatePlaybackText();

    window.addEventListener("keyup", function(event) {
        let video = getVideo();

        if (event.key == "d" || event.key == "D") {
            if (video.playbackRate < MAXIMUM_PLAYBACK_SPEED) {
                video.playbackRate += 0.1;
                updatePlaybackText();
            }
        } else if (event.key == "s" || event.key == "S") {
            if (video.playbackRate > MINIMUM_PLAYBACK_SPEED) {
                video.playbackRate -= 0.1;
                updatePlaybackText();
            }
        }
    });

    document.getElementById("rewind-button").addEventListener("click", function (){
        let video = getVideo();

        if (video.currentTime >= 5) {
            video.currentTime -= 5;
        } else {
            video.currentTime = 0;
        }
    });

    document.getElementById("play-button").addEventListener("click", function (){
        let video = getVideo();

        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    });

    document.getElementById("forward-button").addEventListener("click", function() {
        let video = getVideo();
        
        if (video.currentTime <= video.duration - 5) {
            video.currentTime += 5;
        }
    });
}