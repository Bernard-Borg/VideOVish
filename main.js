// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')

let mainWindow;

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minHeight: 480,
    minWidth: 480,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#252526',
      symbolColor: '#ffffff',
      height: 30
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'VideoPlayerIcon.ico')
  })

  // and load the index.html of the app.
  mainWindow.loadFile('mainWindow/index.html')

  mainWindow.on('closed', function() {
    app.quit();
  });

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  mainWindow = createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) mainWindow = createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// Show open file dialog, only allowing supported video files
ipcMain.handle("showDialog", (e) => {
    return dialog.showOpenDialog(
        {
            properties: ['openFile'],
            filters: [
                { name: 'Supported Video Files', extensions: ['mp4', 'ogg', 'webm'] }
            ]
        } 
    );
});

ipcMain.handle("getVideoArgs", (e) => {
  return process.argv;
});

ipcMain.handle("setFullscreen", (e, isFullscreen) => {
  mainWindow.setFullScreen(isFullscreen);
});

ipcMain.handle("showHelpModal", (e) => {
  const helpWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minHeight: 480,
    minWidth: 480,
    titleBarStyle: 'hidden',
    resizable: false,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    type: 'toolbar',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'VideoPlayerIcon.ico')
  })

  helpWindow.loadFile('helpWindow/help.html')

  helpWindow.on("blur", () => {
    helpWindow.destroy();
  })
});
