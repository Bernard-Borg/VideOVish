// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
async fn show_help_window(handle: tauri::AppHandle) {
    let _help_window = tauri::WindowBuilder::new(
        &handle,
        "help", /* the unique window label */
        tauri::WindowUrl::App("help".into()),
    )
    .inner_size(1024.0, 768.0)
    .min_inner_size(480.0, 480.0)
    .skip_taskbar(true)
    .title("Help")
    .build()
    .unwrap();
}

#[tauri::command]
async fn show_youtube_modal(handle: tauri::AppHandle) {
    let _youtube_window = tauri::WindowBuilder::new(
        &handle,
        "youtube", /* the unique window label */
        tauri::WindowUrl::App("youtube".into()),
    )
    .inner_size(680.0, 250.0)
    .min_inner_size(480.0, 200.0)
    .build()
    .unwrap();
}

#[tauri::command]
async fn change_video_youtube(video_path: String, video_title: String) {
    // mainWindow.webContents.send('youtube-video-path', `${videoPath}*${videoTitle}`);
    // youtubeSelectorWindow.destroy();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            show_help_window,
            show_youtube_modal
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// // Opens up the help modal
// ipcMain.handle("showHelpModal", (e) => {
//     const helpWindow = new BrowserWindow({
//         width: 1024,
//         height: 768,
//         minHeight: 480,
//         minWidth: 480,
//         titleBarStyle: "hidden",
//         resizable: false,
//         transparent: true,
//         frame: false,
//         webPreferences: {
//             nodeIntegration: true,
//             contextIsolation: false,
//             enableRemoteModule: true,
//         },
//         type: "toolbar",
//         autoHideMenuBar: true,
//         icon: path.join(__dirname, "VideoPlayerIcon.ico"),
//     });

//     helpWindow.loadFile("html/help.html");

//     helpWindow.on("blur", () => {
//         helpWindow.destroy();
//     });

//     secondaryWindow = helpWindow;
// });

// // Opens up the YouTube video selector modal
// ipcMain.handle("showYoutubeModal", (e) => {
//     youtubeSelectorWindow = new BrowserWindow({
//         width: 600,
//         height: 250,
//         minHeight: 200,
//         minWidth: 480,
//         titleBarStyle: "hidden",
//         resizable: false,
//         transparent: true,
//         frame: false,
//         webPreferences: {
//             nodeIntegration: true,
//             contextIsolation: false,
//             enableRemoteModule: true,
//         },
//         type: "toolbar",
//         autoHideMenuBar: true,
//         icon: path.join(__dirname, "VideoPlayerIcon.ico"),
//     });

//     youtubeSelectorWindow.loadFile("html/youtube.html");

//     youtubeSelectorWindow.on("blur", () => {
//         youtubeSelectorWindow.destroy();
//     });

//     secondaryWindow = youtubeSelectorWindow;
// });
