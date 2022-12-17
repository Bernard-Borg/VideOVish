const { ipcRenderer, webFrame } = require('electron')

window.onload = function () {
    webFrame.setZoomFactor(0.75);
    webFrame.setVisualZoomLevelLimits(1, 1);

    // Stops the default behaviour of zooming when pressing +
    document.addEventListener("keydown", function (event) {
        if (event.key === "+" && event.ctrlKey) {
            event.preventDefault();
        }
    });

    // User can press Escape to close the help popup
    document.addEventListener("keyup", async function (event) {
        if (event.key == "Escape") {
            await ipcRenderer.invoke("closeSecondaryWindow");
            return;
        }
    });
}