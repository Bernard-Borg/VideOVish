const { ipcRenderer, webFrame } = require('electron')

window.onload = function() {
    webFrame.setZoomFactor(0.75);
    webFrame.setVisualZoomLevelLimits(1, 1);

    document.addEventListener("keydown", function(event) {
        if (event.key === "+" && event.ctrlKey) {
            event.preventDefault();
        }
    });

    document.addEventListener("keyup", async function (event) {
        if (event.key == "Escape") {
            await ipcRenderer.invoke("closeSecondaryWindow");
            return;
        }
    });
}