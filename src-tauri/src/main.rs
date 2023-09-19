// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, path::Path};
use tauri::{
    api::process::{Command, CommandEvent},
    Manager,
};

#[tauri::command]
async fn show_help_window(handle: tauri::AppHandle) {
    if !handle.get_window("help").is_none() {
        return;
    }

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
    if !handle.get_window("youtube").is_none() {
        return;
    }

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

#[derive(Clone, serde::Serialize)]
struct Payload {
    path: String,
    code: String,
}

#[tauri::command]
async fn download_video(handle: tauri::AppHandle, url: String, code: String) -> String {
    // Get path to youtube_downloads foldre
    let app_data_dir = handle.path_resolver().app_data_dir().unwrap();
    let downloads_folder = Path::new(&app_data_dir).join("youtube_downloads");

    // Create folder if it doesn't exist
    if !downloads_folder.is_dir() {
        fs::create_dir_all(&downloads_folder).expect("Could not create downloads folder");
    }

    let mut vid_path: String = String::from("");

    println!("Code: {}", code);

    for entry in glob::glob(format!("{}/*[{}].*", downloads_folder.display(), code).as_str())
        .expect("Failed to read glob pattern")
    {
        match entry {
            Ok(path) => {
                println!("Hi from rust");
                vid_path = path.display().to_string();

                break;
            }
            Err(e) => println!("{:?}", e),
        }
    }

    println!("Video path: {}", vid_path);

    if vid_path.len() > 0 {
        println!("Getting video from cache");

        let _ = handle
            .get_window("main")
            .unwrap()
            .emit(
                "video-downloaded",
                Payload {
                    path: vid_path,
                    code: code,
                },
            )
            .expect("");

        return "".to_string();
    }

    let (mut rx, mut child) = Command::new_sidecar("yt-dlp")
        .expect("Failed to create yt-dlp binary command")
        .args([
            url,
            "-P".to_string(),
            downloads_folder.display().to_string(),
            "--extractor-args".to_string(),
            "youtube:skip=hls,dash;youtube:skip=translated_subs".to_string(),
            "-f".to_string(),
            "137+251".to_string(),
            "--print".to_string(),
            "after_move:filepath".to_string(),
            "--no-simulate".to_string(),
        ])
        .spawn()
        .expect("Failed to spawn yt-dlp");

    let mut video_path: String = String::from("");

    let result = tauri::async_runtime::spawn(async move {
        // read events such as stdout
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line) = event {
                video_path = line;
            }
        }

        if !Path::new(&downloads_folder).join(&video_path).exists() {
            return "Failed to download video";
        }

        let _ = handle
            .get_window("main")
            .unwrap()
            .emit(
                "video-downloaded",
                Payload {
                    path: video_path,
                    code: code,
                },
            )
            .expect("");

        return "";
    })
    .await;

    result.unwrap().to_string()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            show_help_window,
            show_youtube_modal,
            download_video
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
