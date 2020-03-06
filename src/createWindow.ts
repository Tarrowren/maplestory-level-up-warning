import { BrowserWindow } from "electron";
import { IAppSettings } from "./appSettings";

export function createIndexWindow(settings: IAppSettings): number {
    const win = new BrowserWindow({
        title: "冒险岛升级提醒",
        width: 400,
        height: 300,
        fullscreenable: false,
        maximizable: false,
        resizable: false,
        show: false,
        alwaysOnTop: settings.alwaysOnTop,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadFile("../view/index.html");
    win.removeMenu();
    win.once("ready-to-show", () => {
        win.show();
    });
    win.on("close", e => {
        if (settings.minimizeToSystemTray) {
            e.preventDefault();
            win.hide();
        }
    });

    // win.webContents.openDevTools();
    return win.id;
}

export function createSettingWindow(indexWin: number): number {
    const win = new BrowserWindow({
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        transparent: true,
        modal: true,
        parent: BrowserWindow.fromId(indexWin),
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadFile("../view/setting.html");
    win.maximize();
    win.once("ready-to-show", () => {
        win.show();
    });

    return win.id;
}
