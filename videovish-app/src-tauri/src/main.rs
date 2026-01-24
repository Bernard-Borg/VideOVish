// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use fs_extra::{
    dir::get_size,
    file::{copy_with_progress, CopyOptions, TransitProcess},
};
use reqwest::Client;
use serde::Deserialize;
use std::{
    fs,
    path::{Path, PathBuf},
    process::{Command, Stdio},
};
use tauri::AppHandle;
use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};
use log::{error, info, warn};

#[tauri::command]
async fn show_help_window(handle: tauri::AppHandle) {
    if let Some(window) = handle.get_webview_window("help") {
        let _ = window.show();
        let _ = window.set_focus();
        return;
    }

    let _help_window = tauri::WebviewWindowBuilder::new(
        &handle,
        "help", /* the unique window label */
        tauri::WebviewUrl::App("help".into()),
    )
    .inner_size(1024.0, 700.0)
    .min_inner_size(480.0, 480.0)
    .skip_taskbar(true)
    .decorations(false)
    .transparent(true)
    .always_on_top(false)
    .build()
    .unwrap();
}

#[tauri::command]
async fn show_youtube_modal(handle: tauri::AppHandle) {
    if let Some(window) = handle.get_webview_window("youtube") {
        let _ = window.show();
        let _ = window.set_focus();
        return;
    }

    let _youtube_window = tauri::WebviewWindowBuilder::new(
        &handle,
        "youtube", /* the unique window label */
        tauri::WebviewUrl::App("youtube".into())
    )
    .inner_size(780.0, 400.0)
    .min_inner_size(480.0, 200.0)
    .resizable(true)
    .skip_taskbar(true)
    .decorations(false)
    .transparent(true)
    .always_on_top(false)
    .build()
    .unwrap();
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    path: String,
    code: String,
}

#[derive(Deserialize)]
struct GithubRelease {
    tag_name: String,
}

const YT_DLP_USER_AGENT: &str = "VideOVish";

fn videovish_base_dir() -> Result<PathBuf, String> {
    let cache_dir = dirs::cache_dir().ok_or("Unable to locate cache directory")?;
    let base_dir = cache_dir.join("videovish");
    fs::create_dir_all(&base_dir).map_err(|e| e.to_string())?;
    Ok(base_dir)
}

fn yt_dlp_asset_name() -> &'static str {
    if cfg!(target_os = "windows") {
        "yt-dlp.exe"
    } else if cfg!(target_os = "macos") {
        "yt-dlp_macos"
    } else {
        "yt-dlp"
    }
}

fn yt_dlp_cache_path() -> Result<PathBuf, String> {
    let tools_dir = videovish_base_dir()?.join("tools");
    fs::create_dir_all(&tools_dir).map_err(|e| e.to_string())?;

    let filename = if cfg!(target_os = "windows") {
        "yt-dlp.exe"
    } else {
        "yt-dlp"
    };

    Ok(tools_dir.join(filename))
}

fn read_local_version(path: &Path) -> Option<String> {
    Command::new(path)
        .arg("--version")
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .output()
        .ok()
        .and_then(|out| {
            if out.status.success() {
                Some(String::from_utf8_lossy(&out.stdout).trim().to_string())
            } else {
                None
            }
        })
}

async fn fetch_latest_version(client: &Client) -> Result<String, String> {
    let response = client
        .get("https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest")
        .header("User-Agent", YT_DLP_USER_AGENT)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("GitHub API error: {}", response.status()));
    }

    let release = response.json::<GithubRelease>().await.map_err(|e| e.to_string())?;
    Ok(release.tag_name)
}

