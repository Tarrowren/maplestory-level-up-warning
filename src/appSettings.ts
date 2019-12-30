import * as path from "path";
import * as fs from "fs";

let appSettingsPath: string = path.join(__dirname, "..", "appSettings.json");

interface IAppSettings {
    minimizeToSystemTray: boolean;
}

// 初始值
export let appSettings: IAppSettings = {
    minimizeToSystemTray: false
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
        appSettings = JSON.parse(appSettingsText);
    } catch (err) {
        console.error(err);
        fs.writeFile(appSettingsPath, JSON.stringify(appSettings, null, "    "), err => {
            if (err) {
                console.error(err);
            }
        });
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