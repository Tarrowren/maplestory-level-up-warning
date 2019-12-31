import * as path from "path";
import * as fs from "fs";

let appSettingsPath: string = path.join(__dirname, "..", "appSettings.json");

export interface IAppSettings {
    alwaysOnTop: boolean;
    minimizeToSystemTray: boolean;
    warningMusic: string;
}

// 初始值
export let appSettings: IAppSettings = {
    alwaysOnTop: false,
    minimizeToSystemTray: false,
    warningMusic: path.join(__dirname, "..", "resource", "warning.wav")
};

export async function appSettingsInit() {
    try {
        const appSettingsText = await new Promise<string>((resolve, reject) => fs.readFile(appSettingsPath, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data.toString());
        }));
        let readSettings: IAppSettings = JSON.parse(appSettingsText);
        appSettingsCheckUp(readSettings);
        appSettings = readSettings;
    } catch (err) {
        console.error(err);
        appSettingsUpdate();
    }
}

function appSettingsCheckUp(settings: IAppSettings) {
    for (let a in appSettings) {
        if ((settings as any)[a] === undefined) {
            appSettingsUpdate();
            return;
        }
    }
}

export async function appSettingsUpdate() {
    try {
        await new Promise((_resolve, reject) => {
            fs.writeFile(appSettingsPath, JSON.stringify(appSettings, null, "    "), err => {
                if (err) {
                    reject(err);
                }
            });
        });
    } catch (err) {
        console.error(err);
    }
}