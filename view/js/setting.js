"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
document.onmousemove = e => {
    electron_1.ipcRenderer.send("position", { x: e.screenX, y: e.screenY });
};
document.onclick = () => {
    electron_1.ipcRenderer.send("closeSettingWin");
    window.close();
};
//# sourceMappingURL=setting.js.map