"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
var AppState;
(function (AppState) {
    AppState["NotSet"] = "\u672A\u8BBE\u7F6E\u63D0\u793A\u70B9\uFF01";
    AppState["SettingUp"] = "\u8BBE\u7F6E\u4E2D...";
    AppState["NotMonitor"] = "\u68C0\u6D4B\u672A\u5F00\u59CB\uFF01";
    AppState["Monitoring"] = "\u6B63\u5728\u68C0\u6D4B...";
})(AppState || (AppState = {}));
const settingBtn = document.getElementById("setting");
const monitoringBtn = document.getElementById("monitoring");
const showDiv = document.getElementById("show");
const tipSpan = document.getElementById("tip");
tipSpan.innerText = AppState.NotSet;
monitoringBtn.disabled = true;
settingBtn.onclick = () => {
    tipSpan.innerText = AppState.SettingUp;
    electron_1.ipcRenderer.send("openSettingWin");
};
monitoringBtn.onclick = () => {
    if (tipSpan.innerText === AppState.NotMonitor) {
        tipSpan.innerText = AppState.Monitoring;
        monitoringBtn.innerText = "停止检测";
        settingBtn.disabled = true;
        electron_1.ipcRenderer.send("monitoring");
    }
    else if (tipSpan.innerText === AppState.Monitoring) {
        tipSpan.innerText = AppState.NotMonitor;
        monitoringBtn.innerText = "开始检测";
        settingBtn.disabled = false;
        electron_1.ipcRenderer.send("stopMonitoring");
    }
    else {
        console.error("monitoring error! ");
    }
};
electron_1.ipcRenderer.on("rgb", (_e, position, rgb) => {
    showDiv.innerText = `x: ${position.x}, y: ${position.y}`;
    showDiv.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
});
electron_1.ipcRenderer.on("settingDone", () => {
    tipSpan.innerText = AppState.NotMonitor;
    monitoringBtn.disabled = false;
    settingBtn.innerText = "重新设置";
});
electron_1.ipcRenderer.on("stopMonitoring", () => {
    tipSpan.innerText = AppState.NotMonitor;
    monitoringBtn.innerText = "开始检测";
    settingBtn.disabled = false;
});
// const link = document.getElementsByTagName("link").item(1);
// if (!link) {
//     throw Error("link");
// }
// link.href = remote.nativeTheme.shouldUseDarkColors
//     ? "./css/dark.css"
//     : "./css/light.css";
// remote.nativeTheme.on("updated", () => {
//     link.href = remote.nativeTheme.shouldUseDarkColors
//         ? "./css/dark.css"
//         : "./css/light.css";
// });
//# sourceMappingURL=index.js.map