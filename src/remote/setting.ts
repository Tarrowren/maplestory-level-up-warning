import { ipcRenderer } from "electron";

document.onmousemove = e => {
    ipcRenderer.send("position", { x: e.screenX, y: e.screenY });
};

document.onclick = () => {
    ipcRenderer.send("closeSettingWin");
};