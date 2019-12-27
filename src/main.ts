import { BrowserWindow, app, ipcMain } from "electron";
import * as path from "path";
const tarrowPixel = require("../build/Release/tarrow_pixel.node");

let mainWin: BrowserWindow | null;
let settingWin: BrowserWindow | null;

app.on("ready",
    createMainWindow
).on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
}).on("activate", () => {
    if (mainWin === null) {
        createMainWindow();
    }
});

function createMainWindow() {
    mainWin = new BrowserWindow({
        width: 400,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWin.loadFile(path.join(__dirname, "..", "view", "index.html"));
    mainWin.on("closed", () => {
        mainWin = null;
    });
}

ipcMain.on("openSettingWin", () => {
    if (mainWin === null) {
        return;
    }
    settingWin = new BrowserWindow({
        frame: false,
        fullscreen: true,
        alwaysOnTop: true,
        transparent: true,
        parent: mainWin,
        webPreferences: {
            nodeIntegration: true
        }
    });
    settingWin.loadFile(path.join(__dirname, "..", "view", "setting.html"));
    settingWin.on("closed", () => {
        settingWin = null;
    });
});

ipcMain.on("position", (e, position: { x: number, y: number }) => {
    mainWin?.webContents.send("rgb", position, getRgb(position.x, position.y));
});

function getRgb(x: number, y: number) {
    let c = tarrowPixel.getPixel(x, y);
    return {
        r: c & 0xff,
        g: c >> 8 & 0xff,
        b: c >> 16 & 0xff
    };
}