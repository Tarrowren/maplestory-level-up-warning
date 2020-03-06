import {
    app,
    BrowserWindow,
    Menu,
    MenuItemConstructorOptions,
    Tray,
    dialog,
    ipcMain
} from "electron";
import * as path from "path";
import { AppSettings } from "./appSettings";
import { createIndexWindow, createSettingWindow } from "./createWindow";
import { Pixel } from "node-win-pixel";

const settings = new AppSettings();
const icoPath = path.join(__dirname, "..", "resource", "app.ico");
let appTray: Tray;
let settingPosition: { x: number; y: number };

(async () => {
    if (!app.requestSingleInstanceLock()) {
        app.quit();
        return;
    }

    await app.whenReady();

    await settings.readAppSettings();

    appTray = new Tray(icoPath);
    appTray.setToolTip("冒险岛升级提醒");
    const trayMenu: MenuItemConstructorOptions[] = [
        {
            label: "设置警报音乐",
            click: async function() {
                const result = await dialog.showOpenDialog(
                    BrowserWindow.fromId(indexWin),
                    {
                        defaultPath: settings.appSettings.warningMusicPath,
                        properties: ["openFile"],
                        filters: [
                            {
                                name: "音频文件",
                                extensions: ["wav", "mp3", "mid"]
                            }
                        ]
                    }
                );
                if (result.canceled) {
                    return;
                }
                if (result.filePaths && result.filePaths.length > 0) {
                    settings.appSettings.warningMusicPath = result.filePaths[0];
                    settings.writeAppSettings();
                }
            }
        },
        {
            type: "separator"
        },
        {
            label: "置于顶层",
            type: "checkbox",
            checked: settings.appSettings.alwaysOnTop,
            click: function(item) {
                settings.appSettings.alwaysOnTop = item.checked;
                BrowserWindow.fromId(indexWin).setAlwaysOnTop(item.checked);
                settings.writeAppSettings();
            }
        },
        {
            label: "最小化到系统托盘",
            type: "checkbox",
            checked: settings.appSettings.minimizeToSystemTray,
            click: function(item) {
                settings.appSettings.minimizeToSystemTray = item.checked;
                settings.writeAppSettings();
            }
        },
        {
            type: "separator"
        },
        {
            label: "退出",
            click: function() {
                settings.appSettings.minimizeToSystemTray = false;
                app.quit();
            }
        }
    ];
    appTray.setContextMenu(Menu.buildFromTemplate(trayMenu));
    appTray.on("double-click", () => {
        BrowserWindow.fromId(indexWin).show();
    });

    const indexWin = createIndexWindow(settings.appSettings);

    app.on("window-all-closed", () => {
        app.quit();
    });

    let pixel: Pixel;

    ipcMain.on("openSettingWin", () => {
        const settingWin = createSettingWindow(indexWin);
        pixel = new Pixel();
    });

    ipcMain.on("closeSettingWin", () => {
        BrowserWindow.fromId(indexWin).webContents.send("settingDone");
    });

    // 鼠标位置
    ipcMain.on("position", (_e, position: { x: number; y: number }) => {
        settingPosition = position;
        BrowserWindow.fromId(indexWin).webContents.send(
            "rgb",
            position,
            pixel.getPixel(position.x, position.y)
        );
    });
})();
