import { BrowserWindow, app, ipcMain, Tray, Menu, MenuItemConstructorOptions } from "electron";
import { getPixel } from "../build/Release/tarrow_pixel.node";
import * as path from "path";
import { appSettingsInit, appSettings, appSettingsUpdate } from "./appSettings";

let mainWin: BrowserWindow | null;
let settingWin: BrowserWindow | null;
let appTray: Tray | null;

app.on("ready", async () => {
    await appSettingsInit();
    createMainWindow();
    createAppTray();
});

ipcMain.on("openSettingWin", () => {
    createSettingWindow();
}).on("position", (e, position: { x: number, y: number }) => {
    mainWin?.webContents.send("rgb", position, getRgb(position.x, position.y));
});

function createAppTray() {
    var trayMenu: MenuItemConstructorOptions[] = [{
        label: "最小化到系统托盘",
        type: "checkbox",
        checked: appSettings.minimizeToSystemTray,
        click: async function (item) {
            appSettings.minimizeToSystemTray = item.checked;
            await appSettingsUpdate();
        }
    }, {
        label: "退出",
        click: function () {
            appSettings.minimizeToSystemTray = false;
            app.quit();
        }
    }];
    appTray = new Tray(path.join(__dirname, "..", "resource", "app.ico"));
    appTray.setToolTip("maplestory level up warning");
    appTray.setContextMenu(Menu.buildFromTemplate(trayMenu));
    appTray.on("double-click", () => {
        mainWin?.show();
    });
}

function createMainWindow() {
    mainWin = new BrowserWindow({
        fullscreenable: false,
        maximizable: false,
        width: 400,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWin.removeMenu();
    mainWin.loadFile(path.join(__dirname, "..", "view", "index.html"));
    mainWin.on("close", (e) => {
        if (appSettings.minimizeToSystemTray) {
            e.preventDefault();
            mainWin?.hide();
        }
    }).on("closed", () => {
        mainWin = null;
    });
}

function createSettingWindow() {
    if (mainWin === null) {
        return;
    }
    settingWin = new BrowserWindow({
        frame: false,
        fullscreen: true,
        alwaysOnTop: true,
        resizable: false,
        transparent: true,
        modal: true,
        parent: mainWin,
        webPreferences: {
            nodeIntegration: true
        }
    });
    settingWin.loadFile(path.join(__dirname, "..", "view", "setting.html"));
    settingWin.on("closed", () => {
        settingWin = null;
    });
}

function getRgb(x: number, y: number) {
    let c = getPixel(x, y);
    return {
        r: c & 0xff,
        g: c >> 8 & 0xff,
        b: c >> 16 & 0xff
    };
}