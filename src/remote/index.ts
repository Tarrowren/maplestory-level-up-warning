import { ipcRenderer } from "electron";

let settingBtn = document.getElementById("setting") as HTMLButtonElement;
let showDiv = document.getElementById("show") as HTMLDivElement;

settingBtn.onclick = () => {
    ipcRenderer.send("openSettingWin");
};

ipcRenderer.on("rgb", (e, position: { x: number, y: number }, rgb: { r: number, g: number, b: number }) => {
    showDiv.innerText = `${position.x} ${position.y}`;
    showDiv.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
});