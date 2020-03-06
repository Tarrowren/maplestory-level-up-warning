import { remote, ipcRenderer } from "electron";

enum AppState {
    "NotSet" = "未设置提示点！",
    "SettingUp" = "设置中...",
    "NotMonitor" = "检测未开始！",
    "Monitoring" = "正在检测..."
}

const settingBtn = document.getElementById("setting") as HTMLButtonElement;
const monitoringBtn = document.getElementById(
    "monitoring"
) as HTMLButtonElement;
const showDiv = document.getElementById("show") as HTMLDivElement;
const tipSpan = document.getElementById("tip") as HTMLSpanElement;

tipSpan.innerText = AppState.NotSet;
monitoringBtn.disabled = true;

settingBtn.onclick = () => {
    tipSpan.innerText = AppState.SettingUp;
    ipcRenderer.send("openSettingWin");
};

monitoringBtn.onclick = () => {
    if (tipSpan.innerText === AppState.NotMonitor) {
        tipSpan.innerText = AppState.Monitoring;
        monitoringBtn.innerText = "停止检测";
        settingBtn.disabled = true;
        ipcRenderer.send("monitoring");
    } else if (tipSpan.innerText === AppState.Monitoring) {
        tipSpan.innerText = AppState.NotMonitor;
        monitoringBtn.innerText = "开始检测";
        settingBtn.disabled = false;
        ipcRenderer.send("stopMonitoring");
    } else {
        console.error("monitoring error! ");
    }
};

ipcRenderer.on(
    "rgb",
    (
        _e,
        position: { x: number; y: number },
        rgb: { r: number; g: number; b: number }
    ) => {
        showDiv.innerText = `x: ${position.x}, y: ${position.y}`;
        showDiv.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
);

ipcRenderer.on("settingDone", () => {
    tipSpan.innerText = AppState.NotMonitor;
    monitoringBtn.disabled = false;
    settingBtn.innerText = "重新设置";
});

ipcRenderer.on("stopMonitoring", () => {
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
