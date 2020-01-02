import { BrowserWindow, app, ipcMain, Tray, Menu, MenuItemConstructorOptions, dialog } from "electron";
import { getPixel } from "../build/Release/tarrow_pixel.node";
import * as path from "path";
import { appSettingsInit, appSettings, appSettingsUpdate } from "./appSettings";

let mainWin: BrowserWindow | null;
let settingWin: BrowserWindow | null;
let warningWin: BrowserWindow | null;
let appTray: Tray | null;
let settingPosition: { x: number, y: number };
let timeId: NodeJS.Timeout | null;

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
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
            if (rgb.r !== 0 && rgb.g !== 0 && rgb.b === 0) {
                timeId = null;
                createWarningWindow();
                mainWin?.webContents.send("stopMonitoring");
                return;
            }
            timeId = setTimeout(onMonitor, 1000);
        }, 1000);
    });

    // 停止检测
    ipcMain.on("stopMonitoring", () => {
        if (timeId) {
            clearTimeout(timeId);
        }
        timeId = null;
    });
    //#endregion
}

function createAppTray() {
    let trayMenu: MenuItemConstructorOptions[] = [{
        label: "设置警报音乐",
        click: async function () {
            if (mainWin === null) {
                return;
            }
            if (timeId) {
                clearTimeout(timeId);
                timeId = null;
                mainWin?.webContents.send("stopMonitoring");
                await dialog.showMessageBox(mainWin, { title: "提示", message: "检测已被停止！", type: "warning" });
            }
            let result = await dialog.showOpenDialog(mainWin, { defaultPath: appSettings.warningMusic, properties: ["openFile"], filters: [{ name: "音频文件", extensions: ["wav", "mp3", "mid"] }] });
            if (result.canceled) {
                return;
            }
            if (result.filePaths && result.filePaths.length > 0) {
                appSettings.warningMusic = result.filePaths[0];
                await appSettingsUpdate();
            }
        }
    }, {
        type: "separator"
    }, {
        label: "置于顶层",
        type: "checkbox",
        checked: appSettings.alwaysOnTop,
        click: async function (item) {
            appSettings.alwaysOnTop = item.checked;
            mainWin?.setAlwaysOnTop(appSettings.alwaysOnTop);
            await appSettingsUpdate();
        }
    }, {
        label: "最小化到系统托盘",
        type: "checkbox",
        checked: appSettings.minimizeToSystemTray,
        click: async function (item) {
            appSettings.minimizeToSystemTray = item.checked;
            await appSettingsUpdate();
        }
    }, {
        type: "separator"
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
        title: "冒险岛升级提醒",
        fullscreenable: false,
        maximizable: false,
        resizable: false,
        alwaysOnTop: appSettings.alwaysOnTop,
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

function createWarningWindow() {
    if (mainWin === null) {
        return;
    }
    warningWin = new BrowserWindow({
        title: "警告",
        width: 400,
        height: 300,
        center: true,
        alwaysOnTop: true,
        resizable: false,
        modal: true,
        parent: mainWin,
        webPreferences: {
            nodeIntegration: true
        }
    });
    warningWin.removeMenu();
    warningWin.loadFile(path.join(__dirname, "..", "view", "warning.html"));
    warningWin.on("closed", () => {
        warningWin = null;
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