// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')

let mainWindow;

function createWindow () {
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

  mainWindow.loadFile('html/index.html')

  mainWindow.on('closed', function() {
    app.quit();
  });

  return mainWindow;
}

app.whenReady().then(() => {
  mainWindow = createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) mainWindow = createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// Show open file dialog, only allowing supported video files
ipcMain.handle("showDialog", (e, supportedExtensions) => {
    return dialog.showOpenDialog(
        {
            properties: ['openFile'],
            filters: [
                { name: 'Supported Video Files', extensions: supportedExtensions }
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

  helpWindow.loadFile('html/help.html')

  helpWindow.on("blur", () => {
    helpWindow.destroy();
  })
});
