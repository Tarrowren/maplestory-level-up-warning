import * as fs from "fs";
import * as path from "path";

export interface IAppSettings {
    alwaysOnTop: boolean;
    minimizeToSystemTray: boolean;
    warningMusicPath: string;
}

export class AppSettings {
    private readonly appSettingsFilePath = path.join(
        __dirname,
        "..",
        "appSettings.json"
    );
    private readonly appDefaultSettings: IAppSettings = {
        alwaysOnTop: false,
        minimizeToSystemTray: false,
        warningMusicPath: path.join(__dirname, "..", "resource", "warning.wav")
    };
    appSettings = this.appDefaultSettings;

    async readAppSettings() {
        try {
            const buffer = await fs.promises.readFile(this.appSettingsFilePath);

            const settings = JSON.parse(buffer.toString());
            for (const p in this.appDefaultSettings) {
                if (settings[p] === undefined) {
                    throw Error("undefined");
                }
                if (
                    typeof settings[p] !==
                    typeof (this.appDefaultSettings as any)[p]
                ) {
                    throw Error("type");
                }
            }
            this.appSettings = settings;
        } catch (err) {
            console.error(err);
            this.writeAppSettings();
        }
    }

    async writeAppSettings() {
        try {
            await fs.promises.writeFile(
                this.appSettingsFilePath,
                JSON.stringify(this.appSettings, null, "    ")
            );
        } catch (err) {
            console.error(err);
        }
    }
}