async fn download_yt_dlp(client: &Client, dest: &Path) -> Result<(), String> {
    let asset = yt_dlp_asset_name();
    let url = format!("https://github.com/yt-dlp/yt-dlp/releases/latest/download/{asset}");

    let response = client
        .get(url)
        .header("User-Agent", YT_DLP_USER_AGENT)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("Failed to download yt-dlp: {}", response.status()));
    }

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;
    let tmp_path = dest.with_extension("download");

    fs::write(&tmp_path, &bytes).map_err(|e| e.to_string())?;

    if dest.exists() {
        fs::remove_file(dest).map_err(|e| e.to_string())?;
    }

    fs::rename(&tmp_path, dest).map_err(|e| e.to_string())?;

    #[cfg(unix)]
    {
        let mut perms = fs::metadata(dest).map_err(|e| e.to_string())?.permissions();
        perms.set_mode(0o755);
        fs::set_permissions(dest, perms).map_err(|e| e.to_string())?;
    }

    info!("yt-dlp updated: {}", dest.display());
    Ok(())
}

async fn ensure_yt_dlp() -> Result<PathBuf, String> {
    let path = yt_dlp_cache_path()?;
    let client = Client::builder().build().map_err(|e| e.to_string())?;
    info!("yt-dlp cache path: {}", path.display());

    let latest_version = fetch_latest_version(&client).await.ok();
    let local_version = if path.exists() { read_local_version(&path) } else { None };

    let needs_update =
        local_version.is_none() || (latest_version.is_some() && local_version.as_deref() != latest_version.as_deref());

    if needs_update {
        if let Some(version) = &latest_version {
            info!("yt-dlp update available: {}", version);
        } else {
            info!("yt-dlp update available");
        }
        if latest_version.is_none() && !path.exists() {
            return Err("Unable to download yt-dlp (GitHub unavailable)".to_string());
        }

        download_yt_dlp(&client, &path).await?;
    } else if let Some(version) = local_version {
        info!("yt-dlp up-to-date: {}", version);
    } else {
        info!("yt-dlp up-to-date");
    }

    Ok(path)
}

#[tauri::command]
async fn clear_cache(_handle: tauri::AppHandle) -> String {
    // Get path to cache directory
    let downloads_folder = match videovish_base_dir() {
        Ok(base_dir) => base_dir.join("cache"),
        Err(err) => return err,
    };

    // Create folder if it doesn't exist
    if !downloads_folder.is_dir() {
        fs::create_dir_all(&downloads_folder).expect("Could not create downloads folder");
        return String::from("");
    } else {
        let size = get_size(&downloads_folder).unwrap();

        if size <= 0 {
            return String::from("EMPTY");
        }

        fs::remove_dir_all(&downloads_folder).expect("Could not delete downloads folder");
        fs::create_dir_all(&downloads_folder).expect("Could not recreate downloads folder");

        info!("Clearing cache from: {}", downloads_folder.display());

        return String::from(format!("{}", size));
    }
}

