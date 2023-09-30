# VideOVish

A minimalist video player app which supports MP4, OGG and WEBM, MKV and MOV formats (can also play MP3 audio files) and can play/download YouTube videos - rebuilt from the ground up with Tauri, Vue and TailwindCSS!

## Features

The feature set and interface of the video player was inspired by both Windows' Films & TV app and the YouTube video player. The interface is quite simple and the video player has a number of features;

- Forwarding and rewinding the video (buttons/hotkeys)
- Speeding up and slowing down the video (through the S and D hotkeys)
- Increasing and decreasing volume (through the up and down arrows, now also with quick mute)
- Video seeking (hotkeys 0 - 9, or the progress bar like on YouTube)
- Video looping
- Playing a video from Youtube (using the URL)
- Downloading videos from YouTube (URL/Search term)

Tauri (2.0) changes;

- The entire program is now (about 2-3x) smaller in size and should load quicker
- Downloading YouTube videos now takes less time, and better quality downloads are available
- A quick mute button and shortcut have been added
- You can now drag the progress bar circle to move the video back/forward (while viewing what you're seeking to)
- You can now change volume using the mouse's scroll wheel
- You can now clear cache from previously downloaded YouTube videos
- The video player now remembers where you left off, and your volume preference.
- The user interface (including the icons) has been redone
- You can now download videos you've watched directly through the player (you no longer need to use online ad-plagued downloaders)
- The video player now also no longer has those annoying Ctrl+O alerts.
- The entire codebase has been rewritten, so now fixes and improvements can ship quicker
- If an error occurs, you should be notified and these notifications allow you to quickly copy their information so that you can put it in an issue >_>

## App screenshot

![image](https://user-images.githubusercontent.com/35971384/208214326-63067413-8acc-4e0b-b727-5fb9f56456bc.png)

## Further possible improvements

Any suggestions are welcome (feel free to open any Issues with improvement suggestions). Despite this, I work full time and might not have too much available time to work on them.

Thinking about;

- YouTube video subtitles
- Reducing file size even further (a smaller version of ffmpeg would be ideal - optionally, ffmpeg can also be disableable during installation, but this would require adjustments to the YouTube downloader to only allow 1080p+ if this module has been installed/the user provides their own ffmpeg path)
- Picture in picture mode
- Fixing the "preferred quality" to fallback to lower qualities when higher ones aren't available
- Better error messages when downloading youtube video + progress bar for longer videos
- When saving a YouTube video it provides the correct file path to that video/audio (right now it just assumed .mp4)
- Rewriting the backend when I understand Rust better (I'm sure I've made some inefficiencies there)
- Supporting other formats/streaming video while it's downloading
- Multi-language support

## Contributions

App ideas and bug testing were assisted by my friends [RPC263](https://www.youtube.com/channel/UCSeiYh0FIlEvGGxT49LK2ew) and [BabyYoda2001](https://github.com/BabyYoda2001) 

Thank you Robert Condorache for your [review](https://www.softpedia.com/get/Multimedia/Video/Video-Players/VideOVish.shtml). The majority of your suggestions have been implemented/are in the works.

***Note: I am very new to open-source and I do not know how everything works, so bare with my newbieness.***
