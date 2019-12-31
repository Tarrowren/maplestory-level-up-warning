import { remote } from "electron";
import { IAppSettings } from "../appSettings";
const appSettings: IAppSettings = remote.require("../appSettings");

document.write('<audio src="' + appSettings.warningMusic + '" autoplay loop></audio>');