#[tauri::command]
async fn download_video(
    handle: tauri::AppHandle,
    url: String,
    code: String,
    quality: String,
) -> String {
    // Get path to cache directory
    let downloads_folder = match videovish_base_dir() {
        Ok(base_dir) => base_dir.join("cache"),
        Err(err) => return err,
    };

    // Create folder if it doesn't exist
    if !downloads_folder.is_dir() {
        fs::create_dir_all(&downloads_folder).expect("Could not create downloads folder");
    }

    let mut vid_path: String = String::from("");
    let glob_pattern = format!("{}{}*{}*", downloads_folder.display(), std::path::MAIN_SEPARATOR, code);

    for entry in glob::glob(&glob_pattern).expect("Failed to read glob pattern") {
        match entry {
            Ok(path) => {
                vid_path = path.display().to_string();
                break;
            }
            Err(e) => warn!("glob error: {e:?}"),
        }
    }

    if vid_path.len() > 0 {
        info!("Getting video from cache");

        let _ = handle
            .get_webview_window("main")
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

    let quality_code;

    match quality.as_str() {
        "1" => quality_code = "137+251/136+251/135+251/134+251",
        "2" => quality_code = "136+251/135+251/134+251",
        "3" => quality_code = "135+251/134+251",
        "4" => quality_code = "134+251",
        "5" => quality_code = "251",
        _ => quality_code = "137+251/136+251/135+251/134+251",
    }

    let yt_dlp_path = match ensure_yt_dlp().await {
        Ok(path) => path,
        Err(err) => return err,
    };
    let command_args = vec![
        url,
        "-P".to_string(),
        downloads_folder.display().to_string(),
        "--extractor-args".to_string(),
        "youtube:skip=hls,dash;youtube:skip=translated_subs".to_string(),
        "-f".to_string(),
        quality_code.to_string(),
        "--print".to_string(),
        "after_move:filepath".to_string(),
        "--no-simulate".to_string(),
    ];

    let output = tauri::async_runtime::spawn_blocking(move || {
        Command::new(&yt_dlp_path)
            .args(command_args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
    })
    .await;

    let output = match output {
        Ok(Ok(out)) => out,
        Ok(Err(e)) => return format!("Failed to run yt-dlp: {e}"),
        Err(e) => return format!("Failed to run yt-dlp: {e}"),
    };

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut video_path = stdout
        .lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .last()
        .unwrap_or_default()
        .to_string();

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        if stderr.trim().is_empty() && !video_path.is_empty() {
            warn!("yt-dlp exited with error, but returned a file path: {}", video_path);
        } else {
            return if stderr.trim().is_empty() {
                "Failed to download video".to_string()
            } else {
                stderr.trim().to_string()
            };
        }
    }

    if video_path.is_empty() {
        let glob_pattern = format!("{}{}*{}*", downloads_folder.display(), std::path::MAIN_SEPARATOR, code);
        if let Ok(entries) = glob::glob(&glob_pattern) {
            for entry in entries.flatten() {
                video_path = entry.display().to_string();
                break;
            }
        }
    }

    if video_path.is_empty() {
        return "Failed to download video".to_string();
    }

    let path_obj = Path::new(&video_path);
    let resolved_path = if path_obj.exists() {
        video_path
    } else {
        let joined = downloads_folder.join(path_obj);
        if !joined.exists() {
            return "Failed to download video".to_string();
        }
        joined.display().to_string()
    };

    if resolved_path.is_empty() {
        return "Failed to download video".to_string();
    }

    let _ = handle
        .get_webview_window("main")
        .unwrap()
        .emit(
            "video-downloaded",
            Payload {
                path: resolved_path,
                code: code,
            },
        )
        .expect("");

    "".to_string()
}

#[tauri::command]
async fn save_youtube_video(_handle: AppHandle, code: String, path_to_save: String) -> String {
    // Get path to cache directory
    let downloads_folder = match videovish_base_dir() {
        Ok(base_dir) => base_dir.join("cache"),
        Err(err) => return err,
    };

    // Create folder if it doesn't exist
    if !downloads_folder.is_dir() {
        fs::create_dir_all(&downloads_folder).expect("Could not create downloads folder");
    }

    let mut vid_path: String = String::from("");
    let glob_pattern = format!("{}{}*{}*", downloads_folder.display(), std::path::MAIN_SEPARATOR, code);

    for entry in glob::glob(&glob_pattern).expect("Failed to read glob pattern") {
        match entry {
            Ok(path) => {
                vid_path = path.display().to_string();
                break;
            }
            Err(e) => warn!("glob error: {e:?}"),
        }
    }

    if vid_path.len() > 0 {
        let options = CopyOptions::new();
        let progress_handler =
            |process_info: TransitProcess| info!("Copied bytes: {}", process_info.copied_bytes);

        let _ = copy_with_progress(vid_path, path_to_save, &options, progress_handler);

        return String::from("");
    } else {
        return String::from("Currently playing video has been deleted");
    }
}

fn main() {
    let log_dir = videovish_base_dir()
        .unwrap_or_else(|_| std::env::temp_dir())
        .join("logs");
    let _ = fs::create_dir_all(&log_dir);

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(Target::new(TargetKind::Folder {
                    path: log_dir,
                    file_name: None,
                }))
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|_app| {
            tauri::async_runtime::spawn(async move {
                info!("yt-dlp updater starting");
                if let Err(err) = ensure_yt_dlp().await {
                    error!("yt-dlp update failed: {err}");
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            show_help_window,
            show_youtube_modal,
            download_video,
            clear_cache,
            save_youtube_video
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
