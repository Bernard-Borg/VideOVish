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
    .decorations(false)
    .transparent(true)
    .always_on_top(true)
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
    .decorations(false)
    .transparent(true)
    .always_on_top(true)
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
