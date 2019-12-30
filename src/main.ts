import { BrowserWindow, app, ipcMain, Tray, Menu, MenuItemConstructorOptions, webContents } from "electron";
import { getPixel } from "../build/Release/tarrow_pixel.node";
import * as path from "path";
import { appSettingsInit, appSettings, appSettingsUpdate } from "./appSettings";

let mainWin: BrowserWindow | null;
let settingWin: BrowserWindow | null;
let appTray: Tray | null;
let settingPosition: { x: number, y: number };
let timeId: NodeJS.Timeout | null;

app.on("ready", async () => {
    await appSettingsInit();
    createMainWindow();
    createAppTray();
});

//#region 监听
// 打开设置窗口
ipcMain.on("openSettingWin", () => {
    createSettingWindow();
});

// 关闭设置窗口
ipcMain.on("closeSettingWin", () => {
    settingWin?.close();
    mainWin?.webContents.send("settingDone");
});

// 鼠标位置
ipcMain.on("position", (_e, position: { x: number, y: number }) => {
    settingPosition = position;
    mainWin?.webContents.send("rgb", position, getRgb(position.x, position.y));
});

// 开始检测
ipcMain.on("monitoring", () => {
    timeId = setTimeout(function onMonitor() {
        let rgb = getRgb(settingPosition.x, settingPosition.y);
        if (rgb.r === 0) {
            mainWin?.webContents.send("stopMonitoring");
            // 报警
            return;
        }
        timeId = setTimeout(onMonitor, 1000);
        mainWin?.webContents.send("rgb", settingPosition, rgb);//
    }, 1000);
});

// 停止检测
ipcMain.on("stopMonitoring", () => {
    if (timeId) {
        clearTimeout(timeId);
    }
});
//#endregion

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
        resizable: false,
        width: 400,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWin.removeMenu();
    mainWin.loadFile(path.join(__dirname, "..", "view", "index.html"));
    mainWin.on("close", e => {
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
    settingWin.maximize();
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